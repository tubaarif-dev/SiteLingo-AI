// src/app/page.tsx
"use client";

import { useRef, useState } from "react";
import {
  Sparkles,
  Menu,
  X,
  Loader2,
  AlertTriangle,
  Gauge,
  Accessibility,
  SearchCheck,
  MessageSquareText,
  Copy,
  Check,
  Wrench,
  ArrowRight,
  CheckCircle2,
  Zap,
  ShieldCheck,
  Gift,
  Info,
} from "lucide-react";

interface ScoreSet {
  performance: number;
  accessibility: number;
  seo: number;
}

interface PlainEnglishIssue {
  technicalTitle: string;
  plainEnglishExplanation: string;
  impact: "High" | "Medium" | "Low";
  howToFix: string;
}

interface AuditResponse {
  scores: ScoreSet;
  executiveSummary: string;
  plainEnglishIssues: PlainEnglishIssue[];
  freelancerPitch: string;
  source: "live" | "sample";
  debugReason?: string;
}

const NAV_LINKS = [
  { label: "How It Works", id: "how-it-works" },
  { label: "What We Analyze", id: "what-we-analyze" },
  { label: "Sample Audit", id: "sample-audit" },
  { label: "Features", id: "features" },
];

function scoreStatus(score: number) {
  if (score >= 90)
    return { label: "Good", classes: "bg-emerald-50 text-emerald-800 border-emerald-300" };
  if (score >= 50)
    return { label: "Needs Work", classes: "bg-amber-50 text-amber-800 border-amber-300" };
  return { label: "Poor", classes: "bg-red-50 text-red-800 border-red-300" };
}

