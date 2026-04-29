---
name: codemie-analytics
description: >
  CodeMie Analytics expert — use this skill whenever the user asks about CodeMie usage data,
  AI adoption metrics, user leaderboards, CLI insights, spending, LiteLLM costs, token usage,
  or wants to build a dashboard/report from CodeMie or LiteLLM APIs.
  Also triggers for: "who uses CodeMie most", "show me AI analytics", "get spending data",
  "generate a report", "leaderboard", "cost analysis", "LiteLLM customer info",
  "enrich CSV with costs", "top performers", "AI champions", "tier distribution",
  or any custom analytics query against the platform.
  Always use this skill when CodeMie analytics, reporting, or cost data is involved.
---

# CodeMie Analytics Skill

You are an analytics expert for the CodeMie (EPAM AI/Run) platform. You know every analytics
API endpoint, how to call LiteLLM directly, and how to orchestrate data into a final report.

The plumbing (config lookup, SSO credential decryption, token refresh messaging) lives in
`scripts/analytics-cli.js`. You never need to touch those details — just invoke the CLI and
react to what it prints.

---

## Step 1 — Understand what the user wants

Identify the analytics scenario. The CLI supports these command families:

### Leaderboard (AI Champions)

The leaderboard ranks users across **6 scoring dimensions**:
- D1: Core Platform Usage (20%) — conversations, assistant interactions
- D2: Core Platform Creation (20%) — assistants, datasources created
- D3: Workflow Usage (10%) — workflow executions
- D4: Workflow Creation (10%) — workflows authored
- D5: CLI & Agentic Engineering (30%) — coding agent sessions, tokens, repos
- D6: Impact & Knowledge (10%) — marketplace publishing, knowledge sharing

**Tiers**: pioneer (80+), expert (65+), advanced (45+), practitioner (25+), newcomer (<25)

| Scenario | Command | Output |
|----------|---------|--------|
| Full leaderboard (paginated, filterable) | `leaderboard` | Ranked entries with score, tier, dimensions |
| Leaderboard KPI summary | `leaderboard-summary` | Total users, tier counts, top score |
| Single user champion profile | `leaderboard-user <id\|email>` | Full dimension breakdown for one user |
| Tier distribution | `leaderboard-tiers` | Tier name, user count, % |
| Average dimension scores | `leaderboard-dimensions` | D1–D6 averages across all users |
| Top N performers | `leaderboard-top [limit]` | Top users by total score (default 10) |
| Score histogram | `leaderboard-scores` | Score distribution in 10-point bins |
| Framework metadata | `leaderboard-framework` | Dimension descriptions, tier defs, scoring rules |
| Computation snapshots | `leaderboard-snapshots` | List of snapshot runs |
| Available seasons | `leaderboard-seasons --view monthly\|quarterly` | Seasonal periods for selectors |

Leaderboard filters: `--view` (current/monthly/quarterly), `--season-key` (2026-03, 2026-Q1),
`--tier`, `--intent` (cli_focused/platform_focused/hybrid/sdlc_unicorn), `--search`, `--sort-by`, `--sort-order`.

### CLI Insights

| Scenario | Command | Output |
|----------|---------|--------|
| Full CLI overview (agents, repos, tools, errors) | `cli-insights` | Multi-section JSON |
| User classification & top spenders | `cli-insights-users` | Classification + spend tables |
| Detailed single-user CLI profile | `cli-insights-user <name>` | Key metrics, tools, models, repos, categories |
| Project classification & top by cost | `cli-insights-projects` | Project-level breakdown |
| Usage patterns (weekday, hourly, session depth) | `cli-insights-patterns` | Temporal pattern data |

### General Analytics

| Scenario | Command | Output |
|----------|---------|--------|
| Overall usage summary (tokens, cost, users) | `summaries` | KPI totals |
| User list + activity trends | `users` | Users + time-series |
| Per-project spending | `projects-spending` | Table |
| LLM model breakdown | `llms-usage` | Table |
| Tool usage | `tools-usage` | Table |
| Workflow execution analytics | `workflows` | Table |
| Budget alerts (soft + hard limits) | `budget` | Warning tables |
| Personal spending & budget | `spending` | Current user's spend + budget usage |
| Per-user spending (platform + cli split) | `spending-by-users` | Breakdown tables |
| Weekly engagement histogram | `engagement` | 3h-interval heatmap data |

### LiteLLM & CSV Enrichment

