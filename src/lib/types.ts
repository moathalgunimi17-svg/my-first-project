export type DocumentStatus = "processing" | "ready" | "failed";

export type SummaryType =
  | "quick"
  | "detailed"
  | "executive"
  | "academic"
  | "business"
  | "bullet"
  | "children"
  | "technical"
  | "simple";

export interface Citation {
  page: number;
  snippet: string;
}

export interface SummarySection {
  heading: string;
  content: string;
  citation: Citation;
}

export interface KeyPoint {
  text: string;
  citation: Citation;
}

export interface MindMapNode {
  id: string;
  label: string;
  color: string;
  children?: MindMapNode[];
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface QuizQuestion {
  id: string;
  type: "mcq" | "true_false" | "fill_blank";
  difficulty: "easy" | "medium" | "hard";
  question: string;
  options?: string[];
  answerIndex?: number;
  answerText?: string;
  explanation: string;
}

export interface Term {
  term: string;
  definition: string;
  kind: "concept" | "keyword" | "person" | "location" | "date" | "formula";
  citation: Citation;
}

export interface TimelineEvent {
  year: string;
  title: string;
  description: string;
}

export interface ExtractedTable {
  title: string;
  columns: string[];
  rows: string[][];
  page: number;
}

export interface StudyDocument {
  id: string;
  title: string;
  fileName: string;
  fileType: string;
  sizeBytes: number;
  pages: number;
  language: string;
  status: DocumentStatus;
  uploadedAt: string;
  summarySections: SummarySection[];
  keyPoints: KeyPoint[];
  mindMap: MindMapNode;
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  terms: Term[];
  timeline: TimelineEvent[];
  tables: ExtractedTable[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
}
