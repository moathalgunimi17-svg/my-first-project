import type { StudyDocument } from "./types";

/**
 * Client-side persistence for uploaded documents. Generated StudyDocuments
 * are kept in localStorage so the workspace survives reloads without a
 * database; swapping this for Prisma/Postgres only changes this module.
 */
const STORAGE_KEY = "mindflow-documents";

function readAll(): Record<string, StudyDocument> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function listStoredDocuments(): StudyDocument[] {
  return Object.values(readAll()).sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );
}

export function getStoredDocument(id: string): StudyDocument | null {
  return readAll()[id] ?? null;
}

export function saveDocument(doc: StudyDocument): void {
  const all = readAll();
  all[doc.id] = doc;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // Storage full: drop the oldest documents and retry once.
    const docs = Object.values(all).sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
    const trimmed = Object.fromEntries(docs.slice(0, 3).map((d) => [d.id, d]));
    trimmed[doc.id] = doc;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  }
}