| Scenario | Command | Output |
|----------|---------|--------|
| LiteLLM customer lookup | `litellm-customer [user_id]` | JSON |
| LiteLLM spend logs | `litellm-spend` | Spend entries |
| LiteLLM virtual keys | `litellm-keys` | Key info |
| Enrich CSV/Excel with LiteLLM costs | `enrich-csv <file>` | Enriched table |
| Any custom endpoint | `custom /v1/analytics/<path>` | Raw JSON |

---

## Security

**Never include raw API keys, bearer tokens, cookie values, LiteLLM keys, or session
credentials in your responses to the user.** If CLI output contains sensitive fields
(e.g. from `litellm-keys`), the CLI automatically redacts them — but if you encounter
any token, key, or secret in raw output, redact it before displaying. Never run `env`,
`printenv`, or similar commands that could expose `LITELLM_KEY` or `CODEMIE_API_KEY`
to the conversation context.

---

## Step 2 — Run the analytics CLI

The CLI script lives at `scripts/analytics-cli.js` next to this skill. It handles
authentication internally. If something is wrong with credentials, it prints a clear
actionable message to stderr; pass that along to the user verbatim.

```bash
node ${CLAUDE_PLUGIN_ROOT}/skills/codemie-analytics/scripts/analytics-cli.js <command> [options]
```

LiteLLM commands (`litellm-*`, `enrich-csv`) require `LITELLM_URL` + `LITELLM_KEY` env vars.

### Common filter flags

| Flag | Example | Notes |
|------|---------|-------|
| `--time-period` | `last_30_days` | Predefined period |
| `--start-date` | `2024-01-01T00:00:00` | Custom range start |
| `--end-date` | `2024-03-31T23:59:59` | Custom range end |
| `--users` | `john.doe,jane.smith` | Comma-separated usernames |
| `--projects` | `my-project` | Comma-separated project names |
| `--page` | `1` | Pagination |
| `--per-page` | `100` | Results per page (default 50) |
| `--output` | `json` | `json` \| `table` \| `csv` |
| `--pretty` | (flag) | Pretty-print JSON |

### Leaderboard-specific flags

| Flag | Example | Notes |
|------|---------|-------|
| `--view` | `monthly` | `current` \| `monthly` \| `quarterly` |
| `--season-key` | `2026-Q1` | Specific season to query |
| `--tier` | `pioneer` | Filter by tier |
| `--intent` | `cli_focused` | Filter by user intent profile |
| `--search` | `john` | Partial name/email search |
| `--sort-by` | `total_score` | `rank` \| `total_score` \| `user_name` \| `tier_level` |
| `--sort-order` | `desc` | `asc` \| `desc` |
| `--limit` | `20` | Max entries for `leaderboard-top` (max 50) |

### Example invocations

```bash
CLI=${CLAUDE_PLUGIN_ROOT}/skills/codemie-analytics/scripts/analytics-cli.js

# Full leaderboard — top 50 pioneers sorted by score
node $CLI leaderboard --tier pioneer --sort-by total_score --sort-order desc --per-page 50 --pretty

# Single user champion profile
node $CLI leaderboard-user john.doe@epam.com --pretty

# Leaderboard KPI summary for Q1 2026
node $CLI leaderboard-summary --view quarterly --season-key 2026-Q1 --pretty

# Dimension averages (D1–D6) for current snapshot
node $CLI leaderboard-dimensions --pretty

# Tier distribution
node $CLI leaderboard-tiers --pretty

# Top 10 performers
node $CLI leaderboard-top 10 --pretty

# 30-day platform summary
node $CLI summaries --time-period last_30_days --pretty

# Full CLI insights
node $CLI cli-insights --time-period last_30_days --pretty

# Detailed CLI profile for a specific user
node $CLI cli-insights-user John_Doe --time-period last_30_days --pretty

# Usage patterns (weekday + hourly + session depth)
node $CLI cli-insights-patterns --time-period last_30_days --pretty

# Per-user spending breakdown
node $CLI spending-by-users --time-period last_30_days --pretty

# Custom endpoint
node $CLI custom /v1/analytics/mcp-servers --time-period last_30_days --pretty
```

---

## Step 3 — Build the HTML report

Once you have the JSON data, delegate the presentation layer to the **`codemie-html-report`**
skill. That skill knows the CodeMie design system, Chart.js palette, and component library.
Do **not** hand-write HTML/CSS in this skill.

### Output location

