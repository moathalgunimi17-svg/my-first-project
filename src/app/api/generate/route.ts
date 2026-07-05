import Anthropic from "@anthropic-ai/sdk";
import { demoDocument } from "@/lib/demo-data";

export const runtime = "nodejs";
export const maxDuration = 300;

type Artifact = "summary" | "flashcards" | "quiz" | "mindmap";

const prompts: Record<Artifact, string> = {
  summary:
    "Produce a structured summary as JSON: {sections: [{heading, content, citation: {page, snippet}}]}. Every section must cite a page.",
  flashcards:
    "Produce study flashcards as JSON: {cards: [{front, back, difficulty: 'easy'|'medium'|'hard'}]}. 8-15 cards covering the core concepts.",
  quiz:
    "Produce a quiz as JSON: {questions: [{type: 'mcq'|'true_false'|'fill_blank', difficulty, question, options?, answerIndex?, answerText?, explanation}]}. Mix types and difficulties.",
  mindmap:
    "Produce a mind map as JSON: {root: {id, label, color, children: [...]}}, max depth 3, using hex colors per branch.",
};

/**
 * Regenerates a study artifact (summary / flashcards / quiz / mind map) for a
 * document. Without an API key the pre-generated demo artifact is returned so
 * the UI stays fully functional.
 */
export async function POST(req: Request) {
  const { artifact, outputLanguage } = (await req.json()) as {
    artifact: Artifact;
    outputLanguage?: string;
  };

  if (!prompts[artifact]) {
    return Response.json({ error: "unknown artifact" }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    const demo: Record<Artifact, unknown> = {
      summary: { sections: demoDocument.summarySections },
      flashcards: { cards: demoDocument.flashcards },
      quiz: { questions: demoDocument.quiz },
      mindmap: { root: demoDocument.mindMap },
    };
    return Response.json({ source: "demo", data: demo[artifact] });
  }

  const client = new Anthropic();
  const context = demoDocument.summarySections
    .map((s) => `[p. ${s.citation.page}] ${s.heading}: ${s.content}`)
    .join("\n");

  const response = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 8192,
    thinking: { type: "adaptive" },
    system:
      "You generate study artifacts from document content. Respond with valid JSON only, no prose. " +
      (outputLanguage ? `Write all user-facing text in ${outputLanguage}.` : ""),
    messages: [
      {
        role: "user",
        content: `<document>\n${context}\n</document>\n\n${prompts[artifact]}`,
      },
    ],
  });

  const text = response.content.find((b) => b.type === "text")?.text ?? "{}";
  try {
    return Response.json({ source: "claude", data: JSON.parse(text) });
  } catch {
    return Response.json({ error: "model returned non-JSON output" }, { status: 502 });
  }
}
