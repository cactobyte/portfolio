// The n-word and its common spellings, plus the asterisk-masked form ("n****") that speech services
// return when their profanity filter censors it. Requires "gg" so "Niger"/"Nigeria" don't match.
const PATTERN = /\bn(?:igg(?:a|ah|as|az|er|ers|uh|uhs)|\*{3,}s?)(?![a-z*])/gi;

export function countHits(text: string) {
  return text.match(PATTERN)?.length ?? 0;
}

export interface Segment {
  text: string;
  hit: boolean;
}

/** Splits text into plain segments and censored hits, so the word itself is never rendered. */
export function censor(text: string): Segment[] {
  const segments: Segment[] = [];
  let last = 0;
  for (const match of text.matchAll(PATTERN)) {
    if (match.index > last) segments.push({ text: text.slice(last, match.index), hit: false });
    segments.push({ text: "n-word", hit: true });
    last = match.index + match[0].length;
  }
  if (last < text.length) segments.push({ text: text.slice(last), hit: false });
  return segments;
}