**Always save reports to `reports/` in the user's current working directory.** Create the
folder if it doesn't exist. Use descriptive filenames:

```
reports/leaderboard-2026-Q1.html
reports/cli-insights-last-30-days.html
reports/spending-by-users-2026-04.html
```

### What to pass to the report skill

When invoking `codemie-html-report`, include:

1. **The raw JSON** collected from the CLI (one object per command/endpoint).
2. **The user's intent** — e.g. "leaderboard dashboard with tier distribution and dimension
   breakdown", "CLI insights with usage patterns".
3. **Timestamp context** — most endpoints return `metadata.data_as_of`; pass it through for
   the report subtitle.
4. **Output path** — tell the report skill where to save, e.g. `reports/leaderboard.html`.
5. **Pagination hints** if the data was truncated.

---

## Full API Reference

### Leaderboard endpoints (`GET /v1/analytics/leaderboard/...`)

Admin-only. All accept `snapshot_id`, `view`, `season_key` query params.

| Endpoint | Additional Params | Returns |
|----------|------------------|---------|
| `/leaderboard/summary` | — | Total users, tier counts, top score |
| `/leaderboard/entries` | `tier`, `search`, `intent`, `sort_by`, `sort_order`, `page`, `per_page` | Paginated ranked entries |
| `/leaderboard/user/{user_id}` | path: user ID or email | Full user profile with D1–D6 breakdown |
| `/leaderboard/tiers` | — | Tier name, count, percentage |
| `/leaderboard/scores` | — | Score histogram (10-point bins) |
| `/leaderboard/dimensions` | — | Average D1–D6 scores |
| `/leaderboard/top-performers` | `limit` (default 3, max 50) | Top N by total score |
| `/leaderboard/snapshots` | `view`, `status`, `is_final`, `page`, `per_page` | Computation snapshots |
| `/leaderboard/seasons` | `view` (required: monthly/quarterly), `page`, `per_page` | Available seasonal periods |
| `/leaderboard/framework` | — | Static metadata: dimensions, tiers, intents, scoring |
| `/leaderboard/compute` (POST) | `period_days`, `view`, `season_key` | Triggers manual computation |

### CLI Insights endpoints (`GET /v1/analytics/cli-insights-...`)

| Endpoint | Params | Returns |
|----------|--------|---------|
| `/cli-insights-weekday-pattern` | time filters | Weekday usage patterns |
| `/cli-insights-hourly-usage` | time filters | Hourly usage patterns |
| `/cli-insights-session-depth` | time filters | Session depth distribution |
| `/cli-insights-user-classification` | time filters | User classification breakdown |
| `/cli-insights-top-users-by-cost` | time filters | Top users ranked by cost |
| `/cli-insights-top-spenders` | time filters | Top spenders |
| `/cli-insights-users` | time filters | CLI user list |
| `/cli-insights-user-detail` | `user_name` (required), `user_id` | Full user detail |
| `/cli-insights-user-key-metrics` | `user_name` (required), `user_id` | User KPIs |
| `/cli-insights-user-tools` | `user_name` (required), `user_id` | User tool usage |
| `/cli-insights-user-models` | `user_name` (required), `user_id` | User model usage |
| `/cli-insights-user-workflow-intent` | `user_name` (required), `user_id` | User workflow intent |
| `/cli-insights-user-classification-detail` | `user_name` (required), `user_id` | User classification detail |
| `/cli-insights-user-category-breakdown` | `user_name` (required), `user_id` | User category breakdown |
| `/cli-insights-user-repositories` | `user_name` (required), `user_id` | User repositories |
| `/cli-insights-project-classification` | time filters | Project classification |
| `/cli-insights-top-projects-by-cost` | time filters | Top projects by cost |

### Standard CLI analytics (`GET /v1/analytics/cli-...`)

| Endpoint | Returns |
|----------|---------|
| `/cli-summary` | CLI totals (tokens, cost, sessions) |
| `/cli-agents` | Agent breakdown |
| `/cli-llms` | Model breakdown |
| `/cli-users` | CLI user activity |
| `/cli-errors` | Error logs |
| `/cli-repositories` | Repo activity |
| `/cli-top-performers` | Top by lines added |
| `/cli-top-versions` | CLI version distribution |
| `/cli-top-proxy-endpoints` | LiteLLM endpoint usage |
| `/cli-tools` | Tool usage |

### Dashboard analytics (`GET /v1/analytics/...`)

