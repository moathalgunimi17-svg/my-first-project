import Anthropic from "@anthropic-ai/sdk";
import { demoDocument } from "@/lib/demo-data";
import type { StudyDocument } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 120;

interface IncomingMessage {
  role: "user" | "assistant";
  content: string;
}

/** Grounding context assembled from the document's processed content. In
 *  production this is replaced by top-k retrieval over the vector index. */
function buildDocumentContext(d: StudyDocument): string {
  return [
    `Title: ${d.title} (${d.pages} pages, ${d.language})`,
    "",
    "== Summary sections ==",
    ...d.summarySections.map((s) => `[p. ${s.citation.page}] ${s.heading}: ${s.content}`),
    "",
    "== Key points ==",
    ...d.keyPoints.map((k) => `[p. ${k.citation.page}] ${k.text}`),
    "",
    "== Glossary ==",
    ...d.terms.map((t) => `[p. ${t.citation.page}] ${t.term}: ${t.definition}`),
    "",
    "== Timeline ==",
    ...d.timeline.map((e) => `${e.year}: ${e.title} — ${e.description}`),
  ].join("\n");
}

function buildSystemPrompt(d: StudyDocument): string {
  return `You are MindFlow AI, a study assistant. Answer questions using ONLY the document excerpts provided below. Cite the source page as (p. N) whenever you state a fact that has one. If the answer is not in the excerpts, say so plainly and suggest what section of the document might cover it — never invent content. Match the language of the user's question (e.g. answer in Arabic if asked in Arabic). Keep answers focused and readable.

<document>
${buildDocumentContext(d)}
</document>`;
}

/** Fallback used when ANTHROPIC_API_KEY is not configured: streams a canned,
 *  document-grounded answer so the product remains fully demoable. */
function demoStream(question: string): ReadableStream<Uint8Array> {
  const q = question.toLowerCase();
  let answer: string;
  if (q.includes("conclusion")) {
    answer =
      "The book's conclusion is that deep learning's trajectory is governed by scaling laws: test loss falls as a predictable power law in model size, data, and compute (p. 283). Combined with the transformer's parallel training (p. 254), this explains why the field moved from hand-designed architectures to ever-larger models trained on more data.";
  } else if (q.includes("attention") || q.includes("transformer")) {
    answer =
      "Attention lets every token compute a weighted combination over every other token — simultaneously (p. 254). This removed the sequential bottleneck of recurrent networks (p. 251), so training parallelizes across the whole sequence and long-range dependencies get a direct connection. That is why transformers replaced RNNs.";
  } else if (q.includes("cnn") || q.includes("compare")) {
    answer =
      "CNNs exploit spatial locality: one filter slides across the whole image, so parameters are shared and local features are detected anywhere (p. 109). Transformers instead use global self-attention — every position can attend to every other (p. 254). The extracted comparison table on p. 231 summarizes it: CNNs have weak long-range handling but few parameters; transformers connect any two positions directly at higher parameter cost.";
  } else {
    answer =
      "Based on the document: a neural network is a differentiable function whose parameters are tuned by gradient descent against a loss (p. 31), with backpropagation — the chain rule organized for reuse — computing all gradients in one backward pass (p. 47). Depth matters because layers compose simple features into abstract ones (p. 121). Ask me about a specific chapter, concept, or page for more detail.\n\n(Demo mode — set ANTHROPIC_API_KEY to enable live answers from Claude.)";
  }

  const encoder = new TextEncoder();
  const words = answer.split(" ");
  let i = 0;
  return new ReadableStream({
    async pull(controller) {
      if (i >= words.length) {
        controller.close();
        return;
      }
      controller.enqueue(encoder.encode(words[i] + (i < words.length - 1 ? " " : "")));
      i++;
      await new Promise((r) => setTimeout(r, 24));
    },
  });
}

/** Free-tier fallback: streams grounded answers from Google Gemini (keys
 *  from aistudio.google.com require no billing). */
async function geminiChatStream(
  systemPrompt: string,
  messages: IncomingMessage[]
): Promise<ReadableStream<Uint8Array>> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: messages.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        })),
        generationConfig: { maxOutputTokens: 4096 },
      }),
    }
  );
  if (!res.ok || !res.body) throw new Error(`gemini_${res.status}`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) {
        controller.close();
        return;
      }
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        try {
          const chunk = JSON.parse(line.slice(6));
          const parts: { text?: string }[] = chunk.candidates?.[0]?.content?.parts ?? [];
          const text = parts.map((p) => p.text ?? "").join("");
          if (text) controller.enqueue(encoder.encode(text));
        } catch {
          // Ignore keep-alives and partial frames.
        }
      }
    },
    cancel() {
      reader.cancel();
    },
  });
}

export async function POST(req: Request) {
  const { messages, document } = (await req.json()) as {
    messages: IncomingMessage[];
    document?: StudyDocument;
  };
  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response("messages required", { status: 400 });
  }

  // Uploaded documents send their processed content along; the demo document
  // is the fallback so the workspace works before any upload.
  const doc = document?.summarySections?.length ? document : demoDocument;

  const lastUser = [...messages].reverse().find((m) => m.role === "user");

  if (!process.env.ANTHROPIC_API_KEY) {
    if (process.env.GEMINI_API_KEY) {
      try {
        return new Response(await geminiChatStream(buildSystemPrompt(doc), messages), {
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
      } catch {
        return new Response("The AI service is unavailable right now. Please try again.", {
          status: 502,
        });
      }
    }
    return new Response(demoStream(lastUser?.content ?? ""), {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const client = new Anthropic();

  const stream = client.messages.stream({
    model: "claude-opus-4-8",
    max_tokens: 4096,
    thinking: { type: "adaptive" },
    system: [
      {
        type: "text",
        text: buildSystemPrompt(doc),
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: messages.map(({ role, content }) => ({ role, content })),
  });

  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      stream.on("text", (delta) => controller.enqueue(encoder.encode(delta)));
      stream.on("end", () => controller.close());
      stream.on("error", (err) => controller.error(err));
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
