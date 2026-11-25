import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clip2Thread — Turn YouTube into viral threads & quote cards",
  description:
    "Paste a YouTube link or transcript and instantly get a punchy X (Twitter) thread plus high-res quote cards.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-ink-950 text-zinc-100 antialiased">
        {children}
      </body>
    </html>
  );
}
