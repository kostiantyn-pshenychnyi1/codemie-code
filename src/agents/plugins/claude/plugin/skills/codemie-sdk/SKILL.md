---
name: codemie-sdk
description: >-
  Manage CodeMie platform assets (assistants, workflows, datasources, integrations, skills, users) directly from CLI
  using CodeMie SDK. Use when user says "create assistant", "list workflows", "update datasource",
  "delete assistant", "show my assistants", "get workflow details", "manage integrations",
  "create integration", "list integrations", "list llm models", "list embedding models",
  "list skills", "get skill", "who am i", "current user", "my profile", "user info",
  or any request to manage CodeMie platform resources.
---

# CodeMie SDK Asset Management

Manage CodeMie platform assets from the CLI.

**Asset Types:** `assistants`, `workflows`, `datasources`, `integrations`, `skills`, `users`

**Operations:** `list`, `get`, `create`, `update`, `delete`

---

## 🚨 Project Clarification (MANDATORY)

**Before doing any work**, check if the user has specified a project.

- All asset types use `project_name` except assistants which use `project`.
- If the project is **not specified** → **ask the user** before running any commands.
- If the project **is specified** → proceed directly.

Example prompt: *"Which CodeMie project should I use for this operation?"*

This applies to **all asset types**: assistants, workflows, datasources, and integrations.

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

**Important notes:**
- Use `context` (not `skill_ids`) to attach datasources. Get datasource IDs: `codemie sdk datasources list --json`
- Use `toolkits` to attach integrations. Get exact structure: `codemie sdk assistants get-tools --json`
- Use `base_name` from `codemie sdk llm list --json` when setting `llm_model_type`
- `skill_ids` holds built-in platform skills, not datasources

**Responses:** `✓ Specified assistant saved` / `✓ Specified assistant updated` / `✓ Assistant <id> deleted.`

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

**Important notes:**
- `--config` is required on create and optional on update
- `mode` and `shared` are required on create; both are optional on update
- Reference assistant IDs in YAML: `codemie sdk assistants list --json`

**Responses:** `✓ Workflow created successfully` / `✓ Workflow updated successfully` / `✓ Workflow <id> deleted.`

---

## Datasources

> See [examples/datasources.md](examples/datasources.md) for full field reference and examples.

Datasources use **type subcommands** for create/update: `confluence`, `jira`, `file`, `code`, `google`, `json`, `provider`, `summary`, `chunk-summary`, `azure-devops-wiki`, `azure-devops-work-item`, `xray`, `sharepoint`, `platform`

```bash
codemie sdk datasources list [--search <text>] [--projects <name>] [--status <status>] [--datasource-types <types>] [--sort-key date|update_date] [--sort-order asc|desc] [--page <n>] [--per-page <n>] [--json]
codemie sdk datasources get <id> [--json]
codemie sdk datasources create <type> --data '<json>' | --json <file>
codemie sdk datasources update <type> <id> --data '<json>' | --json <file>
codemie sdk datasources delete <id>
# file type only: --file ./doc.pdf (repeatable, max 10)
```

**Required on create (all types):** `name` (no spaces, use hyphens), `project_name`, plus type-specific required fields

**Important notes:**
- `confluence` and `jira` require a pre-configured integration. Get integration IDs: `codemie sdk integrations list --json`
- `code` type triggers background indexing — response is `✓ Indexing of datasource <name> has been started in the background`
- Update supports reindex control flags: `full_reindex`, `incremental_reindex`, `resume_indexing`, `skip_reindex`
- Status values: `completed`, `failed`, `fetching`, `in_progress`

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

**Required on create:** `credential_type`, `project_name`, `credential_values`

**Important notes:**
- `credential_values` **must include** `{"key":"alias","value":"<alias>"}` matching the top-level `alias` field
- `--setting-type` defaults to `user`; use `project` for team-shared integrations
- Sensitive values are masked as `**********` in all output

**Responses:** `✓ Specified credentials saved` / `✓ Specified credentials updated` / `✓ Integration <id> deleted.`

---

## LLM Models

```bash
codemie sdk llm list [--json]
codemie sdk llm list --embeddings [--json]
```

Returns `LLMModel` objects. Key fields: `base_name`, `label`, `provider`, `default`, `enabled`.

Use `base_name` when setting `llm_model_type` on an assistant or `embeddings_model`/`summarization_model` on a datasource.

---

## Skills

> See [examples/skills.md](examples/skills.md) for full field reference and examples.

```bash
codemie sdk skills list [--scope marketplace|project|project_with_marketplace] [--page <n>] [--per-page <n>] [--json]
codemie sdk skills get <id> [--json]
```

**Key fields:** `id`, `name`, `project`, `visibility`, `description`, `content`, `created_by`, `created_date`

**`--scope` values:** `marketplace`, `project`, `project_with_marketplace`

---

## Users

> See [examples/users.md](examples/users.md) for full field reference and examples.

```bash
codemie sdk users me [--json]
codemie sdk users data [--json]
```

**`users me`** — current user profile. Fields: `name`, `username`, `applications`, `picture`

**`users data`** — user preferences and metadata. Fields: `id`, `user_id`, `date`, `update_date`, `sidebar_view`, `stt_support`
