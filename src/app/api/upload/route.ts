import Anthropic from "@anthropic-ai/sdk";
import { extractText, getDocumentProxy } from "unpdf";
import mammoth from "mammoth";
import type { MindMapNode, StudyDocument } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 300;

const MAX_FILE_BYTES = 25 * 1024 * 1024; // v1 cap; chunked 2 GB uploads replace this later
const MAX_CONTEXT_CHARS = 120_000; // ~30-40K tokens sent to the model

interface Extraction {
  text: string;
  pages: number;
  fileType: string;
}

async function extractFromFile(file: File): Promise<Extraction> {
  const name = file.name.toLowerCase();
  const buf = new Uint8Array(await file.arrayBuffer());

  if (name.endsWith(".pdf")) {
    const pdf = await getDocumentProxy(buf);
    const { totalPages, text } = await extractText(pdf, { mergePages: true });
    return { text, pages: totalPages, fileType: "PDF" };
  }
  if (name.endsWith(".docx")) {
    const { value } = await mammoth.extractRawText({ buffer: Buffer.from(buf) });
    return { text: value, pages: Math.max(1, Math.round(value.length / 1800)), fileType: "DOCX" };
  }
  if (name.endsWith(".txt") || name.endsWith(".md") || name.endsWith(".markdown")) {
    const text = new TextDecoder("utf-8").decode(buf);
    return {
      text,
      pages: Math.max(1, Math.round(text.length / 1800)),
      fileType: name.endsWith(".txt") ? "TXT" : "Markdown",
    };
  }
  throw new Error("unsupported_type");
}

/* Structured-output schema. Mind map nodes are flat (parentId) because
 * recursive schemas aren't supported; the tree is rebuilt server-side. */
const cited = {
  type: "object",
  properties: {
    page: { type: "integer" },
    snippet: { type: "string" },
  },
  required: ["page", "snippet"],
  additionalProperties: false,
} as const;

const artifactSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    language: { type: "string" },
    summarySections: {
      type: "array",
      items: {
        type: "object",
        properties: { heading: { type: "string" }, content: { type: "string" }, citation: cited },
        required: ["heading", "content", "citation"],
        additionalProperties: false,
      },
    },
    keyPoints: {
      type: "array",
      items: {
        type: "object",
        properties: { text: { type: "string" }, citation: cited },
        required: ["text", "citation"],
        additionalProperties: false,
      },
    },
    flashcards: {
      type: "array",
      items: {
        type: "object",
        properties: {
          front: { type: "string" },
          back: { type: "string" },
          difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
        },
        required: ["front", "back", "difficulty"],
        additionalProperties: false,
      },
    },
    quiz: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["mcq", "true_false", "fill_blank"] },
          difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
          question: { type: "string" },
          options: { type: "array", items: { type: "string" } },
          answerIndex: { type: "integer" },
          answerText: { type: "string" },
          explanation: { type: "string" },
        },
        required: ["type", "difficulty", "question", "options", "answerIndex", "answerText", "explanation"],
        additionalProperties: false,
      },
    },
    terms: {
      type: "array",
      items: {
        type: "object",
        properties: {
          term: { type: "string" },
          definition: { type: "string" },
          kind: { type: "string", enum: ["concept", "keyword", "person", "location", "date", "formula"] },
          citation: cited,
        },
        required: ["term", "definition", "kind", "citation"],
        additionalProperties: false,
      },
    },
    timeline: {
      type: "array",
      items: {
        type: "object",
        properties: {
          year: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
        },
        required: ["year", "title", "description"],
        additionalProperties: false,
      },
    },
    mindmapNodes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          label: { type: "string" },
          color: { type: "string" },
          parentId: { type: "string" },
        },
        required: ["id", "label", "color", "parentId"],
        additionalProperties: false,
      },
    },
  },
  required: [
    "title",
    "language",
    "summarySections",
    "keyPoints",
    "flashcards",
    "quiz",
    "terms",
    "timeline",
    "mindmapNodes",
  ],
  additionalProperties: false,
} as const;

interface FlatNode {
  id: string;
  label: string;
  color: string;
  parentId: string;
}

function buildMindMapTree(flat: FlatNode[]): MindMapNode {
  const byId = new Map<string, MindMapNode>();
  for (const n of flat) byId.set(n.id, { id: n.id, label: n.label, color: n.color, children: [] });
  let root: MindMapNode | null = null;
  for (const n of flat) {
    const node = byId.get(n.id)!;
    const parent = n.parentId ? byId.get(n.parentId) : undefined;
    if (parent && parent !== node) parent.children!.push(node);
    else root ??= node;
  }
  return root ?? { id: "root", label: "Document", color: "#3b63f6", children: [] };
}

async function generateWithClaude(rules: string, documentTurn: string): Promise<string> {
  const client = new Anthropic();
  const stream = client.messages.stream({
    model: "claude-opus-4-8",
    max_tokens: 24000,
    thinking: { type: "adaptive" },
    output_config: { format: { type: "json_schema", schema: artifactSchema } },
    system: rules,
    messages: [{ role: "user", content: documentTurn }],
  });
  const message = await stream.finalMessage();
  return message.content.find((b) => b.type === "text")?.text ?? "{}";
}

/** Free-tier fallback: Google Gemini via REST (aistudio.google.com keys need
 *  no billing). JSON mode + an explicit shape spec replaces the strict schema
 *  used on the Claude path. */
