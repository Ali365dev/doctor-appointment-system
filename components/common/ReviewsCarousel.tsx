"use client";

import { useRef } from "react";

const reviews = [
  {
    stars: 5,
    text: '"Dr. Specialist is incredibly thorough. He took the time to explain my condition in simple terms and the treatment plan has worked wonders. Highly recommend!"',
    initials: "SC",
    name: "Sarah Connor",
    role: "Patient",
  },
  {
    stars: 4.5,
    text: '"Professional staff and modern clinic. The appointment was on time and the doctor\'s diagnosis was spot on. Very grateful for the care received here."',
    initials: "MR",
    name: "Michael Reed",
    role: "Patient",
  },
  {
    stars: 5,
    text: '"Finally found a doctor who listens. The endoscopy procedure was painless and the follow-up care has been exceptional. Best gastroenterologist in town."',
    initials: "JW",
    name: "James Wilson",
    role: "Patient",
  },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-xs mb-sm text-tertiary">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className="material-symbols-outlined"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {i <= Math.floor(count) ? "star" : count >= i - 0.5 ? "star_half" : "star_border"}
        </span>
      ))}
    </div>
  );
}

export default function ReviewsCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") =>
    scrollRef.current?.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" });

  return (
    <section className="py-xl px-gutter max-w-[1280px] mx-auto">
      <div className="flex justify-between items-end mb-xl">
        <div>
          <h2 className="text-headline-lg font-bold leading-[1.2] tracking-[-0.02em] text-on-surface">
            Patient Reviews
          </h2>
          <p className="text-on-surface-variant mt-xs">Real stories from our valued patients</p>
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
            key={r.name}
            className="min-w-[320px] md:min-w-[400px] bg-surface p-lg rounded-2xl shadow-sm border border-outline-variant/20 snap-start"
          >
            <StarRating count={r.stars} />
            <p className="italic text-on-surface-variant mb-md">{r.text}</p>
            <div className="flex items-center gap-sm">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                {r.initials}
              </div>
              <div>
                <p className="text-label-md font-semibold text-on-surface">{r.name}</p>
                <p className="text-caption text-outline">{r.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