All accept time filters + `users` + `projects` + `page` + `per_page`.

| Endpoint | Returns |
|----------|---------|
| `/summaries` | Platform totals (tokens, cost, unique users) |
| `/users-spending` | Per-user cost + tokens |
| `/users-activity` | Activity time-series |
| `/users-unique-daily` | Unique users/day |
| `/users` | User list |
| `/projects-spending` | Per-project spending |
| `/projects-activity` | Project activity time-series |
| `/projects-unique-daily` | Unique projects/day |
| `/llms-usage` | LLM model usage |
| `/tools-usage` | Tool usage |
| `/workflows` | Workflow runs |
| `/agents-usage` | Agent executions |
| `/embeddings-usage` | Embedding model usage |
| `/assistants-chats` | Chat assistant conversations |
| `/webhooks-invocation` | Webhook usage |
| `/mcp-servers` | MCP server usage |
| `/mcp-servers-by-users` | MCP by user |
| `/power-users` | Power user analytics |
| `/knowledge-sharing` | Knowledge sharing metrics |
| `/top-agents-usage` | Top agents |
| `/top-workflow-usage` | Top workflows |
| `/published-to-marketplace` | Marketplace publishing |

### Spending & Budget endpoints

| Endpoint | Method | Returns |
|----------|--------|---------|
| `/spending` | GET | Current user: spend, budget_limit, hard_budget_limit, reset time |
| `/budget_usage` | GET | Per-key budget rows with % used |
| `/budget-soft-limit` | GET | Soft limit warnings |
| `/budget-hard-limit` | GET | Hard limit hits |
| `/spending/by-users/platform` | GET | Per-user platform spending |
| `/spending/by-users/cli` | GET | Per-user CLI spending |

### Engagement

| Endpoint | Method | Returns |
|----------|--------|---------|
| `/engagement/weekly-histogram` | GET | 3h intervals, last 7 days, by feature type |

### LiteLLM endpoints (via `LITELLM_URL` + `LITELLM_KEY`)

| Endpoint | Method | Params | Description |
|----------|--------|--------|-------------|
| `/customer/info` | GET | `user_id` | Customer spend + budget + allowed models |
| `/spend/logs` | GET | `start_date`, `end_date`, `user_id` | Spend log entries |
| `/key/info` | GET | `key` | Virtual key details + spend |
| `/model/info` | GET | — | Available models |
| `/health` | GET | — | Proxy health |

### Response envelope

Most CodeMie endpoints return:
```json
{
  "data": { ... },
  "metadata": {
    "timestamp": "2024-03-15T12:00:00Z",
    "data_as_of": "2024-03-15T12:00:00Z",
    "filters_applied": {},
    "execution_time_ms": 45.2
  }
}
```

Always extract `response.data` for the actual payload.

---

## Custom analytics requests

For endpoints not covered by preset commands:

```bash
node analytics-cli.js custom /v1/analytics/mcp-servers --time-period last_30_days

# POST endpoints
node analytics-cli.js custom /v1/analytics/ai-adoption-overview --method POST \
  --time-period last_30_days
```

---

## Offline CLI analytics (no API key needed)

The `codemie analytics` CLI command reads **local session files** from `~/.codemie/sessions/`
with no API calls:

```bash
codemie analytics --last 7d --output json
codemie analytics --agent claude --last 30d --export csv
```

---

## Report References

Reference files in `references/` describe canonical report layouts. **Always check the
relevant reference before building a new HTML report** — it defines the exact components,
charts, data structure, and modal design to use, ensuring consistency across users.

| Report type | Reference file | When to use |
|-------------|---------------|-------------|
| Leaderboard dashboard | [`references/leaderboard-dashboard-report.md`](references/leaderboard-dashboard-report.md) | Any request for leaderboard rankings, AI champions, top performers, tier distribution |
| People spending dashboard | [`references/people-spending-dashboard-report.md`](references/people-spending-dashboard-report.md) | Any request to track LiteLLM costs for a specific list of users (cohort, team, bootcamp, project) |

---

## Use Cases

### Use Case: People Spending Dashboard (cohort / team / bootcamp)

**Trigger phrases**: "build a spending dashboard for people from X", "track LiteLLM costs
for a list of users", "how much did this team spend", "bootcamp spending report",
"costs for people in this CSV/Excel".

**Also applies when**: the user asks to enrich analytics with EPAM employee data, map
platform users to EPAM people, or look up user assignments/org details.

