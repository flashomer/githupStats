const GRAPHQL_ENDPOINT = "https://api.github.com/graphql";
const REST_SEARCH_COMMITS = "https://api.github.com/search/commits";

// Without org and collaborator repos, work code never shows up.
const DEFAULT_AFFILIATIONS = ["OWNER", "ORGANIZATION_MEMBER", "COLLABORATOR"];

function requireToken() {
  const token = process.env.STATS_TOKEN || process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("No token found. Set STATS_TOKEN or GITHUB_TOKEN.");
  }
  return token;
}

async function graphql(query, variables) {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `bearer ${requireToken()}`,
      "Content-Type": "application/json",
      "User-Agent": "githup-stats",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(
      `GraphQL request failed: ${response.status} ${response.statusText}`,
    );
  }

  const payload = await response.json();
  if (payload.errors?.length) {
    throw new Error(
      `GraphQL error: ${payload.errors.map((e) => e.message).join("; ")}`,
    );
  }
  if (!payload.data?.user) {
    throw new Error(`No data returned for "${variables.login}".`);
  }
  return payload.data;
}

const STATS_QUERY = `
  query userStats($login: String!, $after: String) {
    user(login: $login) {
      name
      login
      followers { totalCount }
      contributionsCollection {
        totalCommitContributions
        totalPullRequestContributions
        totalIssueContributions
        totalPullRequestReviewContributions
        totalRepositoryContributions
        restrictedContributionsCount
        contributionCalendar {
          totalContributions
          weeks { contributionDays { date contributionCount } }
        }
      }
      repositoriesContributedTo(
        first: 1
        contributionTypes: [COMMIT, ISSUE, PULL_REQUEST, REPOSITORY]
      ) { totalCount }
      pullRequests(first: 1) { totalCount }
      openIssues: issues(states: OPEN) { totalCount }
      closedIssues: issues(states: CLOSED) { totalCount }
      repositories(
        first: 100
        after: $after
        ownerAffiliations: OWNER
        orderBy: { field: STARGAZERS, direction: DESC }
      ) {
        totalCount
        nodes {
          name
          isFork
          isPrivate
          pushedAt
          stargazerCount
          forkCount
          primaryLanguage { name color }
        }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
`;

const LANGS_QUERY = `
  query userLangs($login: String!, $after: String, $affiliations: [RepositoryAffiliation]) {
    user(login: $login) {
      repositories(
        first: 100
        after: $after
        ownerAffiliations: $affiliations
        isFork: false
        orderBy: { field: PUSHED_AT, direction: DESC }
      ) {
        nodes {
          name
          pushedAt
          languages(first: 12, orderBy: { field: SIZE, direction: DESC }) {
            edges { size node { name color } }
          }
        }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
`;

// GraphQL contributions only cover the trailing year, so lifetime commits
// have to come from the search API.
async function fetchAllTimeCommits(login) {
  const query = encodeURIComponent(`author:${login}`);
  const response = await fetch(`${REST_SEARCH_COMMITS}?q=${query}&per_page=1`, {
    headers: {
      Authorization: `bearer ${requireToken()}`,
      Accept: "application/vnd.github.cloak-preview+json",
      "User-Agent": "githup-stats",
    },
  });

  if (!response.ok) {
    console.warn(`Commit search unavailable (${response.status}), using the yearly count.`);
    return null;
  }

  const payload = await response.json();
  return typeof payload.total_count === "number" ? payload.total_count : null;
}

export async function fetchStats(login, options = {}) {
  const { includeAllCommits = true, countPrivate = true } = options;

  let stars = 0;
  let cursor = null;
  let user = null;
  const repos = [];

  do {
    const data = await graphql(STATS_QUERY, { login, after: cursor });
    user = data.user;
    for (const repo of user.repositories.nodes) {
      stars += repo.stargazerCount;
      repos.push(repo);
    }
    cursor = user.repositories.pageInfo.hasNextPage
      ? user.repositories.pageInfo.endCursor
      : null;
  } while (cursor);

  const contributions = user.contributionsCollection;
  let commits =
    contributions.totalCommitContributions +
    (countPrivate ? contributions.restrictedContributionsCount : 0);
  let allTimeCommits = false;

  if (includeAllCommits) {
    const total = await fetchAllTimeCommits(login);
    if (total !== null) {
      commits = total;
      allTimeCommits = true;
    }
  }

  const calendar = contributions.contributionCalendar;
  const days = calendar.weeks.flatMap((week) => week.contributionDays);

  return {
    name: user.name || user.login,
    login: user.login,
    stars,
    commits,
    prs: user.pullRequests.totalCount,
    issues: user.openIssues.totalCount + user.closedIssues.totalCount,
    reviews: contributions.totalPullRequestReviewContributions,
    contributedTo: user.repositoriesContributedTo.totalCount,
    followers: user.followers.totalCount,
    totalContributions: calendar.totalContributions,
    breakdown: {
      commits: contributions.totalCommitContributions,
      prs: contributions.totalPullRequestContributions,
      issues: contributions.totalIssueContributions,
      reviews: contributions.totalPullRequestReviewContributions,
    },
    weeks: calendar.weeks.map((week) =>
      week.contributionDays.map((day) => day.contributionCount),
    ),
    days,
    repos,
    allTimeCommits,
  };
}

export async function fetchTopLanguages(login, options = {}) {
  const affiliations = options.affiliations ?? DEFAULT_AFFILIATIONS;
  const excludeRepos = new Set(
    (options.excludeRepos ?? []).map((r) => r.toLowerCase()),
  );
  const excludeLangs = new Set(
    (options.excludeLangs ?? []).map((l) => l.toLowerCase()),
  );

  // `sinceDays` limits the count to repositories pushed to recently, which is
  // what makes a "last 12 months" card different from the all-time one.
  const cutoff = options.sinceDays
    ? Date.now() - options.sinceDays * 86_400_000
    : null;

  const totals = new Map();
  let cursor = null;

  do {
    const data = await graphql(LANGS_QUERY, { login, after: cursor, affiliations });
    const repositories = data.user.repositories;

    for (const repo of repositories.nodes) {
      if (excludeRepos.has(repo.name.toLowerCase())) {
        continue;
      }
      if (cutoff && (!repo.pushedAt || new Date(repo.pushedAt).getTime() < cutoff)) {
        continue;
      }
      for (const edge of repo.languages.edges) {
        const name = edge.node.name;
        if (excludeLangs.has(name.toLowerCase())) {
          continue;
        }
        const existing = totals.get(name);
        if (existing) {
          existing.size += edge.size;
        } else {
          totals.set(name, {
            name,
            color: edge.node.color || "#858585",
            size: edge.size,
          });
        }
      }
    }

    cursor = repositories.pageInfo.hasNextPage
      ? repositories.pageInfo.endCursor
      : null;
  } while (cursor);

  return [...totals.values()].sort((a, b) => b.size - a.size);
}
