import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms & Refunds — Clip2Thread",
  description: "Terms of service and refund policy for Clip2Thread.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 pb-20 pt-10 sm:px-6">
      <header className="mb-10 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 shadow-lg shadow-violet-600/30">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <h1 className="text-xl font-bold tracking-tight">Terms of Service &amp; Refund Policy</h1>
      </header>

      <div className="flex flex-col gap-5 text-sm leading-relaxed text-zinc-300">
        <p className="text-zinc-500">Last updated: November 25, 2026</p>

        <section>
          <h2 className="mb-2 font-semibold text-zinc-100">The service</h2>
          <p>
            Clip2Thread converts YouTube videos or transcripts you provide into social media
            threads and quote cards. Each visitor gets 2 free generations; a Pro subscription
            ($15/month) unlocks unlimited generations, premium tones, and HD watermark-free cards.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-zinc-100">Acceptable use</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Only submit content you own or have the right to use.</li>
            <li>Do not use the service to generate spam, harassment, or illegal content.</li>
            <li>Do not attempt to circumvent usage limits or abuse the free tier at scale.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-zinc-100">Ownership</h2>
          <p>
            You own the output you generate. You keep all rights to your submitted content. We
            claim no license over your results.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-zinc-100">Refund policy</h2>
          <p>
            <strong>7-day money-back guarantee.</strong> If you have not consumed your monthly
            generation quota, you may request a full refund within 7 days of your initial purchase
            — no questions asked. Once your quota has been materially consumed within the billing
            period, refunds are handled case by case; contact us and we will always try to be
            fair. Subscriptions can be canceled at any time from your Lemon Squeezy receipt or by
            emailing us.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-zinc-100">Disclaimer</h2>
          <p>
            The service is provided &ldquo;as is.&rdquo; AI-generated output may contain errors —
            always review before publishing. We are not liable for losses arising from published
            AI-generated content.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-zinc-100">Contact</h2>
          <p>
            Questions about these terms or a refund:{" "}
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
