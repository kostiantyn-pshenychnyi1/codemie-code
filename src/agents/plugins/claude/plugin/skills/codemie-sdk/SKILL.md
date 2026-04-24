---
name: codemie-sdk
description: >-
  Manage CodeMie platform assets (assistants, workflows, datasources, integrations, skills, users, categories, analytics) directly from CLI
  using CodeMie SDK. Use when user says "create assistant", "list workflows", "update datasource",
  "delete assistant", "show my assistants", "get workflow details", "manage integrations",
  "create integration", "list integrations", "list llm models", "list embedding models",
  "list skills", "get skill", "create skill", "update skill", "delete skill", "publish skill",
  "import skill", "export skill", "attach skill", "list categories", "get category",
  "create category", "delete category", "who am i", "current user", "my profile", "user info",
  "analytics", "usage analytics", "summaries", "cli analytics", "spending", "users activity",
  "projects activity", "assistants chats analytics", "workflows analytics", "tools usage",
  "mcp servers analytics", "llms usage", "users spending", "budget limits",
  or any request to manage CodeMie platform resources or view analytics.
---

# CodeMie SDK Asset Management

Manage CodeMie platform assets from the CLI.

**Asset Types:** `assistants`, `workflows`, `datasources`, `integrations`, `skills`, `users`, `categories`, `analytics`

**Operations:** `list`, `get`, `create`, `update`, `delete`

---

## 🚨 Project Clarification (MANDATORY)

**Before proceeding with any work, you must determine which project to use by following these steps:**

### Step 1 — Fetch the User Profile

```bash
codemie sdk users me --json
```

This command returns `user_id`, `username`, `email`, `is_admin`, `applications`, and `applications_admin`.

### Step 2 — Identify Available Projects

- If `is_admin = true`: the user can access **all** projects on the platform, not just those listed in `applications`.
- If `is_admin = false`: the user can only work with projects listed in `applications`.
- The **default project** is the one matching the user's email (e.g., for `alice@acme.com`, the default project is `alice@acme.com`).

### Step 3 — Confirm the Project Selection

- If the user **explicitly** states a project name, or uses phrases like **"use my project"** or **"in my project"**, proceed with the identified project (use the default project for phrases like "my project" or "my default project").
- In **all other cases**, ALWAYS ask the user which project to use.

Aks the user what project to use with the options as follows:

1. **Default project** — `<user-email>` *(personal default project)*
2. **Choose a different project** — let the user to manually type the project name.

**Example prompt:**
> *Which project should I use?*  
> *1. alice@acme.com (your default project)*  
> *2. Choose a different project*

---

**Note:**  
Only select a project automatically if the user has explicitly named it, or used clear phrases indicating the default (e.g., "my project", "my default project"). In all other situations, always ask for project clarification.

### Step 4 — Proceed

Once the project is known, use it in all subsequent commands:
- Assistants, skills, categories: `"project": "<name>"`
- Workflows, datasources, integrations: `"project_name": "<name>"`

---

## 📖 Consult Examples Before Working on an Asset (MANDATORY)

**Before creating, updating, or querying any asset**, read the corresponding example file for complete field references, schemas, and commands to fetch referenced assets.

| Asset | Example file |
|-------|-------------|
| Assistants | [examples/assistants.md](examples/assistants.md) |
| Workflows | [examples/workflows.md](examples/workflows.md) |
| Datasources | [examples/datasources.md](examples/datasources.md) |
| Integrations | [examples/integrations.md](examples/integrations.md) |
| Skills | [examples/skills.md](examples/skills.md) |
| Users | [examples/users.md](examples/users.md) |
| Categories | [examples/categories.md](examples/categories.md) |
| Analytics | [examples/analytics.md](examples/analytics.md) |

Do **not** guess field names or skip this step — all required/optional fields, nested schemas, and asset cross-reference commands are documented there.

---

## Input / Output

**Two ways to pass data:**
- Inline JSON: `--data '{"key":"value"}'`
- From file: `--json path/to/config.json`

**IDs are UUIDs**, e.g. `bc1a4b75-955c-48a5-b26d-bf702c1fee5d`

**Create does not return the new ID** in the output. After creating, use `list --search` to find the new asset's ID.

**Update replaces non-primitive values in full** — arrays and objects are not merged with existing values; the value you provide replaces the entire field. To preserve existing entries, either do not provide the value at all or fetch the current state first (`get <id> --json`), merge locally, then send the full updated value.