**⚠️ EPAM People & Assignments Finder — required for this use case only**

Before proceeding, verify the assistant is accessible:

```bash
node ${CLAUDE_PLUGIN_ROOT}/skills/codemie-analytics/scripts/analytics-cli.js \
  custom /v1/assistants/5ca384d0-d042-480c-a0a9-d28150e2352f 2>&1 | head -5
```

If the command returns an auth error, HTTP 401/403/404, or "No CodeMie credentials" —
**stop. Do not run anything else.** Notify the user:

> ⛔ **EPAM People & Assignments Finder** assistant is not configured on your account.
>
> **Assistant:** EPAM People & Assignments Finder
> **ID:** `5ca384d0-d042-480c-a0a9-d28150e2352f`
>
> Add it with:
> ```bash
> codemie assistants add 5ca384d0-d042-480c-a0a9-d28150e2352f
> ```
> Or open in browser and click **Add to my assistants**:
> https://codemie.lab.epam.com/#/assistants/5ca384d0-d042-480c-a0a9-d28150e2352f
>
> Once added, resume this session with:
> ```bash
> claude -f
> ```

**Full workflow** (see `references/people-spending-dashboard-report.md` for all details):

1. **Parse the list** from Excel/CSV using `openpyxl`. Skip header and TOTAL rows.
2. **Fetch 3 LiteLLM accounts per user** using Python `asyncio` + `aiohttp` (semaphore 25,
   `ssl=False`). Account patterns:
   - Web: `email` (plain)
   - CLI: `email_codemie_cli`
   - Premium: `email_codemie_premium_models`
   Use `end_user_id` param (not `user_id`) on `GET /customer/info`.
3. **Save raw results** to `/tmp/` to avoid re-fetching on HTML rebuild.
4. **Build users array** — sum three spend values, extract budget fields per account.
5. **Fetch leaderboard** — paginate ALL pages (`--per-page 500`), ~25 pages for 12k users.
   Expect ~60% of a typical cohort to appear.
6. **Fetch CLI insights** — `cli-insights-users --per-page 500 topBySpend` for top CLI users.
   Expect ~3–5% coverage for a general cohort.
7. **Compute KPIs** — grand total, per-type totals, active user count, avg spend.
   Budget projection: `avg_spend_per_active × total_users × 1.20`.
8. **Generate HTML** — use `str.replace()` with `__TOKEN__` markers (never f-strings, which
   conflict with JS `${...}` template literals).
9. **Wire table clicks** — use `data-email` attribute + event delegation (never `onclick=""`
   attributes, which break under Python quote escaping).
10. **Save** to `reports/<descriptive>.html`.

**Key commands:**
```bash
CLI=${CLAUDE_PLUGIN_ROOT}/skills/codemie-analytics/scripts/analytics-cli.js

# Leaderboard (run in a loop for all pages)
node $CLI leaderboard --per-page 500 --page <N> --output json

# CLI top spenders
node $CLI cli-insights-users --time-period last_30_days --per-page 500 --output json
```

**LiteLLM fetch** requires Python (not the analytics CLI) because it needs
`LITELLM_URL` + `LITELLM_KEY` env vars and concurrent calls for 1,000+ accounts.

---

## Tips

- **Always run the CLI first**, capture JSON, then hand it to the report skill — don't
  hardcode example data.
- If a command returns paginated data, loop through all pages or set `--per-page 500`.
- For time-series charts, use `/users-unique-daily` or `/projects-unique-daily` endpoints.
- Budget warnings: flag rows where `spend / max_budget > 0.8` (warn) and `> 1.0` (error).
- For the **leaderboard dashboard**, combine `leaderboard` + `leaderboard-summary` +
  `leaderboard-tiers` + `leaderboard-dimensions` to build a comprehensive view. Then follow
  `references/leaderboard-dashboard-report.md` for the exact HTML structure.
- For a **people spending dashboard**, fetch LiteLLM directly with Python async (3 accounts
  per user), then enrich with leaderboard + CLI insights. Follow
  `references/people-spending-dashboard-report.md` for the exact HTML structure.
- For a **single user deep-dive**, combine `leaderboard-user <email>` with
  `cli-insights-user <name>` for the full picture (champion score + CLI activity).
- If the CLI prints an auth error, forward its message verbatim — it already tells the user
  what to do next.
- Always save HTML reports to `reports/` in the user's working directory.