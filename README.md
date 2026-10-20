# Forma — simple system design reader

React + TypeScript + Vite. Run `npm install` and `npm run dev`. Build with `npm run build`.

The interface follows the supplied drawing: a simple system list, then a detail page with a left table of contents, readable explanations, architecture diagrams and interview questions. Black-and-white light/dark themes are supported.

## Adding content

URL-shortener content lives in `src/data/questions.json`; Core Systems content lives in `src/data/core-systems.json`. `src/content.ts` combines both libraries. Each entry has an ID, slug, title, topic, type, description, sections, takeaways and related question IDs. Entries with `type: "System design"` appear in the list. Their `related` IDs become interview questions on the detail page. Interview entries also have their own `/question/:slug` URLs. Sections use Markdown, including fenced code and Mermaid blocks. Set section `animation` to `redirect`, `ranges`, `deletion`, `search`, `indexing`, `replicas` or `dictionary` to attach the matching walkthrough.

Animation text, nodes and steps live in `src/data/walkthroughs.json`. Framer Motion animates the current nodes and step explanations. Users can play, pause or manually navigate. Reduced-motion preferences are respected. These are educational walkthroughs, not live infrastructure.

`src/types.ts` defines the content shape. Add data instead of creating a new component. New walkthrough types can be added to the JSON and to the section animation union. Source-derived Hinglish adaptations and supplementary explanations remain distinguished. All source interview follow-ups are included beneath the URL shortener lesson.

Content is loaded directly from committed JSON, not browser storage. There is no editor, import/export, bookmark dashboard or account system. Old browser notebook data is left untouched and unused. Only theme preference is stored locally. Changes to JSON reload during development; rebuild to publish them.

For deployment, serve `dist` with SPA fallback to `index.html`. Mermaid is loaded on demand; build warnings about its larger diagram chunks are non-blocking.

## Agent startup instructions

Agents should start with [AGENTS.md](AGENTS.md), then read [the system design writing guide](docs/SYSTEM_DESIGN_WRITING_GUIDE.md) before changing learning content. The guide defines beginner Hinglish voice, realistic interview-answer progression, source attribution, architecture diagrams, Framer Motion walkthroughs, and JSON authoring.

## Core Systems: Elasticsearch

The library has separate System Design / Core Systems navigation, with the existing searchable reading layout. `/question/core-elasticsearch` contains 35 detailed Hinglish sections, 11 Mermaid diagrams, 26 interview questions, 4 search motion walkthroughs, and 7 browser simulations. The original URL-shortener URLs remain unchanged.

- `src/data/core-systems.json`: chapter, interview questions, source metadata, revision notes, and section-level origins.
- `src/data/search-labs.json`: matching example documents, presets, vocabulary, and lab titles.
- `src/SearchLab.tsx`: shared matching, BM25, edit-distance, and visibility teaching simulations.
- `category`: optional `System Design` / `Core Systems`; existing entries default to System Design.
- `source`: optional `{url, label}` for each lesson/interview. `sources` may hold an ordered list of references for lessons based on multiple sources. This prevents new topics from showing the URL-shortener attribution.
- Section `lab`: optional `matching`, `ranking`, `fuzzy`, `visibility`, `policy`, `phrase`, or `streaming`. Use only with relevant explanations.

The source extraction and coverage boundary are recorded in [the Elasticsearch source notes](docs/ELASTICSEARCH_SOURCE_NOTES.md). Supplementary content links to official Elastic/PostgreSQL documentation where relevant. New chapters belong in JSON; no custom lesson page is needed.

The interactive examples calculate locally and do not connect to an Elasticsearch cluster. API/SQL examples are learning material; a Flask server, PostgreSQL, broker, workers, and Elasticsearch are not bundled. The visibility lab models conceptual milestones, not actual recovery/timing internals.

The opening reading route links to five short concept rounds. New labs let readers vary price/stock/field boost, inspect word positions and phrase slop, and compare sequential, concurrent-wait-all, and emit-as-ready delivery. Streaming uses cancellable browser timers and example results, not database requests.
