// Medians roughly mark the 50th percentile for each signal.
const MEDIANS = {
  commits: 250,
  prs: 50,
  issues: 25,
  reviews: 2,
  stars: 50,
  followers: 10,
};

const WEIGHTS = {
  commits: 2,
  prs: 3,
  issues: 1,
  reviews: 1,
  stars: 4,
  followers: 1,
};

const TOTAL_WEIGHT = Object.values(WEIGHTS).reduce((a, b) => a + b, 0);

const LEVELS = ["S", "A+", "A", "A-", "B+", "B", "B-", "C+", "C"];
const THRESHOLDS = [1, 12.5, 25, 37.5, 50, 62.5, 75, 87.5, 100];

const exponentialCdf = (x) => 1 - 2 ** -x;
const logNormalCdf = (x) => x / (1 + x);

// Stars and followers are long-tailed, so they get the log-normal curve.
export function calculateRank(stats) {
  const score =
    WEIGHTS.commits * exponentialCdf(stats.commits / MEDIANS.commits) +
    WEIGHTS.prs * exponentialCdf(stats.prs / MEDIANS.prs) +
    WEIGHTS.issues * exponentialCdf(stats.issues / MEDIANS.issues) +
    WEIGHTS.reviews * exponentialCdf(stats.reviews / MEDIANS.reviews) +
    WEIGHTS.stars * logNormalCdf(stats.stars / MEDIANS.stars) +
    WEIGHTS.followers * logNormalCdf(stats.followers / MEDIANS.followers);

  // 0 is the best percentile, 100 the worst.
  const percentile = 100 * (1 - score / TOTAL_WEIGHT);
  const level = LEVELS[THRESHOLDS.findIndex((t) => percentile <= t)] ?? "C";

  return { level, percentile };
}
