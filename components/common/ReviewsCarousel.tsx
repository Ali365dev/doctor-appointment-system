"use client";

import { useRef, useState, useEffect } from "react";
import { doctor } from "@/lib/data";
import type { Review as DbReview } from "@/types/review";

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-xs mb-sm text-tertiary">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className="material-symbols-outlined"
          style={i <= count ? { fontVariationSettings: "'FILL' 1" } : undefined}
        >
          star
        </span>
      ))}
    </div>
  );
}

/** Shared shape between DB-backed reviews and the static fallback sample reviews. */
interface DisplayReview {
  key: string;
  text: string;
  reviewer: string;
  time_ago: string;
  verified: boolean;
  rating: number;
}

export default function ReviewsCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [dbReviews, setDbReviews] = useState<DbReview[] | null>(null);
  const [stats, setStats] = useState<{ count: number; average: number } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/reviews/public");
        const data = await res.json();
        if (res.ok) {
          setDbReviews(data.reviews ?? []);
          setStats(data.stats ?? null);
        }
      } catch {
        // Non-fatal — falls back to the static sample reviews below.
      }
    })();
  }, []);

  // Real, moderated reviews take priority; fall back to the static sample
  // set only until there's enough real content (avoids an empty homepage
  // section right after this feature ships).
  const reviews: DisplayReview[] =
    dbReviews && dbReviews.length > 0
      ? dbReviews.map((r) => ({
          key: r.id,
          text: r.comment,
          reviewer: r.patientName,
          time_ago: new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
          verified: true,
          rating: r.rating,
        }))
      : doctor.sample_reviews.map((r, i) => ({ key: String(i), ...r, rating: 5 }));

  const score = stats && stats.count > 0 ? stats.average.toFixed(1) : doctor.rating.score;
  const reviews_count = stats && stats.count > 0 ? stats.count : doctor.rating.reviews_count;
  const { satisfaction_percent } = doctor.rating;

  const scroll = (dir: "left" | "right") =>
    scrollRef.current?.scrollBy({ left: dir === "left" ? -340 : 340, behavior: "smooth" });

  if (!reviews.length) return null;

  return (
    <section className="py-xl px-gutter max-w-[1280px] mx-auto">
      <div className="flex justify-between items-end mb-xl">
        <div>
          <h2 className="text-headline-lg font-bold leading-[1.2] tracking-[-0.02em] text-on-surface">
            Patient Reviews
          </h2>
          <p className="text-on-surface-variant mt-xs">
            {score} ★ average · {reviews_count}+ reviews · {satisfaction_percent}% patient satisfaction
          </p>
        </div>
        <div className="flex gap-xs">
          <button
            onClick={() => scroll("left")}
            aria-label="Previous reviews"
            className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center hover:bg-[#dbe1ff] transition-colors"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button
            onClick={() => scroll("right")}
            aria-label="Next reviews"
            className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center hover:bg-[#dbe1ff] transition-colors"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-md overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-md snap-x snap-mandatory"
      >
        {reviews.map((r) => (
          <div
            key={r.key}
            className="min-w-[320px] md:min-w-[400px] bg-surface p-lg rounded-2xl shadow-sm border border-outline-variant/20 snap-start flex flex-col"
          >
            <StarRating count={r.rating} />
            <p className="italic text-on-surface-variant mb-md flex-1">&ldquo;{r.text}&rdquo;</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-sm">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary uppercase">
                  {r.reviewer.charAt(0)}
                </div>
                <div>
                  <p className="text-label-md font-semibold text-on-surface">{r.reviewer}</p>
                  <p className="text-caption text-outline">{r.time_ago}</p>
                </div>
              </div>
              {r.verified && (
                <div className="flex items-center gap-xs text-secondary text-caption font-semibold">
                  <span
                    className="material-symbols-outlined text-[16px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified
                  </span>
                  Verified
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
