# Hunt Techniques

Concrete detection methods per category. Tools vary by stack — adapt commands,
keep the method.

## Dead code

- **Unused exports/symbols**: grep each export's name across the repo; one hit
  (its own definition) means dead. `ts-prune`, `vulture`, `deadcode`,
  `knip` accelerate this but verify their output — they false-positive on
  entry points.
- **Unused imports/variables**: lint with unused rules on (`eslint
  no-unused-vars`, `ruff F401`, compiler warnings).
- **Unused dependencies**: compare declared deps against actual imports
  (`depcheck`, `pipreqs`, `go mod tidy` dry-run). Check config files and
  scripts too — deps can be used outside source code.
- **Unreferenced routes/APIs**: diff the route table against routes any client
  or test actually calls. Grep for URL paths in frontend code and docs.

## Duplicate logic

- Extract suspiciously similar functions and diff them after normalizing
  whitespace and names. Tools: `jscpd`, `simian`, `clang-tidy` duplicate
  detection.
- Watch for **semantic duplicates** — same behavior, different spelling
  (two date formatters, two fetch wrappers). These hide from textual diff;
  find them by feature area, not by string match.

## Unused UI components

- Build the component tree from the root pages/layouts; anything not
  reachable from a route is orphaned. Grep the component name for render
  sites, not just imports (barrel files make every import look used).

## Complexity

- Flag implementations whose length is out of proportion to their job, deep
  nesting, or abstractions with a single implementation and a single caller —
  a layer that only forwards calls.
- Candidates for simplification read as: "this does X in N steps where the
  domain needs 2."

## Legacy and abandoned code

- `git log --follow` on suspects: no commits touching them in a long window
  while their feature area moved on is a strong abandonment signal.
- Feature-flagged code behind flags permanently on/off; versioned copies
  (`_old`, `_v2`, `.bak`, `-deprecated`); commented-out blocks. Grep these
  names.
- Files disconnected from the app: pages/components never imported, scripts
  referencing modules that no longer exist, configs for services the app
  stopped using.

## Redundant queries and API calls

- Loops issuing queries per item (N+1) — look for awaits inside iteration.
- Repeat calls for data already fetched in scope or cacheable; identical
  requests fired from multiple components mounting at once.
- Unused query results: selecting whole rows to read one column.
