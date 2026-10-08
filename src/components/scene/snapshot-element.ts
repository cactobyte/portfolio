/**
 * Paints an element's backgrounds, borders, single-line text and underlines onto a
 * canvas, at `scale` canvas px per CSS px. Covers what the monitor's project list
 * uses, not general HTML. Measures a detached, untransformed clone, so the result
 * matches the live layout whatever 3D transform the original sits under.
 * Also returns where its links sit, as fractions of its size, for hit-testing taps.
 */
export function snapshotElement(el: HTMLElement, scale: number) {
  const clone = el.cloneNode(true) as HTMLElement;
  Object.assign(clone.style, {
    position: "fixed",
    left: "0",
    top: "0",
    zoom: "1",
    opacity: "1",
    visibility: "hidden",
    pointerEvents: "none",
  });
  document.body.append(clone);
  try {
    const origin = clone.getBoundingClientRect();
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(origin.width * scale);
    canvas.height = Math.round(origin.height * scale);
    const ctx = canvas.getContext("2d")!;
    ctx.scale(scale, scale);
    ctx.translate(-origin.left, -origin.top);
    const links: SnapshotLink[] = [];
    const walker = document.createTreeWalker(clone, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    for (let node: Node | null = clone; node; node = walker.nextNode()) {
      if (node instanceof HTMLElement) paintBox(ctx, node);
      else if (node instanceof Text && node.data.trim()) paintText(ctx, node);
      if (node instanceof HTMLAnchorElement) {
        const r = node.getBoundingClientRect();
        links.push({
          href: node.href,
          newTab: node.target === "_blank",
          left: (r.left - origin.left) / origin.width,
          top: (r.top - origin.top) / origin.height,
          right: (r.right - origin.left) / origin.width,
          bottom: (r.bottom - origin.top) / origin.height,
        });
      }
    }
    return { canvas, links };
  } finally {
    clone.remove();
  }
}

export type SnapshotLink = { href: string; newTab: boolean; left: number; top: number; right: number; bottom: number };

const isTransparent = (color: string) => color === "transparent" || /^rgba\(.*,\s*0\)$/.test(color);

function paintBox(ctx: CanvasRenderingContext2D, el: HTMLElement) {
  const cs = getComputedStyle(el);
  const r = el.getBoundingClientRect();
  if (!isTransparent(cs.backgroundColor)) {
    ctx.fillStyle = cs.backgroundColor;
    ctx.beginPath();
    ctx.roundRect(r.left, r.top, r.width, r.height, Math.min(parseFloat(cs.borderTopLeftRadius) || 0, r.width / 2, r.height / 2));
    ctx.fill();
  }
  const sides = [
    [cs.borderTopWidth, cs.borderTopColor, r.left, r.top, r.width, 0],
    [cs.borderBottomWidth, cs.borderBottomColor, r.left, r.bottom, r.width, -1],
  ] as const;
  for (const [width, color, x, y, w, dir] of sides) {
    const t = parseFloat(width);
    if (!t || isTransparent(color)) continue;
    ctx.fillStyle = color;
    ctx.fillRect(x, y + dir * t, w, t);
  }
}

function paintText(ctx: CanvasRenderingContext2D, node: Text) {
  const parent = node.parentElement!;
  const cs = getComputedStyle(parent);
  const range = document.createRange();
  range.selectNodeContents(node);
  const rect = range.getBoundingClientRect();
  if (!rect.width) return;

  ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  if ("letterSpacing" in ctx) ctx.letterSpacing = cs.letterSpacing === "normal" ? "0px" : cs.letterSpacing;
  let text = node.data.replace(/\s+/g, " ").trim();
  const metrics = ctx.measureText(text);
  // Stretch to the laid-out width: a no-op where letter-spacing applied, a close fit where it can't.
  const stretch = rect.width / metrics.width;
  const ascent = metrics.fontBoundingBoxAscent;
  const baseline = rect.top + (rect.height - ascent - metrics.fontBoundingBoxDescent) / 2 + ascent;

  // `truncate`: the range reports the full width, so clip to the parent with an ellipsis.
  const available = parent.getBoundingClientRect().right - rect.left;
  if (cs.textOverflow === "ellipsis" && rect.width > available + 0.5) {
    while (text && ctx.measureText(`${text}…`).width * stretch > available) text = text.slice(0, -1);
    text = `${text.trimEnd()}…`;
  }

  ctx.fillStyle = cs.color;
  ctx.save();
  ctx.translate(rect.left, baseline);
  ctx.scale(stretch, 1);
  ctx.fillText(text, 0, 0);
  ctx.restore();

  if (cs.textDecorationLine.includes("underline")) {
    const thickness = parseFloat(cs.textDecorationThickness) || 1;
    ctx.fillStyle = cs.textDecorationColor;
    ctx.fillRect(rect.left, baseline + (parseFloat(cs.textUnderlineOffset) || 0), rect.width, thickness);
  }
}
