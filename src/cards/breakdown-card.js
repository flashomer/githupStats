import {
  CARD_HEIGHT,
  CARD_WIDTH,
  ICONS,
  PADDING,
  animate,
  badge,
  card,
  donutSlice,
  donutSweep,
  escapeXml,
  formatCount,
} from "../svg.js";

const CENTER_X = 98;
const CENTER_Y = 142;
const OUTER = 54;
const INNER = 36;

const LEGEND_X = 184;
const LEGEND_TOP = 106;
const LEGEND_GAP = 34;
const SWEEP_MS = 1150;

// Fixed hues so the slices stay distinguishable on light and dark cards.
const SEGMENTS = [
  { key: "commits", label: "Commits", color: "#3fb950" },
  { key: "prs", label: "Pull requests", color: "#58a6ff" },
  { key: "issues", label: "Issues", color: "#d29922" },
];

function renderDonut(slices, total, theme) {
  // A lone slice sweeps a full circle, which makes the arc degenerate.
  if (slices.length === 1) {
    return `<circle cx="${CENTER_X}" cy="${CENTER_Y}" r="${
      (OUTER + INNER) / 2
    }" fill="none" stroke="${slices[0].color}" stroke-width="${OUTER - INNER}"/>`;
  }

  let angle = 0;
  return slices
    .map((slice) => {
      const sweep = (slice.value / total) * 360;
      const path = donutSlice(CENTER_X, CENTER_Y, OUTER, INNER, angle, angle + sweep);
      angle += sweep;
      return `<path d="${path}" fill="${slice.color}" stroke="#${theme.bg}" stroke-width="1.5"/>`;
    })
    .join("");
}

// Each row lands as its own slice is revealed by the sweep.
function renderLegend(slices, total) {
  let swept = 0;

  return slices
    .map((slice, index) => {
      const y = LEGEND_TOP + index * LEGEND_GAP;
      const percent = (slice.value / total) * 100;
      const delay = Math.round((swept / 100) * SWEEP_MS);
      swept += percent;

      return animate(
        "rise",
        delay,
        `
      <g transform="translate(${LEGEND_X}, ${y})">
        <rect x="0" y="-7" width="8" height="8" rx="2" fill="${slice.color}"/>
        <text class="row" x="16" y="0">${escapeXml(slice.label)}</text>
        <text class="row-dim" x="${CARD_WIDTH - PADDING - LEGEND_X}" y="0" text-anchor="end">${percent.toFixed(
          1,
        )}%</text>
        <text class="row-dim" x="16" y="14">${formatCount(slice.value)}</text>
      </g>`,
      );
    })
    .join("");
}

export function renderBreakdownCard(stats, theme, options = {}) {
  const { title = "Contribution Mix" } = options;

  // Lifetime totals, so all three slices come from the same time window.
  const values = { commits: stats.commits, prs: stats.prs, issues: stats.issues };
  const slices = SEGMENTS.map((segment) => ({
    ...segment,
    value: values[segment.key] ?? 0,
  })).filter((slice) => slice.value > 0);

  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  if (total === 0) {
    return null;
  }

  const body = `
    ${donutSweep("mix-sweep", CENTER_X, CENTER_Y, OUTER, INNER, renderDonut(slices, total, theme))}
    ${animate(
      "fade",
      700,
      `<text class="stat-sm" x="${CENTER_X}" y="${CENTER_Y + 1}" text-anchor="middle">${formatCount(total)}</text>
       <text class="row-dim" x="${CENTER_X}" y="${CENTER_Y + 16}" text-anchor="middle">total</text>`,
    )}
    ${renderLegend(slices, total)}`;

  return card(
    CARD_WIDTH,
    CARD_HEIGHT,
    theme,
    title,
    body,
    badge("ALL TIME", CARD_WIDTH, ICONS.repo),
  );
}
