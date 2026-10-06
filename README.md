# Forma — simple system design reader

React + TypeScript + Vite. Run `npm install` and `npm run dev`. Build with `npm run build`.

The interface follows the supplied drawing: a simple system list, then a detail page with a left table of contents, readable explanations, architecture diagrams and interview questions. Black-and-white light/dark themes are supported.

## Adding content

All lesson content lives in `src/data/questions.json`. Each entry has an ID, slug, title, topic, type, description, sections, takeaways and related question IDs. Entries with `type: "System design"` appear in the list. Their `related` IDs become interview questions on the detail page. Interview entries also have their own `/question/:slug` URLs. Sections use Markdown, including fenced code and Mermaid blocks. Set section `animation` to `redirect`, `ranges` or `deletion` to attach a walkthrough.

Animation text, nodes and steps live in `src/data/walkthroughs.json`. Framer Motion animates the current nodes and step explanations. Users can play, pause or manually navigate. Reduced-motion preferences are respected. These are educational walkthroughs, not live infrastructure.

`src/types.ts` defines the content shape. Add data instead of creating a new component. New walkthrough types can be added to the JSON and to the section animation union. Source-derived Hinglish adaptations and supplementary explanations remain distinguished. All source interview follow-ups are included beneath the URL shortener lesson.

Content is loaded directly from committed JSON, not browser storage. There is no editor, import/export, bookmark dashboard or account system. Old browser notebook data is left untouched and unused. Only theme preference is stored locally. Changes to JSON reload during development; rebuild to publish them.

For deployment, serve `dist` with SPA fallback to `index.html`. Mermaid is loaded on demand; build warnings about its larger diagram chunks are non-blocking.

## Agent startup instructions

Agents should start with [AGENTS.md](AGENTS.md), then read [the system design writing guide](docs/SYSTEM_DESIGN_WRITING_GUIDE.md) before changing learning content. The guide defines beginner Hinglish voice, realistic interview-answer progression, source attribution, architecture diagrams, Framer Motion walkthroughs, and JSON authoring.
