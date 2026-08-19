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
} from "../svg.js";

const CENTER_X = 98;
const CENTER_Y = 142;
const OUTER = 54;
const INNER = 36;

const LEGEND_X = 184;
const LEGEND_TOP = 82;
const LEGEND_BOTTOM = 214;
const MAX_LEGEND_GAP = 24;

// Matches the .sweep duration in the shared stylesheet.
const SWEEP_MS = 1150;

// Percentages are relative to the languages shown, so they add up to 100.
function toShares(languages, count) {
  const shown = languages.slice(0, count);
  const total = shown.reduce((sum, lang) => sum + lang.size, 0);
  if (total === 0) {
    return [];
  }
  return shown.map((lang) => ({
    name: lang.name,
    color: lang.color,
    percent: (lang.size / total) * 100,
  }));
}

function renderDonut(shares, theme) {
  // A single language would make the arc degenerate, so draw a ring instead.
  if (shares.length === 1) {
    return `<circle cx="${CENTER_X}" cy="${CENTER_Y}" r="${
      (OUTER + INNER) / 2
    }" fill="none" stroke="${escapeXml(shares[0].color)}" stroke-width="${OUTER - INNER}"/>`;
  }

  let angle = 0;
  return shares
    .map((lang) => {
      const sweep = (lang.percent / 100) * 360;
      const path = donutSlice(CENTER_X, CENTER_Y, OUTER, INNER, angle, angle + sweep);
      angle += sweep;
      return `<path d="${path}" fill="${escapeXml(lang.color)}" stroke="#${
        theme.bg
      }" stroke-width="1.5"/>`;
    })
    .join("");
}

// The legend stretches to fill the card, so 5 and 10 entries both look balanced.
// Each row lands as its own slice is revealed by the sweep.
function renderLegend(shares) {
  const gap =
    shares.length > 1
      ? Math.min((LEGEND_BOTTOM - LEGEND_TOP) / (shares.length - 1), MAX_LEGEND_GAP)
      : 0;

  let swept = 0;

  return shares
    .map((lang, index) => {
      const y = LEGEND_TOP + index * gap;
      const delay = Math.round((swept / 100) * SWEEP_MS);
      swept += lang.percent;

      return animate(
        "rise",
        delay,
        `
      <g transform="translate(${LEGEND_X}, ${y.toFixed(1)})">
        <rect x="0" y="-7" width="8" height="8" rx="2" fill="${escapeXml(lang.color)}"/>
        <text class="row" x="16" y="0">${escapeXml(lang.name)}</text>
        <text class="row-dim" x="${CARD_WIDTH - PADDING - LEGEND_X}" y="0" text-anchor="end">${lang.percent.toFixed(
          1,
        )}%</text>
      </g>`,
      );
    })
    .join("");
}

export function renderLangsCard(languages, theme, options = {}) {
  const { title = "Languages", count = 8, subtitle = null } = options;
  const shares = toShares(languages, count);
  const top = shares[0];

  const body = `
    ${donutSweep("lang-sweep", CENTER_X, CENTER_Y, OUTER, INNER, renderDonut(shares, theme))}
    ${top ? animate("fade", 700, `<text class="stat-sm" x="${CENTER_X}" y="${CENTER_Y + 6}" text-anchor="middle">${top.percent.toFixed(0)}%</text>`) : ""}
    ${renderLegend(shares)}`;

  const badgeMarkup = subtitle ? badge(subtitle, CARD_WIDTH, ICONS.code) : "";

  return card(CARD_WIDTH, CARD_HEIGHT, theme, title, body, badgeMarkup);
}
