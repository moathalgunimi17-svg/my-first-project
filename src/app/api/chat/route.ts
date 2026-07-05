import Anthropic from "@anthropic-ai/sdk";
import { demoDocument } from "@/lib/demo-data";

export const runtime = "nodejs";
export const maxDuration = 120;

interface IncomingMessage {
  role: "user" | "assistant";
  content: string;
}

/** Grounding context assembled from the document's processed content. In
 *  production this is replaced by top-k retrieval over the vector index. */
function buildDocumentContext(): string {
  const d = demoDocument;
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

const SYSTEM_PROMPT = `You are MindFlow AI, a study assistant. Answer questions using ONLY the document excerpts provided below. Cite the source page as (p. N) whenever you state a fact that has one. If the answer is not in the excerpts, say so plainly and suggest what section of the document might cover it — never invent content. Match the language of the user's question (e.g. answer in Arabic if asked in Arabic). Keep answers focused and readable.

<document>
${buildDocumentContext()}
</document>`;

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

export async function POST(req: Request) {
  const { messages } = (await req.json()) as { messages: IncomingMessage[] };
  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response("messages required", { status: 400 });
  }

  const lastUser = [...messages].reverse().find((m) => m.role === "user");

  if (!process.env.ANTHROPIC_API_KEY) {
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
        text: SYSTEM_PROMPT,
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
