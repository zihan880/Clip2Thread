"use client";

import { useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Download,
  Link as LinkIcon,
  Loader2,
  Moon,
  Sparkles,
  Sun,
  TextQuote,
  Twitter,
  AlertCircle,
} from "lucide-react";
import { toPng } from "html-to-image";

type Quote = { text: string; tag: string };
type GenerateResult = {
  title: string;
  thread: string[];
  quotes: Quote[];
};

const TONES = [
  { id: "punchy", label: "Punchy & Insightful" },
  { id: "contrarian", label: "Contrarian & Bold" },
  { id: "actionable", label: "Actionable & Tactical" },
] as const;

function CharCount({ text }: { text: string }) {
  const len = text.length;
  const over = len > 280;
  return (
    <span className={`text-xs tabular-nums ${over ? "text-red-400" : "text-zinc-500"}`}>
      {len}/280
    </span>
  );
}

function TweetItem({ text, index }: { text: string; index: number }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="group rounded-xl border border-ink-600 bg-ink-800/70 p-4 transition-colors hover:border-violet-500/40">
      <div className="flex items-start gap-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-600/20 text-xs font-bold text-violet-300">
          {index + 1}
        </div>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-100">{text}</p>
      </div>
      <div className="mt-3 flex items-center justify-between pl-10">
        <CharCount text={text} />
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-lg border border-ink-600 px-2.5 py-1 text-xs text-zinc-400 transition-colors hover:border-violet-500/50 hover:text-violet-300"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function QuoteCard({
  quote,
  dark,
  cardRef,
}: {
  quote: Quote;
  dark: boolean;
  cardRef: (el: HTMLDivElement | null) => void;
}) {
  return (
    <div
      ref={cardRef}
      className={`flex aspect-[4/5] w-full flex-col justify-between rounded-2xl p-6 ${
        dark
          ? "bg-gradient-to-br from-[#12121c] to-[#1d1d2e] text-zinc-100"
          : "bg-gradient-to-br from-[#f5f3ee] to-[#e8e4da] text-zinc-900"
      }`}
    >
      <div className="flex items-center gap-2">
        <div className={`h-8 w-8 rounded-full ${dark ? "bg-violet-500/30" : "bg-violet-600/15"}`} />
        <span className={`text-xs font-semibold tracking-wide ${dark ? "text-violet-300" : "text-violet-700"}`}>
          Clip2Thread
        </span>
      </div>
      <p className="text-lg font-medium leading-snug">&ldquo;{quote.text}&rdquo;</p>
      <div className="flex items-center justify-between">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
            dark ? "bg-white/10 text-zinc-300" : "bg-zinc-900/10 text-zinc-600"
          }`}
        >
          {quote.tag}
        </span>
        <Twitter className={`h-4 w-4 ${dark ? "text-zinc-500" : "text-zinc-400"}`} />
      </div>
    </div>
  );
}

function QuoteCardDownload({ quote, dark }: { quote: Quote; dark: boolean }) {
  const cardEl = useRef<HTMLDivElement | null>(null);
  const [busy, setBusy] = useState(false);

  async function download() {
    const node = cardEl.current;
    if (!node) return;
    setBusy(true);
    try {
      const dataUrl = await toPng(node, { pixelRatio: 2, cacheBust: true });
      const link = document.createElement("a");
      link.download = `quote-card-${quote.tag.toLowerCase().replace(/\s+/g, "-") || "card"}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("PNG export failed:", err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <QuoteCard quote={quote} dark={dark} cardRef={(el) => (cardEl.current = el)} />
      <button
        onClick={download}
        disabled={busy}
        className="flex items-center justify-center gap-1.5 rounded-lg border border-ink-600 py-1.5 text-xs text-zinc-400 transition-colors hover:border-violet-500/50 hover:text-violet-300 disabled:opacity-50"
      >
        {busy ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Download className="h-3.5 w-3.5" />
        )}
        Download PNG
      </button>
    </div>
  );
}

