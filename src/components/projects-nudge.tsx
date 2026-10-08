"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Caveat } from "next/font/google";

const hand = Caveat({ subsets: ["latin"], weight: "600" });

const NOTE = (
  <>
    check out the
    <br />
    stuff I made
  </>
);

// Written, then the arrow drawn from the note to the button: one short pen sequence.
const note: Variants = {
  hidden: { clipPath: "inset(0 100% 0 0)" },
  shown: { clipPath: "inset(0 0% 0 0)", transition: { duration: 0.5, ease: "easeOut" } },
};
const stroke: Variants = {
  hidden: { pathLength: 0 },
  shown: { pathLength: 1, transition: { delay: 0.45, duration: 0.7, ease: [0.65, 0, 0.35, 1] } },
};
const head: Variants = {
  hidden: { pathLength: 0 },
  shown: { pathLength: 1, transition: { delay: 1.1, duration: 0.15, ease: "easeOut" } },
};

/**
 * Hand-drawn note and arrow pointing at the "View projects" button. Positioned against
 * a `relative w-fit` wrapper around the button row (the button is last, at its right
 * edge): beside the row on wide screens, below it on narrower ones, and on phones,
 * where the buttons stack, below the button at the bottom left.
 */
export function ProjectsNudge() {
  const reduced = useReducedMotion();
  const pen = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.4,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  } as const;

  return (
    <motion.div
      aria-hidden="true"
      initial={reduced ? "shown" : "hidden"}
      whileInView="shown"
      viewport={{ once: true, amount: 0.9 }}
      className={`${hand.className} pointer-events-none absolute inset-0 text-2xl leading-none text-ink select-none`}
    >
      {/* Wide screens: from the note at the upper right, curving down into the button's side. */}
      <div className="absolute top-[calc(50%-128px)] left-[calc(100%+2px)] hidden h-[150px] w-[380px] lg:block">
        <motion.p variants={note} className="absolute top-[36px] left-[204px] -rotate-3 whitespace-nowrap">
          {NOTE}
        </motion.p>
        <svg viewBox="0 0 200 120" className="absolute bottom-0 left-0 h-[120px] w-[200px]">
          <motion.path variants={stroke} {...pen} d="M192 34 C 168 24, 150 42, 138 62 S 100 112, 60 108 S 24 100, 10 98" />
          <motion.path variants={head} {...pen} d="M23 87 L10 98 L25 105" />
        </svg>
      </div>
      {/* Narrower screens: below, from the note up into the underside of the button (stacked under
          Download CV on phones, beside it from sm, where its centre is ~90px in from the right). */}
      <div className="absolute top-[calc(100%+8px)] left-[60px] h-[200px] w-[120px] sm:left-[calc(100%-111px)] lg:hidden">
        <svg viewBox="0 0 120 150" className="absolute top-0 left-0 h-[150px] w-[120px]">
          <motion.path variants={stroke} {...pen} d="M100 140 C 70 142, 30 124, 28 84 S 22 32, 20 10" />
          <motion.path variants={head} {...pen} d="M11 22 L20 8 L31 21" />
        </svg>
        <motion.p variants={note} className="absolute top-[150px] left-[50px] rotate-2 whitespace-nowrap">
          {NOTE}
        </motion.p>
      </div>
    </motion.div>
  );
}