function impactClasses(impact: PlainEnglishIssue["impact"]) {
  switch (impact) {
    case "High":
      return "bg-red-50 text-red-800 border-red-300";
    case "Medium":
      return "bg-amber-50 text-amber-800 border-amber-300";
    default:
      return "bg-slate-100 text-slate-700 border-slate-300";
  }
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AuditResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<"All" | "High" | "Medium" | "Low">("All");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const urlInputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!url.trim()) {
      setError("Please enter a website URL.");
      scrollToId("audit-dashboard");
      return;
    }

    setLoading(true);
    scrollToId("audit-dashboard");

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUrl: url.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setResult(data as AuditResponse);
      setSeverityFilter("All");
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopyPitch() {
    if (!result?.freelancerPitch) return;
    try {
      await navigator.clipboard.writeText(result.freelancerPitch);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Couldn't copy to clipboard. Select and copy the text manually.");
    }
  }

  function focusAuditInput() {
    setMobileMenuOpen(false);
    scrollToId("hero-audit-bar");
    urlInputRef.current?.focus();
  }

  const filteredIssues =
    result?.plainEnglishIssues.filter(
      (issue) => severityFilter === "All" || issue.impact === severityFilter
    ) ?? [];

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900">
      {/* ---------- Sticky Header ---------- */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a
              href="#"
              className="flex items-center gap-2 font-bold text-slate-900"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900">
                <Sparkles className="w-4 h-4 text-sky-400" aria-hidden="true" />
              </span>
              SiteLingo AI
            </a>

            <nav className="hidden lg:flex items-center gap-8" aria-label="Main">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToId(link.id)}
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  {link.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <button
                onClick={focusAuditInput}
                className="hidden sm:inline-flex min-h-[44px] items-center justify-center rounded-lg bg-slate-900 text-white
                           text-sm font-medium px-4 hover:bg-slate-800 focus:outline-none focus:ring-2
                           focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Run Free Audit
              </button>
              <button
                onClick={() => setMobileMenuOpen((v) => !v)}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
                aria-label="Toggle menu"
                className="lg:hidden inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg
                           border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <nav id="mobile-menu" className="lg:hidden pb-4 flex flex-col gap-1" aria-label="Mobile">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.id}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    scrollToId(link.id);
                  }}
                  className="min-h-[44px] text-left text-sm font-medium text-slate-700 hover:text-slate-900 px-2 rounded-lg hover:bg-slate-50"
                >
                  {link.label}
                </button>
              ))}
              <button
                onClick={focusAuditInput}
                className="min-h-[44px] mt-2 inline-flex items-center justify-center rounded-lg bg-slate-900 text-white text-sm font-medium px-4"
              >
                Run Free Audit
              </button>
            </nav>
          )}
        </div>
      </header>

      {/* ---------- Hero ---------- */}
      <section id="hero" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium bg-slate-900 text-white rounded-full px-3 py-1 mb-5">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              Created by Tuba · Powered by Gemini AI &amp; PageSpeed API
            </span>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.1]">
              Turn website problems into clear, actionable fixes.
            </h1>
            <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-lg">
              SiteLingo AI translates complex SEO, performance, and accessibility
              metrics into plain English business insights anyone can understand.
            </p>

            <form
              id="hero-audit-bar"
              onSubmit={handleSubmit}
              className="mt-8 flex flex-col sm:flex-row gap-3"
            >
              <label htmlFor="targetUrl" className="sr-only">
                Website URL
              </label>
              <input
                id="targetUrl"
                ref={urlInputRef}
                type="url"
                inputMode="url"
                placeholder="https://yourwebsite.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading}
                className="w-full sm:flex-1 min-h-[44px] rounded-lg border border-slate-200 bg-white px-4 text-sm sm:text-base
                           shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           disabled:bg-slate-100 disabled:text-slate-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 rounded-lg
                           bg-slate-900 text-white text-sm sm:text-base font-medium px-6 hover:bg-slate-800
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                           disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze Website"
                )}
              </button>
            </form>

            <p className="mt-3 text-xs text-slate-500 max-w-lg">
              ⚡ Runs on live Google PageSpeed and Gemini AI data. If either service
              is briefly unavailable, you'll see a clearly labeled sample report
              instead of an error — never live-looking data that isn't real.
            </p>

            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
              {["Performance", "SEO", "Accessibility", "Actionable Pitch Script"].map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  Sample Audit
                </span>
                <span className="text-xs text-slate-400">example.com</span>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: "Performance", score: 72 },
                  { label: "SEO", score: 88 },
                  { label: "Accessibility", score: 94 },
                ].map((s) => {
                  const status = scoreStatus(s.score);
                  return (
                    <div key={s.label} className={`rounded-lg border px-3 py-3 text-center ${status.classes}`}>
                      <p className="text-xl font-bold">{s.score}</p>
                      <p className="text-[11px] font-medium mt-0.5">{s.label}</p>
                    </div>
                  );
                })}
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                  Before → After
                </p>
                <p className="text-xs text-slate-500 font-mono mb-2">
                  LCP: 4.2s · Render-blocking resources detected
                </p>
                <p className="text-sm text-slate-800">
                  Your main content takes too long to appear on mobile. Compressing
                  hero images fixes most of the delay.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- What We Analyze ---------- */}
      <section id="what-we-analyze" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-200">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">What we analyze</h2>
        <p className="text-slate-600 mb-10 max-w-lg">
          Every audit pulls live data across four categories that actually affect
          whether a site converts visitors into customers.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Gauge, title: "Performance", desc: "Load speed, Core Web Vitals, and what's slowing the page down." },
            { icon: Accessibility, title: "Accessibility", desc: "Whether every visitor, including those using assistive tech, can use the site." },
            { icon: SearchCheck, title: "SEO", desc: "Whether search engines can properly read and rank the page." },
            { icon: MessageSquareText, title: "Actionable Pitch", desc: "A ready-to-send script to pitch the fixes to the site owner." },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-200 p-5">
              <item.icon className="w-5 h-5 text-slate-700 mb-3" aria-hidden="true" />
              <h3 className="font-semibold text-slate-900 mb-1">{item.title}</h3>
              <p className="text-sm text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Before / After Showcase ---------- */}
      <section id="sample-audit" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-200">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Jargon in, clarity out</h2>
        <p className="text-slate-600 mb-10 max-w-lg">
          Real Lighthouse output on the left. What SiteLingo tells the business
          owner on the right.
        </p>
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-0 relative">
          <div className="rounded-xl sm:rounded-r-none border border-slate-200 bg-slate-50 p-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
              Technical Output
            </p>
            <p className="font-mono text-sm text-slate-500 leading-relaxed">
              Largest Contentful Paint: 4.2s
              <br />
              Render-blocking resources detected
              <br />
              Unused JS: 182 KiB
            </p>
          </div>
          <div className="hidden sm:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm items-center justify-center">
            <ArrowRight className="w-4 h-4 text-slate-500" aria-hidden="true" />
          </div>
          <div className="rounded-xl sm:rounded-l-none border border-emerald-200 bg-white shadow-sm p-6">
            <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-3">
              SiteLingo Translation
            </p>
            <p className="text-sm sm:text-base text-slate-800 leading-relaxed">
              Your main page content takes too long to appear on mobile screens.
              Compressing 3 hero images will fix 80% of the delay.
            </p>
          </div>
        </div>
      </section>

      {/* ---------- How It Works ---------- */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-200">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-10">How it works</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { n: "01", title: "Enter any public URL", desc: "No signup, no install. Just paste a website address." },
            { n: "02", title: "Real-time PageSpeed scan", desc: "We query Google's live PageSpeed Insights API for real scores." },
            { n: "03", title: "Get plain-English fixes", desc: "Gemini AI translates the results into fixes and a client pitch." },
          ].map((step) => (
            <div key={step.n} className="rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-200 p-6">
              <span className="text-sm font-bold text-slate-300">{step.n}</span>
              <h3 className="font-semibold text-slate-900 mt-2 mb-1">{step.title}</h3>
              <p className="text-sm text-slate-600">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Features ---------- */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-200">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-10">Features</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Zap, title: "Live data", desc: "Real Google PageSpeed scores, not estimates." },
            { icon: Sparkles, title: "AI translation", desc: "Technical audits explained in plain English." },
            { icon: Copy, title: "Copy-paste pitch", desc: "A ready client pitch, generated per audit." },
            { icon: Gift, title: "Free to use", desc: "No signup or payment required to run an audit." },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-200 p-5">
              <f.icon className="w-5 h-5 text-slate-700 mb-3" aria-hidden="true" />
              <h3 className="font-semibold text-slate-900 mb-1">{f.title}</h3>
              <p className="text-sm text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Audit Dashboard ---------- */}
      <section id="audit-dashboard" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-200 scroll-mt-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6">Your audit results</h2>

        {error && (
          <div role="alert" className="mb-6 flex items-start gap-3 rounded-lg border border-red-300 bg-red-50 px-4 py-3">
            <AlertTriangle className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {loading && (
          <div className="space-y-6 animate-pulse" aria-live="polite" aria-busy="true">
            <p className="text-sm text-slate-500">Running your audit — this usually takes 15–30 seconds.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-24 rounded-xl border border-slate-200 bg-slate-100" />
              ))}
            </div>
            <div className="h-20 rounded-xl border border-slate-200 bg-slate-100" />
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-24 rounded-xl border border-slate-200 bg-slate-100" />
              ))}
            </div>
          </div>
        )}

        {!loading && !result && !error && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <p className="text-sm text-slate-500">
              Enter a website URL above and click "Analyze Website" to see your results here.
            </p>
          </div>
        )}

        {!loading && result && (
          <div className="space-y-6">
            {result.source === "sample" && (
              <div
                role="status"
                className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3"
              >
                <Info className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
                                <div className="text-sm text-amber-800">
                  <p>
                    <span className="font-semibold">Sample report.</span> Live analysis was
                    unavailable, so this is an illustrative example, not real data for this
                    site. Try running the audit again shortly.
                  </p>
                  {result.debugReason && (
                    <p className="mt-1 font-mono text-xs text-amber-700">
                      Dev only — real cause: {result.debugReason}
                    </p>
                  )}
                  </div>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <ScoreCard icon={Gauge} label="Performance" score={result.scores.performance} />
              <ScoreCard icon={Accessibility} label="Accessibility" score={result.scores.accessibility} />
              <ScoreCard icon={SearchCheck} label="SEO" score={result.scores.seo} />
            </div>

            <article className="rounded-xl border border-slate-200 bg-white shadow-sm px-5 py-4 sm:px-6 sm:py-5">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Business Summary
              </h3>
              <p className="text-sm sm:text-base text-slate-800 leading-relaxed">{result.executiveSummary}</p>
            </article>

            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                  Prioritized Fixes
                </h3>
                <div className="flex gap-2">
                  {(["All", "High", "Medium", "Low"] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setSeverityFilter(level)}
                      aria-pressed={severityFilter === level}
                      className={`min-h-[44px] inline-flex items-center justify-center rounded-lg border px-3 text-xs font-medium
                        transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          severityFilter === level
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                        }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <ul className="space-y-3">
                {filteredIssues.length === 0 && (
                  <li className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-6 text-center text-sm text-slate-500">
                    No {severityFilter !== "All" ? severityFilter.toLowerCase() : ""} impact issues found.
                  </li>
                )}
                {filteredIssues.map((issue, i) => (
                  <li key={i} className="rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-200 px-5 py-4 sm:px-6 sm:py-5">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h4 className="text-sm sm:text-base font-semibold text-slate-900">{issue.technicalTitle}</h4>
                      <span className={`text-xs font-medium border rounded-full px-2.5 py-0.5 ${impactClasses(issue.impact)}`}>
                        {issue.impact} impact
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed mb-3">{issue.plainEnglishExplanation}</p>
                    <div className="flex gap-2 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2.5">
                      <Wrench className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                      <p className="text-sm text-slate-700">
                        <span className="font-medium">How to fix: </span>
                        {issue.howToFix}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <article className="rounded-xl bg-slate-900 text-white px-5 py-4 sm:px-6 sm:py-5">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-2">Client Pitch</h3>
              <p className="text-sm sm:text-base text-slate-100 leading-relaxed mb-4">{result.freelancerPitch}</p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleCopyPitch}
                  className="min-h-[44px] inline-flex items-center gap-2 rounded-lg bg-white text-slate-900 text-sm font-medium px-4
                             hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" aria-hidden="true" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" aria-hidden="true" /> Copy Pitch
                    </>
                  )}
                </button>
                <button
                  onClick={focusAuditInput}
                  className="min-h-[44px] inline-flex items-center gap-2 rounded-lg border border-slate-700 text-white text-sm font-medium px-4
                             hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900 transition-colors"
                >
                  Run Another Audit
                </button>
              </div>
            </article>
          </div>
        )}
      </section>

      {/* ---------- Footer ---------- */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-900">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" aria-hidden="true" />
              </span>
              SiteLingo AI
            </div>
            <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Footer">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToId(link.id)}
                  className="text-sm text-slate-600 hover:text-slate-900"
                >
                  {link.label}
                </button>
              ))}
            </nav>
          </div>
          <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between gap-2 text-xs text-slate-400">
            <p>© {new Date().getFullYear()} SiteLingo AI by Tuba. All rights reserved.</p>
            <p className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              Built with Next.js, Google PageSpeed Insights &amp; Gemini AI
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ScoreCard({ icon: Icon, label, score }: { icon: typeof Gauge; label: string; score: number }) {
  const status = scoreStatus(score);
  return (
    <div className={`rounded-xl border px-4 py-4 sm:px-5 sm:py-5 shadow-sm ${status.classes}`}>
      <div className="flex items-center justify-between mb-2">
        <Icon className="w-5 h-5" aria-hidden="true" />
        <span className="text-xs font-medium">{status.label}</span>
      </div>
      <p className="text-2xl sm:text-3xl font-bold leading-none">{score}</p>
      <p className="text-xs sm:text-sm mt-1 font-medium">{label}</p>
    </div>
  );
}