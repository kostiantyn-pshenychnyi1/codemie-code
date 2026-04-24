# Analytics Examples

---

## Filter Parameters Reference

All analytics commands accept the same set of optional filter flags.

### Time range (mutually exclusive — use one or the other, never both)

**Option A — preset period:**

| Value | Covers |
|-------|--------|
| `last_hour` | Elapsed 60 minutes from now |
| `last_6_hours` | Elapsed 6 hours from now |
| `last_24_hours` | Elapsed 24 hours from now |
| `last_7_days` | Midnight UTC (now − 7 days) → now |
| `last_30_days` | Midnight UTC (now − 30 days) → now *(backend default)* |
| `last_60_days` | Midnight UTC (now − 60 days) → now |
| `last_year` | Midnight UTC (now − 365 days) → now |

```bash
--time-period last_30_days
```

**Option B — custom date range:**

- Format: ISO 8601 UTC datetime string — `"YYYY-MM-DDTHH:MM:SSZ"`
- `--start-date` must be before `--end-date`
- `--end-date` must not be in the future
- If only `--start-date` is given, end defaults to now
- If only `--end-date` is given, start defaults to `end − 30 days`

```bash
--start-date 2024-01-01T00:00:00Z --end-date 2024-12-31T23:59:59Z
```

### Entity filters

| Flag | Format | Example |
|------|--------|---------|
| `--users` | Comma-separated **user IDs** (from `codemie sdk analytics users --json` → `.data.users[].id`). Non-admin users can only filter by themselves. **Not emails.** | `--users abc123` or `--users abc123,def456` |
| `--projects` | Comma-separated project names (not UUIDs). Whitespace around each value is stripped. Projects you cannot access are silently ignored. | `--projects my-project` or `--projects my-project,other-project` |

> **Get valid user IDs before filtering:**
> ```bash
> codemie sdk analytics users --json | jq '.data.users[] | {id, name}'
> ```

### Pagination (tabular endpoints only)

| Flag | Default | Range | Notes |
|------|---------|-------|-------|
| `--page` | `0` | `≥ 0` | Zero-indexed |
| `--per-page` | `20` | `1–1000` | |

---

## Summaries

Returns aggregated metric cards (token counts, active users, request counts, etc.).

```bash
codemie sdk analytics summaries
codemie sdk analytics summaries --json
codemie sdk analytics summaries --time-period last_30_days
codemie sdk analytics summaries --start-date 2024-01-01T00:00:00Z --end-date 2024-12-31T23:59:59Z --json
codemie sdk analytics summaries --projects my-project --time-period last_7_days --json
```

**JSON fields:** `data.metrics[]` → `id`, `label`, `type`, `value`, `format`, `description`

---

## CLI Summary

Returns CLI-specific summary metrics (CLI sessions, agents used, tokens consumed via CLI).

```bash
codemie sdk analytics cli-summary
codemie sdk analytics cli-summary --time-period last_7_days --json
codemie sdk analytics cli-summary --users <user-id> --json
```

**JSON fields:** same as summaries — `data.metrics[]`

---

## Users List

Returns users for the last --time-period or --start-date and --end-date, visible to the caller. Non-admin users only see themselves. Use this to discover valid **user IDs** for the `--users` filter on other endpoints.

```bash
codemie sdk analytics users
codemie sdk analytics users --json
```

**JSON fields:** `data.users[]` → `id`, `name`; `data.total_count`

---

## Tabular Endpoints

All tabular endpoints return the same structure:

**JSON fields:** `data.columns[]` → `id`, `label`, `type`; `data.rows[]`; `data.totals`; `pagination` → `page`, `per_page`, `total_count`, `has_more`

### Assistants chats

```bash
codemie sdk analytics assistants-chats
codemie sdk analytics assistants-chats --page 0 --per-page 50 --json
codemie sdk analytics assistants-chats --projects my-project --time-period last_30_days --json
codemie sdk analytics assistants-chats --start-date 2024-06-01T00:00:00Z --end-date 2024-06-30T23:59:59Z --json
```

### Workflows

```bash
codemie sdk analytics workflows
codemie sdk analytics workflows --projects my-project --json
codemie sdk analytics workflows --time-period last_7_days --json
```

### Tools usage

```bash
codemie sdk analytics tools-usage
codemie sdk analytics tools-usage --time-period last_30_days --json
codemie sdk analytics tools-usage --projects my-project --users <user-id> --json
```

### Webhooks invocation

```bash
codemie sdk analytics webhooks-invocation
codemie sdk analytics webhooks-invocation --time-period last_7_days --json
```

### MCP servers

```bash
codemie sdk analytics mcp-servers
codemie sdk analytics mcp-servers --time-period last_30_days --json

codemie sdk analytics mcp-servers-by-users
codemie sdk analytics mcp-servers-by-users --users <user-id> --json
```

### Spending

```bash
# LLM spend by project
codemie sdk analytics projects-spending
codemie sdk analytics projects-spending --projects my-project --time-period last_30_days --json

# Token usage and cost by LLM model
codemie sdk analytics llms-usage
codemie sdk analytics llms-usage --time-period last_year --json

# Token spend per user
codemie sdk analytics users-spending
codemie sdk analytics users-spending --users alice@acme.com,bob@acme.com --json

# Users at or near soft budget limit
codemie sdk analytics budget-soft-limit
codemie sdk analytics budget-soft-limit --projects my-project --json

# Users at or over hard budget limit
codemie sdk analytics budget-hard-limit
codemie sdk analytics budget-hard-limit --json
```

### Activity

```bash
# Activity timeline per user (sessions, messages, active days)
codemie sdk analytics users-activity
codemie sdk analytics users-activity --users alice@acme.com --time-period last_30_days --json

# Activity timeline per project
codemie sdk analytics projects-activity
codemie sdk analytics projects-activity --projects my-project --time-period last_7_days --json
```

### Agents usage

```bash
# Usage by AI agent (Claude, Gemini, OpenCode, etc.) — all channels
codemie sdk analytics agents-usage
codemie sdk analytics agents-usage --time-period last_30_days --json

# CLI-only agent usage
codemie sdk analytics cli-agents
codemie sdk analytics cli-agents --users alice@acme.com --json
```

### CLI analytics

```bash
# LLM model usage via CLI
codemie sdk analytics cli-llms
codemie sdk analytics cli-llms --time-period last_7_days --json

# CLI usage broken down by user
codemie sdk analytics cli-users
codemie sdk analytics cli-users --projects my-project --json

# CLI error events
codemie sdk analytics cli-errors
codemie sdk analytics cli-errors --time-period last_24_hours --json

# CLI usage by git repository
codemie sdk analytics cli-repositories
codemie sdk analytics cli-repositories --projects my-project --json
```

---

## Scripting

```bash
# Get total assistant chat count
codemie sdk analytics assistants-chats --json | jq '.pagination.total_count'

# Get all metric IDs and values from summaries
codemie sdk analytics summaries --json | jq '.data.metrics[] | {id, value}'

# Get project spending rows for a specific project
codemie sdk analytics projects-spending --projects my-project --json | jq '.data.rows[]'

# Get user activity for last 7 days
codemie sdk analytics users-activity --time-period last_7_days --json | jq '.data.rows[]'

# Count CLI errors in last 24 hours
codemie sdk analytics cli-errors --time-period last_24_hours --json | jq '.pagination.total_count'

# Get column names for any tabular endpoint
codemie sdk analytics llms-usage --json | jq '[.data.columns[] | .label]'

# Discover valid user values for --users filter
codemie sdk analytics users --json | jq '.data.users[] | .id'
```
