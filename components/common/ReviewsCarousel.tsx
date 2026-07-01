"use client";

import { useRef } from "react";
import { doctor } from "@/lib/data";

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-xs mb-sm text-tertiary">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className="material-symbols-outlined"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          star
        </span>
      ))}
    </div>
  );
}

export default function ReviewsCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const reviews = doctor.sample_reviews;
  const { score, reviews_count, satisfaction_percent } = doctor.rating;

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
        {reviews.map((r, i) => (
          <div
            key={i}
            className="min-w-[320px] md:min-w-[400px] bg-surface p-lg rounded-2xl shadow-sm border border-outline-variant/20 snap-start flex flex-col"
          >
            <StarRating count={5} />
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
