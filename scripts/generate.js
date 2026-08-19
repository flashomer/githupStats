#!/usr/bin/env node
// Exits non-zero on failure so the workflow keeps the last good cards.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { fetchStats, fetchTopLanguages } from "../src/api.js";
import { renderActivityCard } from "../src/cards/activity-card.js";
import { renderContributionsCard } from "../src/cards/contributions-card.js";
import { renderLangsCard } from "../src/cards/langs-card.js";
import { renderStatsCard } from "../src/cards/stats-card.js";
import { setAnimated } from "../src/svg.js";
import { resolveTheme } from "../src/themes.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

async function loadConfig() {
  const path = join(ROOT, "config", "stats.config.json");
  const config = JSON.parse(await readFile(path, "utf8"));

  const username = process.env.STATS_USERNAME || config.username;
  if (!username) {
    throw new Error("No username set in config/stats.config.json or STATS_USERNAME.");
  }

  return { ...config, username };
}

async function writeOutput(path, contents) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, contents, "utf8");
  console.log(`wrote ${path}`);
}

const enabled = (section) => section?.enabled !== false;

async function main() {
  const config = await loadConfig();
  const outputDir = join(ROOT, config.outputDir ?? "generated");
  setAnimated(config.animations);

  // One SVG per theme, so the README can switch with prefers-color-scheme.
  const variants = Object.entries(config.themes ?? { light: "light", dark: "dark" });

  const needsStats =
    enabled(config.stats) ||
    enabled(config.contributions) ||
    enabled(config.activity);

  const stats = needsStats
    ? await fetchStats(config.username, {
        includeAllCommits: config.stats?.includeAllCommits ?? true,
        countPrivate: config.stats?.countPrivate ?? true,
      })
    : null;

  const langOptions = {
    affiliations: config.topLangs?.affiliations,
    excludeRepos: config.topLangs?.excludeRepos ?? [],
    excludeLangs: config.topLangs?.excludeLangs ?? [],
  };

  const allTimeLangs = enabled(config.topLangs)
    ? await fetchTopLanguages(config.username, langOptions)
    : null;

  const recentLangs = enabled(config.recentLangs)
    ? await fetchTopLanguages(config.username, {
        ...langOptions,
        sinceDays: config.recentLangs?.sinceDays ?? 365,
      })
    : null;

  if (allTimeLangs && allTimeLangs.length === 0) {
    throw new Error("No language data returned, not writing an empty card.");
  }

  for (const [variant, themeName] of variants) {
    const theme = resolveTheme(themeName);
    const dir = join(outputDir, variant);

    if (enabled(config.stats)) {
      await writeOutput(
        join(dir, "stats.svg"),
        renderStatsCard(stats, theme, {
          title: config.stats?.title ?? null,
          showRank: config.stats?.showRank ?? true,
        }),
      );
    }

    if (allTimeLangs) {
      await writeOutput(
        join(dir, "top-langs.svg"),
        renderLangsCard(allTimeLangs, theme, {
          title: config.topLangs?.title ?? "Languages",
          count: config.topLangs?.count ?? 8,
        }),
      );
    }

    if (recentLangs) {
      if (recentLangs.length === 0) {
        console.warn("No repositories pushed in the window, skipping recent-langs card.");
      } else {
        await writeOutput(
          join(dir, "recent-langs.svg"),
          renderLangsCard(recentLangs, theme, {
            title: config.recentLangs?.title ?? "Languages in Use",
            count: config.recentLangs?.count ?? 8,
            subtitle: config.recentLangs?.subtitle ?? "12 MONTHS",
          }),
        );
      }
    }

    if (enabled(config.contributions)) {
      await writeOutput(
        join(dir, "contributions.svg"),
        renderContributionsCard(stats, theme, { title: config.contributions?.title }),
      );
    }

    if (enabled(config.activity)) {
      await writeOutput(
        join(dir, "activity.svg"),
        renderActivityCard(stats, theme, { title: config.activity?.title }),
      );
    }
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