async function generateWithGemini(rules: string, documentTurn: string): Promise<string> {
  const shapeSpec =
    'Respond with a single JSON object exactly matching this TypeScript shape (no markdown, no extra keys): { "title": string, "language": string, "summarySections": {"heading": string, "content": string, "citation": {"page": number, "snippet": string}}[], "keyPoints": {"text": string, "citation": {"page": number, "snippet": string}}[], "flashcards": {"front": string, "back": string, "difficulty": "easy"|"medium"|"hard"}[], "quiz": {"type": "mcq"|"true_false"|"fill_blank", "difficulty": "easy"|"medium"|"hard", "question": string, "options": string[], "answerIndex": number, "answerText": string, "explanation": string}[], "terms": {"term": string, "definition": string, "kind": "concept"|"keyword"|"person"|"location"|"date"|"formula", "citation": {"page": number, "snippet": string}}[], "timeline": {"year": string, "title": string, "description": string}[], "mindmapNodes": {"id": string, "label": string, "color": string, "parentId": string}[] }';

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: `${rules}\n\n${shapeSpec}` }] },
        contents: [{ role: "user", parts: [{ text: documentTurn }] }],
        generationConfig: { responseMimeType: "application/json", maxOutputTokens: 24576 },
      }),
    }
  );
  if (!res.ok) throw new Error(`gemini_${res.status}`);
  const data = await res.json();
  const parts: { text?: string }[] = data.candidates?.[0]?.content?.parts ?? [];
  return parts.map((p) => p.text ?? "").join("") || "{}";
}

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file");
  const outputLanguage = (form.get("outputLanguage") as string) || "";

  if (!(file instanceof File)) {
    return Response.json({ error: "no_file", message: "No file provided." }, { status: 400 });
  }
  if (file.size > MAX_FILE_BYTES) {
    return Response.json(
      { error: "too_large", message: "This version accepts files up to 25 MB." },
      { status: 413 }
    );
  }

  let extraction: Extraction;
  try {
    extraction = await extractFromFile(file);
  } catch (e) {
    const unsupported = e instanceof Error && e.message === "unsupported_type";
    return Response.json(
      {
        error: unsupported ? "unsupported_type" : "extraction_failed",
        message: unsupported
          ? "Supported types right now: PDF, DOCX, TXT, Markdown."
          : "Could not read this file — it may be corrupted or a scanned image (OCR is not enabled yet).",
      },
      { status: 422 }
    );
  }

  const cleanText = extraction.text.replace(/\s+\n/g, "\n").trim();
  if (cleanText.length < 100) {
    return Response.json(
      {
        error: "no_text",
        message:
          "No readable text found in this file. Scanned/image-only documents need OCR, which is not enabled yet.",
      },
      { status: 422 }
    );
  }

  const hasClaude = !!process.env.ANTHROPIC_API_KEY;
  const hasGemini = !!process.env.GEMINI_API_KEY;

  if (!hasClaude && !hasGemini) {
    return Response.json(
      {
        error: "missing_api_key",
        message:
          "Text was extracted successfully (" +
          cleanText.length.toLocaleString() +
          " characters), but generating study material requires an AI key. Add ANTHROPIC_API_KEY, or a free GEMINI_API_KEY from aistudio.google.com, to .env.local (or your Vercel project settings) and try again.",
      },
      { status: 422 }
    );
  }

  const truncated = cleanText.length > MAX_CONTEXT_CHARS;
  const context = truncated ? cleanText.slice(0, MAX_CONTEXT_CHARS) : cleanText;

  const generationRules =
    "You are the MindFlow AI study-material generator. From the document text, produce: a clear title; the detected language name; 3-6 summary sections; 5-8 key points; 8-14 flashcards; 5-8 quiz questions (mix mcq/true_false/fill_blank — for non-mcq set options to the shown choices or [] and use answerIndex/answerText appropriately, with answerIndex -1 and answerText \"\" when unused); 6-12 key terms of varied kinds; a timeline ONLY if the document contains real chronological events (else []); and a mind map as flat nodes (one root with parentId \"\", 3-6 branches, depth ≤ 3, hex colors per branch). Citations: page = best-estimate page number, snippet = short verbatim quote from the text. Everything must come from the document — never invent content." +
    (outputLanguage ? ` Write all generated text in ${outputLanguage}.` : " Write in the document's own language.");
  const documentTurn = `<document pages="${extraction.pages}" truncated="${truncated}">\n${context}\n</document>`;

  let jsonText: string;
  try {
    jsonText = hasClaude
      ? await generateWithClaude(generationRules, documentTurn)
      : await generateWithGemini(generationRules, documentTurn);
  } catch {
    return Response.json(
      { error: "generation_failed", message: "The AI generation failed. Please try again." },
      { status: 502 }
    );
  }

  let artifacts;
  try {
    artifacts = JSON.parse(jsonText);
  } catch {
    return Response.json(
      { error: "bad_output", message: "The model returned unreadable output. Please retry." },
      { status: 502 }
    );
  }

  const doc: StudyDocument = {
    id: `doc-${Date.now().toString(36)}`,
    title: artifacts.title || file.name,
    fileName: file.name,
    fileType: extraction.fileType,
    sizeBytes: file.size,
    pages: extraction.pages,
    language: artifacts.language || "Unknown",
    status: "ready",
    uploadedAt: new Date().toISOString(),
    summarySections: artifacts.summarySections ?? [],
    keyPoints: artifacts.keyPoints ?? [],
    mindMap: buildMindMapTree(artifacts.mindmapNodes ?? []),
    flashcards: (artifacts.flashcards ?? []).map(
      (c: Omit<StudyDocument["flashcards"][number], "id">, i: number) => ({ ...c, id: `f${i}` })
    ),
    quiz: (artifacts.quiz ?? []).map(
      (q: Omit<StudyDocument["quiz"][number], "id">, i: number) => ({ ...q, id: `q${i}` })
    ),
    terms: artifacts.terms ?? [],
    timeline: artifacts.timeline ?? [],
    tables: [],
  };

  return Response.json({ document: doc, truncated });
}
