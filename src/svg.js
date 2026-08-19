export function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// 1234 -> 1.2k, 1234567 -> 1.2M
export function formatCount(value) {
  if (value < 1000) {
    return String(value);
  }
  if (value < 1_000_000) {
    const k = value / 1000;
    return `${k >= 100 ? Math.round(k) : k.toFixed(1).replace(/\.0$/, "")}k`;
  }
  const m = value / 1_000_000;
  return `${m.toFixed(1).replace(/\.0$/, "")}M`;
}

// Two of these sit side by side inside a README's content column; the wide card
// matches that pair exactly so every row lines up.
export const CARD_WIDTH = 435;
export const CARD_HEIGHT = 235;
export const WIDE_WIDTH = 886;

export const PADDING = 24;
export const HEADER_RULE_Y = 52;
export const FONT = "'Segoe UI', Ubuntu, -apple-system, Helvetica, sans-serif";

// 16x16 octicons
export const ICONS = {
  commit:
    "M11.93 8.5a4.002 4.002 0 0 1-7.86 0H.75a.75.75 0 0 1 0-1.5h3.32a4.002 4.002 0 0 1 7.86 0h3.32a.75.75 0 0 1 0 1.5ZM8 10a2 2 0 1 0-.001-4.001A2 2 0 0 0 8 10Z",
  pr: "M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354ZM3.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm8.25.75a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Z",
  issue:
    "M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z",
  star: "M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z",
  repo: "M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 0 1 1-1ZM5 12.25v3.25a.25.25 0 0 0 .4.2l1.45-1.087a.25.25 0 0 1 .3 0L8.6 15.7a.25.25 0 0 0 .4-.2v-3.25a.25.25 0 0 0-.25-.25h-3.5a.25.25 0 0 0-.25.25Z",
  people:
    "M2 5.5a3.5 3.5 0 1 1 5.898 2.549 5.508 5.508 0 0 1 3.034 4.084.75.75 0 1 1-1.482.235 4 4 0 0 0-7.9 0 .75.75 0 0 1-1.482-.236A5.507 5.507 0 0 1 3.102 8.05 3.493 3.493 0 0 1 2 5.5ZM11 4a3.001 3.001 0 0 1 2.22 5.018 5.01 5.01 0 0 1 2.56 3.012.749.749 0 0 1-.885.954.752.752 0 0 1-.549-.514 3.507 3.507 0 0 0-2.522-2.372.75.75 0 0 1-.575-.729v-.352a.75.75 0 0 1 .416-.672A1.5 1.5 0 0 0 11 5.5.75.75 0 0 1 11 4Zm-5.5-.5a2 2 0 1 0-.001 3.999A2 2 0 0 0 5.5 3.5Z",
  flame:
    "M9.533.753V.752c.001.078.024 1.213-.469 2.484-.277.717-.694 1.464-1.322 2.108-.62.635-1.44 1.153-2.521 1.363-.223.043-.4.21-.4.437v3.505c0 .21.146.39.35.44 1.34.325 2.463 1.078 3.24 2.03.782.955 1.19 2.086 1.19 3.191a.75.75 0 0 0 1.5 0c0-1.46-.542-2.92-1.527-4.128-.882-1.08-2.09-1.916-3.503-2.35v-2.6c1.15-.318 2.06-.923 2.75-1.63.75-.77 1.24-1.65 1.56-2.48.4-1.03.56-2.01.62-2.63a.75.75 0 0 0-1.468-.2Z",
  calendar:
    "M4.75 0a.75.75 0 0 1 .75.75V2h5V.75a.75.75 0 0 1 1.5 0V2h1.25c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0 1 13.25 16H2.75A1.75 1.75 0 0 1 1 14.25V3.75C1 2.784 1.784 2 2.75 2H4V.75A.75.75 0 0 1 4.75 0ZM2.5 7.5v6.75c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25V7.5Zm10.75-4H2.75a.25.25 0 0 0-.25.25V6h11V3.75a.25.25 0 0 0-.25-.25Z",
  code: "M4.72 3.22a.75.75 0 0 1 1.06 1.06L2.06 8l3.72 3.72a.75.75 0 1 1-1.06 1.06L.47 8.53a.75.75 0 0 1 0-1.06Zm6.56 0a.75.75 0 1 0-1.06 1.06L13.94 8l-3.72 3.72a.75.75 0 1 0 1.06 1.06l4.25-4.25a.75.75 0 0 0 0-1.06Z",
  review:
    "M1.75 1h12.5c.966 0 1.75.784 1.75 1.75v8.5A1.75 1.75 0 0 1 14.25 13H8.06l-2.573 2.573A1.458 1.458 0 0 1 3 14.543V13H1.75A1.75 1.75 0 0 1 0 11.25v-8.5C0 1.784.784 1 1.75 1ZM11.28 6.28a.75.75 0 0 0-1.06-1.06L7.25 8.19 5.78 6.72a.75.75 0 0 0-1.06 1.06l2 2a.75.75 0 0 0 1.06 0Z",
};

