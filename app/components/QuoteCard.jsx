"use client";
import { useState, useEffect, useCallback } from "react";

function getCacheKey() {
  const hour = new Date().getHours();
  const period = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
  return `routine-quote-${new Date().toDateString()}-${period}`;
}

export default function QuoteCard() {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchQuote = useCallback(async (skipCache) => {
    if (!skipCache) {
      const cached = localStorage.getItem(getCacheKey());
      if (cached) {
        setQuote(JSON.parse(cached));
        return;
      }
    }

    setLoading(true);
    try {
      const res = await fetch(skipCache ? "/api/quote?random=true" : "/api/quote");
      const data = await res.json();
      setQuote(data);
      localStorage.setItem(getCacheKey(), JSON.stringify(data));
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuote(false);
  }, [fetchQuote]);

  if (!quote) return null;

  return (
    <div className="mb-6 flex items-start gap-3 rounded-2xl border border-zinc-200/80 bg-gradient-to-r from-indigo-50/50 via-white to-purple-50/50 px-6 py-4 dark:border-zinc-800 dark:from-indigo-950/20 dark:via-zinc-900/50 dark:to-purple-950/20">
      <div className="flex-1">
        <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 italic">
          &ldquo;{quote.text}&rdquo;
        </p>
        <p className="mt-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
          — {quote.author}
        </p>
      </div>
      <button
        onClick={() => fetchQuote(true)}
        disabled={loading}
        className="shrink-0 rounded-lg p-1.5 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:text-indigo-400 dark:hover:bg-indigo-900/30 transition-colors disabled:opacity-50"
        title="New quote"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={loading ? "animate-spin" : ""}
        >
          <polyline points="23 4 23 10 17 10" />
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
        </svg>
      </button>
    </div>
  );
}
