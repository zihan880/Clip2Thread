import { NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";
import { ProxyAgent, setGlobalDispatcher } from "undici";

const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;

if (proxyUrl) {
  setGlobalDispatcher(new ProxyAgent(proxyUrl));
}

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_TRANSCRIPT_CHARS = 14000;

type Quote = { text: string; tag: string };
type GenerateResult = {
  title: string;
  thread: string[];
  quotes: Quote[];
};

const TONE_PROMPTS: Record<string, string> = {
  punchy:
    "Punchy & Insightful: short, sharp lines. Lead with insight, cut every filler word. One idea per tweet.",
  contrarian:
    "Contrarian & Bold: challenge conventional wisdom. Take a strong stance, but stay credible and specific.",
  actionable:
    "Actionable & Tactical: concrete steps, frameworks, numbers. The reader should be able to act immediately.",
};

function extractVideoId(url: string): string | null {
  try {
    const parsed = new URL(url.trim());
    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.slice(1).split("/")[0];
      return id || null;
    }
    if (parsed.hostname.includes("youtube.com")) {
      const v = parsed.searchParams.get("v");
      if (v) return v;
      const m = parsed.pathname.match(/\/(shorts|embed|live)\/([^/?]+)/);
      if (m) return m[2];
    }
  } catch {
    // not a valid URL
  }
  return null;
}

/** Robustly parse the LLM response, tolerating markdown code fences and stray text. */
function parseModelContent(content: string): GenerateResult {
  let text = content.trim();

  // Strip ```json ... ``` or ``` ... ``` wrappers
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) {
    text = fence[1].trim();
  }

  // Fall back to first {...} block if still not clean JSON
  if (!text.startsWith("{")) {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start !== -1 && end > start) {
      text = text.slice(start, end + 1);
    }
  }

  const raw = JSON.parse(text) as Partial<GenerateResult>;

  const title = typeof raw.title === "string" ? raw.title.trim() : "";
  const thread = Array.isArray(raw.thread)
    ? raw.thread.filter((t): t is string => typeof t === "string" && t.trim().length > 0)
    : [];
  const quotes = Array.isArray(raw.quotes)
    ? raw.quotes
        .filter(
          (q): q is Quote =>
            q &&
            typeof q === "object" &&
            typeof (q as Quote).text === "string" &&
            (q as Quote).text.trim().length > 0
        )
        .map((q) => ({
          text: q.text.trim(),
          tag: typeof q.tag === "string" ? q.tag.trim() : "",
        }))
    : [];

  if (!title || thread.length === 0) {
    throw new Error("Model response missing title or thread");
  }
  return { title, thread, quotes };
}

export async function POST(req: Request) {
  let body: { youtubeUrl?: string; transcript?: string; tone?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const youtubeUrl = (body.youtubeUrl || "").trim();
  const manualTranscript = (body.transcript || "").trim();
  const tone = body.tone && TONE_PROMPTS[body.tone] ? body.tone : "punchy";

  if (!youtubeUrl && !manualTranscript) {
    return NextResponse.json(
      { error: "Please paste a YouTube link, or switch to manual mode and paste a transcript." },
      { status: 400 }
    );
  }

  let transcript = "";
  if (youtubeUrl) {
    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      return NextResponse.json(
        { error: "That doesn't look like a valid YouTube URL. Try something like https://www.youtube.com/watch?v=..." },
        { status: 400 }
      );
    }
    try {
      const segments = await YoutubeTranscript.fetchTranscript(videoId);
      transcript = segments.map((s) => s.text).join(" ");
    } catch {
      transcript = "";
    }
    if (!transcript && !manualTranscript) {
      return NextResponse.json(
        {
          error:
            "Couldn't fetch captions for this video — it may have English captions disabled. Expand \"Paste transcript manually\" below and drop the transcript or script in there instead.",
        },
        { status: 400 }
      );
    }
  }

  const source = (transcript || manualTranscript).slice(0, MAX_TRANSCRIPT_CHARS);

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured on the server. Set it in .env.local and restart." },
      { status: 500 }
    );
  }
  const baseUrl = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, "");
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const systemPrompt = `You are a world-class ghostwriter for top creators on X (Twitter). You turn long-form video content into viral-ready threads and quote cards.

Tone: ${TONE_PROMPTS[tone]}

Rules for the thread:
- 5 to 7 tweets.
- Tweet 1 is a strong hook: curiosity gap, bold claim, or surprising stat. NO clichés like "In this video..." or "🧵 Thread on...".
- Every tweet must be 270 characters or fewer.
- No hashtag spam (at most one hashtag total). Natural line breaks welcome.
- Tweet 2 should deliver on the hook immediately.

Rules for quotes:
- Exactly 3 standalone quotable lines (max ~180 chars each) that look great on a shareable card.
- Each quote gets a short tag (2-4 words) describing its theme, e.g. "Focus", "Writing craft".

Return ONLY valid JSON with this exact shape:
{"title": "<short video title>", "thread": ["tweet 1", "tweet 2", ...], "quotes": [{"text": "...", "tag": "..."}, {"text": "...", "tag": "..."}, {"text": "...", "tag": "..."}]}`;

  const userPrompt = `Transcript (truncated):\n\n${source}`;

  let resp: Response;
  try {
    resp = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8,
        response_format: { type: "json_object" },
      }),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to reach the LLM API. Check OPENAI_BASE_URL and your network." },
      { status: 502 }
    );
  }

  if (!resp.ok) {
    const detail = await resp.text().catch(() => "");
    return NextResponse.json(
      { error: `LLM API error (HTTP ${resp.status}). ${detail.slice(0, 300)}` },
      { status: 502 }
    );
  }

  const data = (await resp.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    return NextResponse.json(
      { error: "The LLM returned an empty response. Please try again." },
      { status: 502 }
    );
  }

  let result: GenerateResult;
  try {
    result = parseModelContent(content);
  } catch {
    return NextResponse.json(
      { error: "The LLM response could not be parsed as JSON. Please try again." },
      { status: 502 }
    );
  }

  return NextResponse.json(result);
}