// Rough advance width for .caption text, used to place an icon beside a label
// without measuring glyphs.
export function captionWidth(text) {
  return text.length * 6.4;
}

// .badge is 11px semibold with tracking, so it runs wider than .caption.
export function badgeWidth(text) {
  return text.length * 7.6;
}

// Icon plus caption as one unit, anchored left, centred or right.
export function labelWithIcon(path, text, x, y, align = "start") {
  const total = 16 + captionWidth(text);
  const originX =
    align === "end" ? x - total : align === "middle" ? x - total / 2 : x;

  return `${icon(path, originX, y - 9, 11)}<text class="caption" x="${(originX + 16).toFixed(
    1,
  )}" y="${y}">${escapeXml(text)}</text>`;
}

export function icon(path, x, y, size = 12) {
  return `<g transform="translate(${x}, ${y}) scale(${(size / 16).toFixed(4)})"><path class="icon" d="${path}"/></g>`;
}

export function baseStyles(theme) {
  return `
    .heading { font: 600 15px ${FONT}; fill: #${theme.title}; }
    .stat { font: 600 25px ${FONT}; fill: #${theme.text}; }
    .stat-sm { font: 600 18px ${FONT}; fill: #${theme.text}; }
    .caption {
      font: 500 10px ${FONT};
      fill: #${theme.text};
      fill-opacity: 0.55;
      letter-spacing: 0.08em;
    }
    .tile-value { font: 600 20px ${FONT}; fill: #${theme.text}; }
    .rank { font: 600 13px ${FONT}; fill: #${theme.title}; }
    .row { font: 600 11px ${FONT}; fill: #${theme.text}; }
    .row-dim { font: 500 10px ${FONT}; fill: #${theme.text}; fill-opacity: 0.55; }
    .badge { font: 600 11px ${FONT}; fill: #${theme.title}; letter-spacing: 0.08em; }
    .icon { fill: #${theme.accent}; fill-opacity: 0.85; }
  `;
}

// Declarative CSS only — GitHub renders SVG stylesheets but never runs scripts.
// Everything sits behind prefers-reduced-motion, so the still frame is the
// default and the animation is the enhancement.
function animationStyles() {
  return `
    @media (prefers-reduced-motion: no-preference) {
      .rise, .fade, .pop { opacity: 0; }
      .rise { animation: rise 0.55s ease-out forwards; }
      .fade { animation: fade 0.5s ease-out forwards; }
      .pop {
        transform-box: fill-box;
        transform-origin: center;
        animation: pop 0.6s cubic-bezier(0.34, 1.3, 0.64, 1) forwards;
      }
      .grow {
        transform-box: fill-box;
        transform-origin: left center;
        animation: grow 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards;
      }
      .ring { animation: ring 1.2s cubic-bezier(0.22, 1, 0.36, 1); }
      .sweep { animation: sweep 1.15s cubic-bezier(0.32, 0.9, 0.4, 1); }
      @keyframes sweep { from { stroke-dashoffset: var(--dash); } }
      @keyframes fade { to { opacity: 1; } }
      @keyframes rise {
        from { opacity: 0; transform: translateY(7px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes pop {
        from { opacity: 0; transform: scale(0.86); }
        to { opacity: 1; transform: scale(1); }
      }
      @keyframes grow { from { transform: scaleX(0); } }
      @keyframes ring { from { stroke-dashoffset: var(--dash); } }
    }
  `;
}

// A wrapper group, because a CSS transform would override the `transform`
// attribute an element already uses for positioning.
export function animate(className, delayMs, content) {
  if (!animated) {
    return content;
  }
  const delay = delayMs ? ` style="animation-delay:${delayMs}ms"` : "";
  return `<g class="${className}"${delay}>${content}</g>`;
}

let animated = true;

export function setAnimated(value) {
  animated = value !== false;
}

// Every card shares the same frame, header rule and font stack.
export function card(width, height, theme, heading, body, badgeMarkup = "") {
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(heading)}" color="#${theme.text}">
  <title>${escapeXml(heading)}</title>
  <style>${baseStyles(theme)}${animated ? animationStyles() : ""}</style>
  <rect x="0.5" y="0.5" rx="10" width="${width - 1}" height="${height - 1}" fill="#${theme.bg}" stroke="#${theme.border}"/>
  <text class="heading" x="${PADDING}" y="34">${escapeXml(heading)}</text>
  ${badgeMarkup}
  <line x1="${PADDING}" y1="${HEADER_RULE_Y}" x2="${width - PADDING}" y2="${HEADER_RULE_Y}" stroke="#${theme.border}"/>
  ${body}
