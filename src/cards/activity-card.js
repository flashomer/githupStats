import {
  CARD_HEIGHT,
  ICONS,
  PADDING,
  WIDE_WIDTH,
  animate,
  card,
  formatCount,
  icon,
} from "../svg.js";

const CELL = 12;
const CELL_GAP = 3;
const GRID_TOP = 78;
const DAY_LABEL_WIDTH = 28;

// Five buckets, matching the way GitHub shades its own calendar.
function shade(count, peak) {
  if (count === 0) return 0.08;
  const ratio = count / peak;
  if (ratio > 0.6) return 1;
  if (ratio > 0.35) return 0.75;
  if (ratio > 0.15) return 0.5;
  return 0.28;
}

// How many weeks fit before the grid would run past the card edge.
export function weeksThatFit(width) {
  const available = width - PADDING * 2 - DAY_LABEL_WIDTH;
  return Math.floor((available + CELL_GAP) / (CELL + CELL_GAP));
}

// Grouped per week so the calendar can sweep in column by column.
function renderGrid(weeks, originX, theme) {
  const peak = Math.max(...weeks.flat(), 1);

  return weeks
    .map((week, weekIndex) =>
      animate(
        "fade",
        weekIndex * 14,
        week
          .map((count, dayIndex) => {
            const x = originX + weekIndex * (CELL + CELL_GAP);
            const y = GRID_TOP + dayIndex * (CELL + CELL_GAP);
            return `<rect x="${x.toFixed(1)}" y="${y}" width="${CELL}" height="${CELL}" rx="2" fill="#${
              theme.accent
            }" fill-opacity="${shade(count, peak)}"/>`;
          })
          .join(""),
      ),
    )
    .join("");
}

function renderDayLabels() {
  return ["Mon", "Wed", "Fri"]
    .map((label, index) => {
      const y = GRID_TOP + (index * 2 + 1) * (CELL + CELL_GAP) + 9;
      return `<text class="row-dim" x="${PADDING}" y="${y}">${label}</text>`;
    })
    .join("");
}

function renderLegend(width, theme) {
  const steps = [0.08, 0.28, 0.5, 0.75, 1];
  const x0 = width - PADDING - steps.length * (CELL + CELL_GAP) - 34;
  const y = CARD_HEIGHT - 34;

  const cells = steps
    .map(
      (opacity, index) =>
        `<rect x="${x0 + index * (CELL + CELL_GAP)}" y="${y}" width="${CELL}" height="${CELL}" rx="2" fill="#${theme.accent}" fill-opacity="${opacity}"/>`,
    )
    .join("");

  return `
    <text class="row-dim" x="${x0 - 8}" y="${y + 10}" text-anchor="end">Less</text>
    ${cells}
    <text class="row-dim" x="${x0 + steps.length * (CELL + CELL_GAP) + 4}" y="${y + 10}">More</text>`;
}

export function renderActivityCard(stats, theme, options = {}) {
  const { title = "Contribution Activity", width = WIDE_WIDTH } = options;

  // Narrow variants drop the oldest weeks rather than shrinking the cells,
  // which is what keeps the calendar readable on a phone.
  const limit = options.weeks ?? weeksThatFit(width);
  const weeks = stats.weeks.slice(-limit);

  const total =
    limit >= stats.weeks.length
      ? stats.totalContributions
      : weeks.flat().reduce((sum, count) => sum + count, 0);

  const caption =
    limit >= stats.weeks.length
      ? `${formatCount(total)} CONTRIBUTIONS IN THE LAST YEAR`
      : `${formatCount(total)} CONTRIBUTIONS · LAST ${weeks.length} WEEKS`;

  const body = `
    ${renderDayLabels()}
    ${renderGrid(weeks, PADDING + DAY_LABEL_WIDTH, theme)}
    ${icon(ICONS.flame, PADDING, CARD_HEIGHT - 33, 11)}
    <text class="caption" x="${PADDING + 16}" y="${CARD_HEIGHT - 24}">${caption}</text>
    ${renderLegend(width, theme)}`;

  return card(width, CARD_HEIGHT, theme, title, body);
}
