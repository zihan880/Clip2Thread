import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — Clip2Thread",
  description: "How Clip2Thread handles your data.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 pb-20 pt-10 sm:px-6">
      <header className="mb-10 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 shadow-lg shadow-violet-600/30">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <h1 className="text-xl font-bold tracking-tight">Privacy Policy</h1>
      </header>

      <div className="flex flex-col gap-5 text-sm leading-relaxed text-zinc-300">
        <p className="text-zinc-500">Last updated: November 25, 2026</p>

        <section>
          <h2 className="mb-2 font-semibold text-zinc-100">What we process</h2>
          <p>
            Clip2Thread only processes the content you explicitly submit: the YouTube URL or
            transcript you paste, and the tone option you select. We do not require an account and
            we do not collect your name, email, or billing details unless you subscribe, in which
            case payments are handled entirely by our payment provider (Lemon Squeezy).
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-zinc-100">Third-party services</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>AI processing:</strong> your submitted transcript is sent to our third-party
              AI provider (OpenAI-compatible API) solely to generate your thread and quote cards.
              We do not use your content to train models.
            </li>
            <li>
              <strong>Payments:</strong> subscriptions are processed by Lemon Squeezy as our
              merchant of record. We never see or store your full card details.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-zinc-100">What we never do</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>We never sell your data to anyone.</li>
            <li>We never share your submitted content with advertisers.</li>
            <li>
              We store a small counter in your browser&rsquo;s local storage to track your free
              generations. This data never leaves your device.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-zinc-100">Retention &amp; contact</h2>
          <p>
            Submitted content is used to fulfill your request and is not permanently stored on our
            servers. Questions? Contact us at{" "}
            <a href="mailto:support@dingsheng.cyou" className="text-violet-300 hover:underline">
              support@dingsheng.cyou
            </a>
            .
          </p>
        </section>

        <p className="mt-6 text-xs text-zinc-600">
          <Link href="/" className="transition-colors hover:text-zinc-400">
            ← Back to Clip2Thread
          </Link>
        </p>
      </div>
    </main>
  );
}