</svg>
`;
}

export function badge(text, width, path = null) {
  const label = `<text class="badge" x="${width - PADDING}" y="34" text-anchor="end">${escapeXml(text)}</text>`;
  if (!path) {
    return label;
  }
  return `${icon(path, width - PADDING - badgeWidth(text) - 16, 24, 11)}${label}`;
}

// Reveals a donut clockwise from 12 o'clock by drawing a masking arc of the
// same thickness. With reduced motion the mask is simply fully drawn.
export function donutSweep(id, cx, cy, outer, inner, content) {
  if (!animated) {
    return content;
  }

  const radius = (outer + inner) / 2;
  const circumference = 2 * Math.PI * radius;

  return `
    <mask id="${id}">
      <circle class="sweep" style="--dash:${circumference.toFixed(2)}"
        cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="white"
        stroke-width="${outer - inner}"
        stroke-dasharray="${circumference.toFixed(2)}" stroke-dashoffset="0"
        transform="rotate(-90 ${cx} ${cy})"/>
    </mask>
    <g mask="url(#${id})">${content}</g>`;
}

export const TILE_HEIGHT = 66;
export const TILE_GAP = 8;

// One metric as its own small framed card: icon in the corner, value and label
// centred underneath it.
export function tile({ x, y, width, icon: path, value, label, theme }) {
  const fill = theme.tileBg ? `#${theme.tileBg}` : "currentColor";
  const fillOpacity = theme.tileBg ? "1" : "0.035";
  const stroke = theme.tileBorder ?? theme.border;
  const center = width / 2;

  return `
    <g transform="translate(${x.toFixed(2)}, ${y})">
      <rect x="0" y="0" rx="6" width="${width.toFixed(2)}" height="${TILE_HEIGHT}"
        fill="${fill}" fill-opacity="${fillOpacity}" stroke="#${stroke}"/>
      ${icon(path, width - 26, 10, 14)}
      <text class="tile-value" x="${center.toFixed(2)}" y="38" text-anchor="middle">${escapeXml(value)}</text>
      <text class="caption" x="${center.toFixed(2)}" y="55" text-anchor="middle">${escapeXml(label)}</text>
    </g>`;
}

// Column geometry for a row of tiles spanning the card's inner width.
export function tileColumns(cardWidth, columns) {
  const inner = cardWidth - PADDING * 2;
  const width = (inner - (columns - 1) * TILE_GAP) / columns;
  return { width, x: (index) => PADDING + index * (width + TILE_GAP) };
}

// Rank as a filled ring in the header, which reads far better than plain text.
export function rankRing(rank, cardWidth, theme) {
  const radius = 14;
  const cx = cardWidth - PADDING - radius;
  const cy = 26;
  const circumference = 2 * Math.PI * radius;
  const progress = (100 - rank.percentile) / 100;

  return `
    <text class="caption" x="${cx - radius - 10}" y="30" text-anchor="end">RANK</text>
    <g transform="translate(${cx}, ${cy})">
      <circle r="${radius}" fill="none" stroke="#${theme.border}" stroke-width="4"/>
      <circle class="ring" style="--dash:${circumference.toFixed(2)}"
        r="${radius}" fill="none" stroke="#${theme.accent}" stroke-width="4"
        stroke-linecap="round"
        stroke-dasharray="${circumference.toFixed(2)}"
        stroke-dashoffset="${(circumference * (1 - progress)).toFixed(2)}"
        transform="rotate(-90)"/>
      <text class="rank" x="0" y="5" text-anchor="middle">${escapeXml(rank.level)}</text>
    </g>`;
}

// Donut slice between two angles, measured clockwise from 12 o'clock.
export function donutSlice(cx, cy, outer, inner, startAngle, endAngle) {
  const point = (radius, angle) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return [cx + radius * Math.cos(rad), cy + radius * Math.sin(rad)];
  };

  const large = endAngle - startAngle > 180 ? 1 : 0;
  const [x1, y1] = point(outer, startAngle);
  const [x2, y2] = point(outer, endAngle);
  const [x3, y3] = point(inner, endAngle);
  const [x4, y4] = point(inner, startAngle);

  return [
    `M ${x1.toFixed(2)} ${y1.toFixed(2)}`,
    `A ${outer} ${outer} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`,
    `L ${x3.toFixed(2)} ${y3.toFixed(2)}`,
    `A ${inner} ${inner} 0 ${large} 0 ${x4.toFixed(2)} ${y4.toFixed(2)}`,
    "Z",
  ].join(" ");
}
