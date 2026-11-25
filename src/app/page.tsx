"use client";

import { useEffect, useRef, useState } from "react";
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
  X,
  Crown,
} from "lucide-react";
import Link from "next/link";
import { toPng } from "html-to-image";

type Quote = { text: string; tag: string };
type GenerateResult = {
  title: string;
  thread: string[];
  quotes: Quote[];
};

const FREE_LIMIT = 2;
const USAGE_KEY = "c2t_free_usage";

const SAMPLE_SCRIPT = `I sat down with Maya Chen, co-founder of Driftline, to talk about what actually happens after a startup raises its seed round. Maya left a comfortable staff engineer role at a big tech company to build an AI-powered logistics platform, and her first eighteen months were nothing like the highlight reel on social media. She explains why their original product — a dashboard for freight brokers — completely flopped, and how a single frustrated customer phone call rewrote the entire roadmap. We dig into the uncomfortable math of runway: Maya's rule is to cut burn the moment projected runway drops below nine months, not six, because fundraising always takes longer than you think. She also breaks down their unconventional hiring approach: no job postings, no recruiters, just a public build-in-public blog that attracted their first six engineers. On competition, Maya is refreshingly blunt — incumbents will copy your features, but they cannot copy your speed or your customer intimacy. Her advice to first-time founders is to talk to ten customers every single week, even after product-market fit, because churn whispers long before it screams. This is a candid, tactical conversation about surviving the messy middle of startup life.`;

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

function PaywallModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  const checkoutUrl = process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-ink-600 bg-ink-900 p-7 shadow-2xl shadow-violet-950/50"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-zinc-500 transition-colors hover:text-zinc-200"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600/20">
          <Crown className="h-5 w-5 text-violet-300" />
        </div>
        <h2 className="mt-4 text-xl font-bold tracking-tight text-zinc-100">
          Upgrade to Clip2Thread Pro
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          You&rsquo;ve used your {FREE_LIMIT} free generations. Keep shipping threads for less than a coffee a week.
        </p>
        <ul className="mt-5 flex flex-col gap-2.5 text-sm text-zinc-300">
          {[
            "Unlimited generations — $15/month",
            "All premium tones and templates",
            "HD quote cards, no watermark",
          ].map((f) => (
            <li key={f} className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              {f}
            </li>
          ))}
        </ul>
        {checkoutUrl ? (
          <a
            href={checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/30 transition-all hover:bg-violet-500"
          >
            <Crown className="h-4 w-4" />
            Subscribe Now
          </a>
        ) : (
          <div className="mt-6 rounded-xl border border-ink-600 bg-ink-800 p-3 text-center text-xs text-zinc-400">
            Checkout opening soon — contact{" "}
            <a href="mailto:support@dingsheng.cyou" className="text-violet-300 underline-offset-2 hover:underline">
              support@dingsheng.cyou
            </a>{" "}
            for early access
          </div>
        )}
        <p className="mt-3 text-center text-[11px] text-zinc-600">
          Cancel anytime. Secure payments by Lemon Squeezy.
        </p>
      </div>
    </div>
  );
}

function getUsedCount(): number {
  if (typeof window === "undefined") return 0;
  const n = parseInt(window.localStorage.getItem(USAGE_KEY) || "0", 10);
  return Number.isNaN(n) || n < 0 ? 0 : n;
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
  const [paywall, setPaywall] = useState(false);
  const [used, setUsed] = useState(0);

  useEffect(() => {
    setUsed(getUsedCount());
  }, []);

  async function generate() {
    if (getUsedCount() >= FREE_LIMIT) {
      setPaywall(true);
      return;
    }
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
        const next = getUsedCount() + 1;
        window.localStorage.setItem(USAGE_KEY, String(next));
        setUsed(next);
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
          <p className="-mt-1 text-[11px] text-zinc-600">
            Best with English YouTube videos (with captions) or English transcripts.
          </p>
          <div>
            <button
              onClick={() => {
                setTranscript(SAMPLE_SCRIPT);
                setManualOpen(true);
              }}
              className="text-xs font-medium text-violet-400/90 underline-offset-2 transition-colors hover:text-violet-300 hover:underline"
            >
              Try a sample script →
            </button>
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

          <p className="text-center text-[11px] text-zinc-600 sm:text-left">
            {Math.max(FREE_LIMIT - used, 0)} of {FREE_LIMIT} free generations left
            {used >= FREE_LIMIT && " — upgrade for unlimited"}
          </p>
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

      <PaywallModal open={paywall} onClose={() => setPaywall(false)} />

      <footer className="mt-16 flex flex-col items-center gap-2 text-center text-xs text-zinc-600">
        <p>Clip2Thread — built for creators. Paste a link, ship a thread.</p>
        <div className="flex items-center gap-2">
          <Link href="/privacy" className="transition-colors hover:text-zinc-400">
            Privacy Policy
          </Link>
          <span className="text-zinc-700">|</span>
          <Link href="/terms" className="transition-colors hover:text-zinc-400">
            Terms &amp; Refunds
          </Link>
          <span className="text-zinc-700">|</span>
          <a href="mailto:support@dingsheng.cyou" className="transition-colors hover:text-zinc-400">
            support@dingsheng.cyou
          </a>
        </div>
      </footer>
    </main>
  );
}