export default function Home() {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [manualOpen, setManualOpen] = useState(false);
  const [tone, setTone] = useState<(typeof TONES)[number]["id"]>("punchy");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [cardsDark, setCardsDark] = useState(true);

  async function generate() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const resp = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ youtubeUrl, transcript, tone }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setError(data.error || "Something went wrong. Please try again.");
      } else {
        setResult(data as GenerateResult);
      }
    } catch {
      setError("Network error — is the dev server still running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6">
      {/* Header */}
      <header className="mb-10 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 shadow-lg shadow-violet-600/30">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Clip2Thread</h1>
          <p className="text-xs text-zinc-500">
            YouTube → viral X thread + quote cards, in one click.
          </p>
        </div>
      </header>

      {/* Input panel */}
      <section className="rounded-2xl border border-ink-600 bg-ink-900/60 p-5 backdrop-blur">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 rounded-xl border border-ink-600 bg-ink-800 px-3 focus-within:border-violet-500/60">
            <LinkIcon className="h-4 w-4 shrink-0 text-zinc-500" />
            <input
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-zinc-600"
            />
          </div>

          {/* Manual transcript toggle */}
          <div>
            <button
              onClick={() => setManualOpen((v) => !v)}
              className="flex items-center gap-1 text-xs text-zinc-500 transition-colors hover:text-violet-300"
            >
              {manualOpen ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
              <TextQuote className="h-3.5 w-3.5" />
              Paste transcript / script manually (fallback)
            </button>
            {manualOpen && (
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                rows={6}
                placeholder="Paste the English transcript or your script here…"
                className="mt-2 w-full resize-y rounded-xl border border-ink-600 bg-ink-800 p-3 text-sm outline-none placeholder:text-zinc-600 focus:border-violet-500/60"
              />
            )}
          </div>

          {/* Tone selector */}
          <div className="flex flex-wrap gap-2">
            {TONES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTone(t.id)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
                  tone === t.id
                    ? "border-violet-500 bg-violet-600/20 text-violet-200"
                    : "border-ink-600 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={generate}
            disabled={loading || (!youtubeUrl.trim() && !transcript.trim())}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/30 transition-all hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:px-8"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate
              </>
            )}
          </button>
        </div>
      </section>

      {/* Results */}
      {result && (
        <section className="mt-10 grid gap-8 lg:grid-cols-5">
          {/* Thread */}
          <div className="lg:col-span-3">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-zinc-400">
              <Twitter className="h-4 w-4 text-violet-400" />
              {result.title || "Thread"}
            </h2>
            <div className="flex flex-col gap-3">
              {result.thread.map((t, i) => (
                <TweetItem key={i} text={t} index={i} />
              ))}
            </div>
          </div>

          {/* Quote cards */}
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-zinc-400">
                <TextQuote className="h-4 w-4 text-violet-400" />
                Quote Cards
              </h2>
              <button
                onClick={() => setCardsDark((v) => !v)}
                className="flex items-center gap-1.5 rounded-lg border border-ink-600 px-2.5 py-1 text-xs text-zinc-400 transition-colors hover:border-violet-500/50 hover:text-violet-300"
              >
                {cardsDark ? (
                  <Sun className="h-3.5 w-3.5" />
                ) : (
                  <Moon className="h-3.5 w-3.5" />
                )}
                {cardsDark ? "Light" : "Dark"}
              </button>
            </div>
            <div className="flex flex-col gap-4">
              {result.quotes.map((q, i) => (
                <QuoteCardDownload key={i} quote={q} dark={cardsDark} />
              ))}
            </div>
          </div>
        </section>
      )}

      <footer className="mt-16 text-center text-xs text-zinc-600">
        Clip2Thread — built for creators. Paste a link, ship a thread.
      </footer>
    </main>
  );
}
