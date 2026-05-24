"use client";

import { useState, useEffect } from "react";

interface RatingWidgetProps {
  slug: string;
  toolName: string;
}

interface RatingData {
  ratings: { id: string; stars: number; review: string; createdAt: string }[];
  count: number;
  average: number;
}

export function RatingWidget({ slug, toolName }: RatingWidgetProps) {
  const [data, setData] = useState<RatingData | null>(null);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedStar, setSelectedStar] = useState(0);
  const [review, setReview] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alreadyRated, setAlreadyRated] = useState(false);

  useEffect(() => {
    // Check localStorage
    const stored = localStorage.getItem(`rated-${slug}`);
    if (stored) setAlreadyRated(true);

    // Fetch existing ratings
    fetch(`/api/ratings?slug=${slug}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({ ratings: [], count: 0, average: 0 }));
  }, [slug]);

  async function handleSubmit() {
    if (selectedStar === 0 || loading) return;
    setLoading(true);

    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, stars: selectedStar, review }),
      });

      if (res.ok) {
        setSubmitted(true);
        setAlreadyRated(true);
        localStorage.setItem(`rated-${slug}`, "1");
        // Refresh data
        const updated = await fetch(`/api/ratings?slug=${slug}`).then((r) => r.json());
        setData(updated);
      }
    } catch {
      // Silently fail
    }
    setLoading(false);
  }

  if (submitted || alreadyRated) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
        <p className="text-sm font-medium text-emerald-700">
          {submitted ? "Thanks for your rating!" : "You've already rated this tool"}
        </p>
        {data && data.count > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((s) => (
                <svg
                  key={s}
                  className={`h-5 w-5 ${s <= Math.round(data.average) ? "text-amber-400" : "text-gray-200"}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm text-emerald-700">
              {data.average}/5 ({data.count} {data.count === 1 ? "rating" : "ratings"})
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-white p-6">
      <h3 className="text-sm font-semibold text-[var(--color-ink)]">
        Rate {toolName}
      </h3>

      {/* Aggregate rating display */}
      {data && data.count > 0 && (
        <div className="mt-2 flex items-center gap-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((s) => (
              <svg
                key={s}
                className={`h-4 w-4 ${s <= Math.round(data.average) ? "text-amber-400" : "text-gray-200"}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-xs text-[var(--color-ink-muted)]">
            {data.average}/5 · {data.count} {data.count === 1 ? "rating" : "ratings"}
          </span>
        </div>
      )}

      {/* Star selector */}
      <div className="mt-4 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(0)}
            onClick={() => setSelectedStar(star)}
            className="p-0.5 transition-transform hover:scale-110"
          >
            <svg
              className={`h-8 w-8 transition-colors ${
                star <= (hoveredStar || selectedStar)
                  ? "text-amber-400"
                  : "text-gray-200"
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
        {selectedStar > 0 && (
          <span className="ml-2 text-sm text-[var(--color-ink-muted)]">
            {selectedStar === 1 && "Poor"}
            {selectedStar === 2 && "Fair"}
            {selectedStar === 3 && "Good"}
            {selectedStar === 4 && "Great"}
            {selectedStar === 5 && "Excellent"}
          </span>
        )}
      </div>

      {/* Review text */}
      {selectedStar > 0 && (
        <>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Write a short review (optional)"
            className="mt-3 w-full rounded-lg border border-[var(--color-border)] p-3 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
            rows={3}
            maxLength={500}
          />
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-3 rounded-full bg-[var(--color-accent)] px-5 py-2 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Rating"}
          </button>
        </>
      )}

      {/* Recent reviews */}
      {data && data.ratings.length > 0 && (
        <div className="mt-5 border-t border-[var(--color-border)] pt-4">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-muted)]">
            Recent Reviews
          </h4>
          <div className="mt-3 space-y-3">
            {data.ratings
              .filter((r) => r.review)
              .slice(-3)
              .reverse()
              .map((r) => (
                <div key={r.id} className="flex items-start gap-2">
                  <div className="flex shrink-0">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg
                        key={s}
                        className={`h-3.5 w-3.5 ${s <= r.stars ? "text-amber-400" : "text-gray-200"}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-xs text-[var(--color-ink-faint)]">{r.review}</p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