---

## Assistants

> See [examples/assistants.md](examples/assistants.md) for full field reference and examples.

```bash
codemie sdk assistants list [--scope visible_to_user|marketplace] [--search <text>] [--projects <name>] [--page <n>] [--per-page <n>] [--full-response] [--json]
codemie sdk assistants get <id> [--json]
codemie sdk assistants get-tools [--json]
codemie sdk assistants create --data '<json>' | --json <file>
codemie sdk assistants update <id> --data '<json>' | --json <file>
codemie sdk assistants delete <id>
```

**Required on create:** `name`, `project`, `system_prompt`

---

## Workflows

> See [examples/workflows.md](examples/workflows.md) for full field reference and examples.

```bash
codemie sdk workflows list [--search <text>] [--projects <name>] [--page <n>] [--per-page <n>] [--json]
codemie sdk workflows get <id> [--json]
codemie sdk workflows create --data '<json>' --config '<yaml>' | --config path/to/config.yaml
codemie sdk workflows update <id> --data '<json>' [--config '<yaml>' | --config path/to/config.yaml]
codemie sdk workflows delete <id>
```

**Required on create:** `name`, `project`, `mode` (`"Sequential"`), `shared` (boolean), plus `--config` with YAML graph definition

---

## Datasources

> See [examples/datasources.md](examples/datasources.md) for full field reference and examples.

Type subcommands for create/update: `confluence`, `jira`, `file`, `code`, `google`, `provider`, `azure-devops-wiki`, `azure-devops-work-item`, `xray`, `sharepoint`

```bash
codemie sdk datasources list [--search <text>] [--projects <name>] [--status <status>] [--datasource-types <types>] [--sort-key date|update_date] [--sort-order asc|desc] [--page <n>] [--per-page <n>] [--json]
codemie sdk datasources get <id> [--json]
codemie sdk datasources create <type> --data '<json>' | --json <file>
codemie sdk datasources update <type> <id> --data '<json>' | --json <file>
codemie sdk datasources delete <id>
# file type only: --file ./doc.pdf (repeatable, max 10)
```

**Required on create (all types):** `name` (no spaces, use hyphens), `project_name`, plus type-specific required fields

---

## Integrations

> See [examples/integrations.md](examples/integrations.md) for full field reference and examples.

```bash
codemie sdk integrations list [--setting-type user|project] [--search <text>] [--projects <name>] [--page <n>] [--per-page <n>] [--json]
codemie sdk integrations get <id> [--setting-type user|project] [--json]
codemie sdk integrations get-by-alias <alias> [--setting-type user|project] [--json]
codemie sdk integrations create --data '<json>' | --json <file>
codemie sdk integrations update <id> --data '<json>' | --json <file>
codemie sdk integrations delete <id> [--setting-type user|project]
```

**Required on create:** `credential_type`, `project_name`, `credential_values` (must include `{"key":"alias","value":"<alias>"}`)

---

## LLM Models

```bash
codemie sdk llm list [--json]
codemie sdk llm list --embeddings [--json]
```

Use `base_name` when setting `llm_model_type` on an assistant or `embeddings_model`/`summarization_model` on a datasource.

---

## Skills

> See [examples/skills.md](examples/skills.md) for full field reference and examples.

```bash
codemie sdk skills list [--scope marketplace|project|project_with_marketplace] [--page <n>] [--per-page <n>] [--json]
codemie sdk skills get <id> [--json]
codemie sdk skills create --data '<json>' | --json <file>
codemie sdk skills update <id> --data '<json>' | --json <file>
codemie sdk skills delete <id>
codemie sdk skills import <file.md> --project <name> [--visibility private|project|public] [--json]
codemie sdk skills export <id>
codemie sdk skills attach <assistant-id> <skill-id>
codemie sdk skills detach <assistant-id> <skill-id>
codemie sdk skills list-assistant-skills <assistant-id> [--json]
codemie sdk skills bulk-attach <skill-id> --assistant-ids <id1>,<id2>,...
codemie sdk skills get-assistants <skill-id> [--json]
codemie sdk skills publish <id> [--categories <cat1>,<cat2>]
codemie sdk skills unpublish <id>
codemie sdk skills list-categories [--json]
codemie sdk skills get-users [--json]
codemie sdk skills react <id> --reaction like|dislike
codemie sdk skills remove-reactions <id>
```

