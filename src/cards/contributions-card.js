import {
  CARD_HEIGHT,
  CARD_WIDTH,
  ICONS,
  PADDING,
  TILE_GAP,
  TILE_HEIGHT,
  animate,
  card,
  escapeXml,
  formatCount,
  labelWithIcon,
  tile,
} from "../svg.js";

const RING_CX = 100;
const RING_CY = 130;
const RING_RADIUS = 44;
const RING_WIDTH = 9;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const RING_TARGET = 30;

const TILE_X = 184;
const TILE_WIDTH = CARD_WIDTH - PADDING - TILE_X;
const FIRST_TILE_Y = 74;

function formatDate(iso) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function range(pair) {
  return pair ? `${formatDate(pair[0])} – ${formatDate(pair[1])}` : "—";
}

// The last day is often still in progress, so a zero there doesn't break the run.
export function calculateStreaks(days) {
  let longest = 0;
  let longestRange = null;
  let run = 0;
  let runStart = null;

  for (const day of days) {
    if (day.contributionCount > 0) {
      run += 1;
      runStart = runStart ?? day.date;
      if (run > longest) {
        longest = run;
        longestRange = [runStart, day.date];
      }
    } else {
      run = 0;
      runStart = null;
    }
  }

  let current = 0;
  let currentRange = null;
  for (let i = days.length - 1; i >= 0; i -= 1) {
    if (days[i].contributionCount > 0) {
      current += 1;
      currentRange = [days[i].date, currentRange?.[1] ?? days[i].date];
    } else if (i === days.length - 1) {
      continue;
    } else {
      break;
    }
  }

  return { current, currentRange, longest, longestRange };
}

// Full ring at 30 days, so short streaks still read as progress.
function renderRing(streak, theme) {
  const progress = Math.min(streak.current / RING_TARGET, 1);

  return `
    <g transform="translate(${RING_CX}, ${RING_CY})">
      <circle r="${RING_RADIUS}" fill="none" stroke="#${theme.border}" stroke-width="${RING_WIDTH}"/>
      <circle class="ring" style="--dash:${RING_CIRCUMFERENCE.toFixed(2)}"
        r="${RING_RADIUS}" fill="none" stroke="#${theme.accent}" stroke-width="${RING_WIDTH}"
        stroke-linecap="round"
        stroke-dasharray="${RING_CIRCUMFERENCE.toFixed(2)}"
        stroke-dashoffset="${(RING_CIRCUMFERENCE * (1 - progress)).toFixed(2)}"
        transform="rotate(-90)"/>
      <text class="stat" x="0" y="2" text-anchor="middle">${streak.current}</text>
      <text class="row-dim" x="0" y="18" text-anchor="middle">${streak.current === 1 ? "day" : "days"}</text>
    </g>
    ${labelWithIcon(ICONS.flame, "CURRENT STREAK", RING_CX, RING_CY + 64, "middle")}
    <text class="row-dim" x="${RING_CX}" y="${RING_CY + 81}" text-anchor="middle">${escapeXml(
      streak.currentRange ? range(streak.currentRange) : "not active today",
    )}</text>`;
}

export function renderContributionsCard(stats, theme, options = {}) {
  const { title = "Contributions" } = options;
  const streak = calculateStreaks(stats.days);

  const tiles = [
    {
      icon: ICONS.calendar,
      label: "PAST YEAR",
      value: formatCount(stats.totalContributions),
    },
    {
      icon: ICONS.star,
      label: "LONGEST STREAK",
      value: `${streak.longest}d`,
    },
  ];

  const body = `
    ${renderRing(streak, theme)}
    ${tiles
      .map((item, index) =>
        animate(
          "rise",
          200 + index * 110,
          tile({
            ...item,
            theme,
            width: TILE_WIDTH,
            x: TILE_X,
            y: FIRST_TILE_Y + index * (TILE_HEIGHT + TILE_GAP),
          }),
        ),
      )
      .join("")}
    ${animate(
      "fade",
      450,
      `<text class="row-dim" x="${TILE_X + TILE_WIDTH / 2}" y="${
        FIRST_TILE_Y + 2 * TILE_HEIGHT + TILE_GAP + 16
      }" text-anchor="middle">${escapeXml(range(streak.longestRange))}</text>`,
    )}`;

  return card(CARD_WIDTH, CARD_HEIGHT, theme, title, body);
}
