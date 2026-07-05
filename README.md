# MindFlow AI

**Understand any document in minutes.**

MindFlow AI is an AI study platform: upload a document in any language and instantly get summaries with smart page citations, an interactive mind map, flashcards, quizzes, key terms, a timeline, extracted tables, an AI podcast/video studio, and a chat grounded strictly in your file.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000. The app ships with a fully-functional **demo mode** — a pre-processed 312-page textbook — so every screen works without any configuration.

To enable live AI (document chat and artifact regeneration powered by Claude):

```bash
cp .env.example .env.local
# add your key
ANTHROPIC_API_KEY=sk-ant-...
```

## What's inside

| Area | Route | Highlights |
|---|---|---|
| Landing page | `/` | Animated hero, interactive upload zone, features, pricing, FAQ, testimonials |
| Auth | `/login`, `/signup` | Email + Google/Apple/GitHub UI (Supabase-Auth-ready) |
| Dashboard | `/dashboard` | Recent uploads, storage & AI-credit meters, study stats, simulated resumable upload |
| Document workspace | `/dashboard/documents/[id]` | 9 tabs: Summary (9 styles + citations), Mind Map (pan/zoom/collapse, PNG & SVG export), Flashcards (3D flip, difficulty filter, CSV export), Quiz (MCQ / true-false / fill-blank with scoring), AI Chat (streaming), Key Terms, Timeline, Tables (CSV export), AI Studio (podcast, video, knowledge graph, study plan) |
| Workspaces | `/dashboard/workspaces` | Shared team libraries |
| Bookmarks | `/dashboard/bookmarks` | Starred content across the library |
| Settings | `/dashboard/settings` | Profile, language (EN/AR with full RTL), billing, security/2FA, API keys, notifications |
| Admin | `/dashboard/admin` | Users, usage metrics, system logs, prompt management |

## Architecture

- **Next.js 16 (App Router) + TypeScript + Tailwind CSS 4** — SSR shell with client components per feature, code-split per route.
- **AI layer** — `src/app/api/chat/route.ts` streams grounded answers from Claude (`claude-opus-4-8`, adaptive thinking, prompt caching on the document context); `src/app/api/generate/route.ts` regenerates summaries/flashcards/quizzes/mind maps as JSON in any output language. Both fall back to demo content when no API key is set.
- **Domain model** — `src/lib/types.ts` defines the artifact shapes the AI pipeline produces; `src/lib/demo-data.ts` is a complete example.
- **i18n** — lightweight dictionary provider (`src/lib/i18n.ts`) with automatic `dir="rtl"` switching for Arabic.
- **Theming** — class-based dark/light mode persisted to `localStorage`; glassmorphism design tokens in `globals.css`.

### Production integration points

The UI and API contracts are designed for the full pipeline described in the product spec:

- **Uploads**: swap the simulated upload for UploadThing/S3 multipart with resumable chunks (the progress UI already reflects chunk → OCR → embedding stages).
- **Extraction & OCR**: background jobs (e.g. queue + workers) writing `StudyDocument` records to Postgres via Prisma.
- **Retrieval**: replace `buildDocumentContext()` in the chat route with top-k vector search over document chunks.
- **Auth & billing**: the auth screens are laid out for Supabase Auth; settings/billing for Stripe.

## Scripts

```bash
npm run dev     # develop
npm run build   # production build
npm run start   # serve production build
npm run lint    # eslint
```
