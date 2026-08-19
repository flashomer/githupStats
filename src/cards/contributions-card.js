import {
  CARD_HEIGHT,
  CARD_WIDTH,
  ICONS,
  PADDING,
  TILE_HEIGHT,
  animate,
  card,
  escapeXml,
  formatCount,
  labelWithIcon,
  tile,
  tileColumns,
} from "../svg.js";

const FIRST_ROW = 74;
const BAR_Y = FIRST_ROW + TILE_HEIGHT + 42;
const BAR_HEIGHT = 10;
const BAR_WIDTH = CARD_WIDTH - PADDING * 2;
const LEGEND_Y = BAR_Y + 34;

// Fixed hues so the segments stay distinguishable on light and dark cards.
const SEGMENTS = [
  { key: "commits", label: "Commits", color: "#3fb950" },
  { key: "prs", label: "Pull requests", color: "#58a6ff" },
  { key: "issues", label: "Issues", color: "#d29922" },
];

function formatDate(iso) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
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

function renderBar(slices, total) {
  let offset = 0;
  const segments = slices
    .map((slice) => {
      const width = (slice.value / total) * BAR_WIDTH;
      const rect = `<rect mask="url(#mix-mask)" x="${(PADDING + offset).toFixed(
        2,
      )}" y="${BAR_Y}" width="${width.toFixed(2)}" height="${BAR_HEIGHT}" fill="${slice.color}"/>`;
      offset += width;
      return rect;
    })
    .join("");

  return `
    <mask id="mix-mask">
      <rect x="${PADDING}" y="${BAR_Y}" width="${BAR_WIDTH}" height="${BAR_HEIGHT}" rx="5" fill="white"/>
    </mask>
    ${segments}`;
}

function renderLegend(slices, total) {
  const step = BAR_WIDTH / slices.length;

  return slices
    .map((slice, index) => {
      const percent = ((slice.value / total) * 100).toFixed(1);
      return animate(
        "rise",
        520 + index * 80,
        `
      <g transform="translate(${(PADDING + index * step).toFixed(2)}, ${LEGEND_Y})">
        <rect x="0" y="-8" width="8" height="8" rx="2" fill="${slice.color}"/>
        <text class="row" x="16" y="0">${escapeXml(slice.label)}</text>
        <text class="row-dim" x="16" y="14">${formatCount(slice.value)} · ${percent}%</text>
      </g>`,
      );
    })
    .join("");
}

export function renderContributionsCard(stats, theme, options = {}) {
  const { title = "Contributions" } = options;
  const streak = calculateStreaks(stats.days);
  const { width, x } = tileColumns(CARD_WIDTH, 3);

  const tiles = [
    {
      icon: ICONS.calendar,
      label: "PAST YEAR",
      value: formatCount(stats.totalContributions),
    },
    {
      icon: ICONS.flame,
      label: "CURRENT STREAK",
      value: `${streak.current}d`,
    },
    {
      icon: ICONS.star,
      label: "LONGEST STREAK",
      value: `${streak.longest}d`,
    },
  ];

  const slices = SEGMENTS.map((segment) => ({
    ...segment,
    value: { commits: stats.commits, prs: stats.prs, issues: stats.issues }[segment.key] ?? 0,
  })).filter((slice) => slice.value > 0);

  const total = slices.reduce((sum, slice) => sum + slice.value, 0);

  const body = `
    ${tiles
      .map((item, index) =>
        animate("rise", index * 90, tile({ ...item, theme, width, x: x(index), y: FIRST_ROW })),
      )
      .join("")}
    ${animate("fade", 260, labelWithIcon(ICONS.repo, "CONTRIBUTION MIX · ALL TIME", PADDING, BAR_Y - 14))}
    ${total > 0 ? animate("grow", 320, renderBar(slices, total)) : ""}
    ${total > 0 ? renderLegend(slices, total) : ""}
    <text class="row-dim" x="${CARD_WIDTH - PADDING}" y="${BAR_Y - 14}" text-anchor="end">${escapeXml(
      streak.currentRange
        ? `${formatDate(streak.currentRange[0])} – ${formatDate(streak.currentRange[1])}`
        : "streak not active",
    )}</text>`;

  return card(CARD_WIDTH, CARD_HEIGHT, theme, title, body);
}
