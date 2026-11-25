# Clip2Thread

把 YouTube 视频一键转成 X (Twitter) 爆款推文串 Thread + 可导出高清 PNG 的金句卡片，面向海外内容创作者。

## Features

- Paste a YouTube link (auto-fetches English captions) or paste a transcript manually as fallback.
- Three tones: Punchy & Insightful / Contrarian & Bold / Actionable & Tactical.
- Generates a 5–7 tweet thread with a strong hook, per-tweet character counts and one-click Copy.
- Generates 3 quote cards with a global dark/light skin toggle and high-res PNG export (pixelRatio: 2 via html-to-image).
- Dark, minimal, responsive UI (Tailwind CSS).

## Tech Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS, lucide-react
- youtube-transcript (caption fetching)
- html-to-image (PNG export)
- Any OpenAI-compatible LLM endpoint (native fetch, JSON mode)

## Getting Started

```bash
npm install

# configure your API key
cp .env.example .env.local
# then edit .env.local and fill in OPENAI_API_KEY

npm run dev
```

Open http://localhost:3000 in your browser.

## Environment Variables (.env.local)

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| OPENAI_API_KEY | yes | — | API key for an OpenAI-compatible endpoint |
| OPENAI_BASE_URL | no | https://api.openai.com/v1 | Base URL of the endpoint |
| OPENAI_MODEL | no | gpt-4o-mini | Model name |

## Production Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
  app/
    layout.tsx          # root layout (dark theme)
    globals.css         # Tailwind + dark styling
    page.tsx            # main client UI (input, results, quote cards)
    api/generate/route.ts  # POST: fetch transcript → LLM → JSON {title, thread, quotes}
```
