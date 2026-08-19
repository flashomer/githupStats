import { calculateRank } from "../rank.js";
import {
  CARD_HEIGHT,
  CARD_WIDTH,
  ICONS,
  TILE_GAP,
  TILE_HEIGHT,
  animate,
  card,
  formatCount,
  rankRing,
  tile,
  tileColumns,
} from "../svg.js";

const COLUMNS = 3;
const FIRST_ROW = 74;

export function renderStatsCard(stats, theme, options = {}) {
  const { title = null, showRank = true } = options;
  const { width, x } = tileColumns(CARD_WIDTH, COLUMNS);

  const tiles = [
    { icon: ICONS.commit, label: "COMMITS", value: formatCount(stats.commits) },
    { icon: ICONS.pr, label: "PULL REQUESTS", value: formatCount(stats.prs) },
    { icon: ICONS.issue, label: "ISSUES", value: formatCount(stats.issues) },
    { icon: ICONS.star, label: "STARS", value: formatCount(stats.stars) },
    { icon: ICONS.repo, label: "REPOSITORIES", value: formatCount(stats.contributedTo) },
    { icon: ICONS.people, label: "FOLLOWERS", value: formatCount(stats.followers) },
  ];

  const body = tiles
    .map((item, index) =>
      animate(
        "rise",
        index * 70,
        tile({
          ...item,
          theme,
          width,
          x: x(index % COLUMNS),
          y: FIRST_ROW + Math.floor(index / COLUMNS) * (TILE_HEIGHT + TILE_GAP),
        }),
      ),
    )
    .join("");

  return card(
    CARD_WIDTH,
    CARD_HEIGHT,
    theme,
    title ?? stats.login,
    body,
    showRank ? rankRing(calculateRank(stats), CARD_WIDTH, theme) : "",
  );
}
