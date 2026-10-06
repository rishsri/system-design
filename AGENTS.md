# Agent instructions for Forma

These instructions apply to this repository. Follow the current user's instructions when they change or override this guidance.

## Start here, before editing

1. Read `docs/SYSTEM_DESIGN_WRITING_GUIDE.md` in full before authoring or revising any learning content, diagram, or walkthrough.
2. Read `README.md` and `src/types.ts` to understand the app and its content schema.
3. Inspect `git status --short` and relevant diffs. Preserve unrelated user changes.
4. Read the relevant entries in `src/data/questions.json` and `src/data/walkthroughs.json`. Use the URL-shortener lesson as a reference for depth and progression, not as a template to copy generic paragraphs into other topics.
5. Identify the requested change and source material, then implement it. Ask only for genuinely missing source information or material scope decisions.

Do not skip the writing guide because a task looks like a small content edit. For unrelated tooling or configuration work, read the startup documents once, then use only the relevant rules.

## Current product direction

Forma is a simple, reading-first system design learning app:

- A straightforward system list and searchable library.
- A detail page with a left table of contents, readable content, architecture diagrams, then interview questions and revision notes.
- Beginner-friendly Hinglish explanations; technical terms remain in English.
- Simple black-and-white light and dark modes.
- Content and animation steps live in JSON; reusable React components render them.
- Framer Motion explains relevant state changes and request flows; Mermaid shows architecture.

The user simplified the original broad application brief. Do not reintroduce Add/Edit Question forms, admin dashboards, import/export controls, bookmarks, progress panels, accounts, or browser-stored lesson content unless explicitly requested again. Theme preference may remain in browser storage. Do not redesign the reading interface as part of a content-only request.

## Content contract

- `src/data/questions.json`: lesson and interview data.
- `src/data/walkthroughs.json`: animation nodes and ordered steps.
- `src/types.ts`: authoritative TypeScript shape and allowed values.
- `src/content.ts`: JSON loading adapter.
- `src/main.tsx`: current shared rendering and navigation.
- `src/style.css`: monochrome responsive reading styles.

Add a question by adding data, not a custom React page. Keep IDs and slugs stable, unique, and descriptive. A system-design entry's `related` array determines its inline interview questions and their order. Ensure referenced IDs resolve. Standalone question routes should continue to work.

For source-based requests, read the supplied source first. If it cannot be accessed and its contents are not already available in the conversation or repository, ask the user to paste it before generating source-derived content. Do not claim an invented question or explanation was in the source. Use section `origin` values to distinguish source-derived adaptations, supplementary explanations, and user-authored content.

## Teaching and technical quality

Use the writing guide's progression: intuition → concept → concrete example → design reasoning → interview answer → relevant failure case or misconception → revision.

Explain why a component exists before naming tools. Show a small initial design before adding distributed complexity. Distinguish caching, coordination, durable storage, queues, and analytics. Explain calculations and assumptions. Never promise correctness, immediate consistency, unlimited scale, exactly-once processing, or failover without the mechanism and conditions that support the claim.

Diagrams must match the explanation. Animations must change meaningful state and include a simple Hinglish explanation for each step. Respect reduced-motion preferences and preserve manual controls. Label supplementary examples and assumptions rather than presenting them as source facts.

## Validation and delivery

For changed content:

- Parse the JSON and verify IDs, slugs, related references, section origins, and animation references.
- Check calculations, units, timelines, and range boundaries.
- Run `npm run build` after changing app data, rendering, or types.
- Browser-check affected lessons, expanded interview answers, Mermaid diagrams, and any changed walkthrough. For layout changes, check desktop and mobile.
- Distinguish a successful build from browser proof. Report any unverified behavior honestly.

Documentation-only changes need link/path and consistency checks, not an app build unless app files were changed.

Do not push, publish, deploy, or make unrelated changes without authorization. Finish with a concise description of what changed, the verification performed, and any relevant limitation. Use the actual currently running URL if reporting a local preview; do not assume an old preview process is still valid after a folder move.