**Required on create:** `name` (kebab-case, 3–64 chars), `description` (10–1000 chars), `content` (markdown, min 100 chars), `project`

---

## Users

> See [examples/users.md](examples/users.md) for full field reference and examples.

```bash
codemie sdk users me [--json]
codemie sdk users data [--json]
```

---

## Categories

> See [examples/categories.md](examples/categories.md) for full field reference and examples.

**Note:** Categories can only be used for assistants (set via the `categories` field on create/update).

```bash
codemie sdk categories list [--paginated] [--page <n>] [--per-page <n>] [--json]
codemie sdk categories get <id> [--json]
codemie sdk categories create --data '<json>' | --json <file>
codemie sdk categories update <id> --data '<json>' | --json <file>
codemie sdk categories delete <id>
```

**Required on create:** `name` (1–255 chars)

---

## Analytics

> See [examples/analytics.md](examples/analytics.md) for full examples and scripting patterns.

Analytics endpoints generally require admin access. All commands support `--json` for raw output.

### Filter parameters

**`--time-period <value>`** — preset time window. Mutually exclusive with `--start-date`/`--end-date`. Exact accepted values:
`last_hour` | `last_6_hours` | `last_24_hours` | `last_7_days` | `last_30_days` | `last_60_days` | `last_year`

**`--start-date <datetime>`** / **`--end-date <datetime>`** — custom date range. Mutually exclusive with `--time-period`. Format: ISO 8601 UTC string `"YYYY-MM-DDTHH:MM:SSZ"`. Rules:
- `start_date` must be before `end_date`; `end_date` must not be in the future
- If neither time filter is provided, the backend defaults to **last 30 days**

**`--users <value>`** — comma-separated user IDs. Get valid IDs via `codemie sdk analytics users --json`. Non-admin users can only filter by themselves.

**`--projects <value>`** — comma-separated project names (not UUIDs). Projects the caller cannot access are silently ignored.

**`--page <n>`** / **`--per-page <n>`** — zero-indexed page (default `0`), items per page `1–1000` (default `20`). Tabular endpoints only.

### Commands

```bash
# Summaries (SummariesResponse: data.metrics[])
codemie sdk analytics summaries    [filters] [--json]
codemie sdk analytics cli-summary  [filters] [--json]

# Users list (UsersListResponse: data.users[], data.total_count)
codemie sdk analytics users        [filters] [--json]

# Tabular endpoints (TabularResponse: data.columns[], data.rows[], pagination)
codemie sdk analytics assistants-chats     [filters] [--page <n>] [--per-page <n>] [--json]
codemie sdk analytics workflows            [filters] [--page <n>] [--per-page <n>] [--json]
codemie sdk analytics tools-usage          [filters] [--page <n>] [--per-page <n>] [--json]
codemie sdk analytics webhooks-invocation  [filters] [--page <n>] [--per-page <n>] [--json]
codemie sdk analytics mcp-servers          [filters] [--page <n>] [--per-page <n>] [--json]
codemie sdk analytics mcp-servers-by-users [filters] [--page <n>] [--per-page <n>] [--json]
codemie sdk analytics projects-spending    [filters] [--page <n>] [--per-page <n>] [--json]
codemie sdk analytics llms-usage           [filters] [--page <n>] [--per-page <n>] [--json]
codemie sdk analytics users-spending       [filters] [--page <n>] [--per-page <n>] [--json]
codemie sdk analytics budget-soft-limit    [filters] [--page <n>] [--per-page <n>] [--json]
codemie sdk analytics budget-hard-limit    [filters] [--page <n>] [--per-page <n>] [--json]
codemie sdk analytics users-activity       [filters] [--page <n>] [--per-page <n>] [--json]
codemie sdk analytics projects-activity    [filters] [--page <n>] [--per-page <n>] [--json]
codemie sdk analytics agents-usage         [filters] [--page <n>] [--per-page <n>] [--json]
codemie sdk analytics cli-agents           [filters] [--page <n>] [--per-page <n>] [--json]
codemie sdk analytics cli-llms             [filters] [--page <n>] [--per-page <n>] [--json]
codemie sdk analytics cli-users            [filters] [--page <n>] [--per-page <n>] [--json]
codemie sdk analytics cli-errors           [filters] [--page <n>] [--per-page <n>] [--json]
codemie sdk analytics cli-repositories     [filters] [--page <n>] [--per-page <n>] [--json]
```
