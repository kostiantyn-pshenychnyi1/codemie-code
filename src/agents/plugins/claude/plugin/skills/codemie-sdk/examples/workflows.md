# Workflows Examples

## List

```bash
# Basic list
codemie sdk workflows list

# Search and filter
codemie sdk workflows list --search 'Pipeline'
codemie sdk workflows list --projects Engineering
codemie sdk workflows list --page 0 --per-page 25 --json
```

**List columns:** ID, Name, Project, Mode, Shared

## Get

```bash
codemie sdk workflows get 1d3d69bb-3a53-495b-b0e7-61826d10a947
codemie sdk workflows get 1d3d69bb-3a53-495b-b0e7-61826d10a947 --json
```

**JSON fields:** `id`, `project`, `name`, `description`, `yaml_config`, `mode`, `shared`, `created_by`, `created_date`, `update_date`

## Create

Workflows require both a `--data` JSON payload (metadata) and a `--config` YAML (graph definition).

```bash
# Minimal required fields
codemie sdk workflows create \
  --data '{"name":"My Workflow","project":"Engineering","mode":"Sequential","shared":true}' \
  --config path/to/workflow.yaml

# All metadata inline
codemie sdk workflows create \
  --data '{"name":"My Workflow","project":"Engineering","mode":"Sequential","shared":true,"description":"Automates deployment","icon_url":"https://example.com/icon.png"}' \
  --config path/to/workflow.yaml

# From JSON file + YAML config
codemie sdk workflows create --json workflow-meta.json --config path/to/workflow.yaml
```

**Field reference:**

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `name` | ✅ | string | Display name of the workflow |
| `project` | ✅ | string | Project the workflow belongs to |
| `yaml_config` | ✅ (via `--config`) | string | Workflow graph definition — pass as `--config` file path or inline YAML string |
| `mode` | ✅ | string | Execution mode: `"Sequential"` (step-by-step) |
| `shared` | ✅ | boolean | `true` = visible to all project members; `false` = private |
| `description` | — | string | Short description of the workflow's purpose |
| `icon_url` | — | string | URL to an image used as the workflow's icon |

> **`mode` values:**
> - `"Sequential"` — nodes execute in a defined order; each step waits for the previous

**`workflow-meta.json` example:**
```json
{
  "name": "Data Pipeline",
  "project": "Analytics",
  "description": "Processes incoming data streams",
  "mode": "Sequential",
  "shared": true
}
```

**`workflow.yaml` example:**
```yaml
assistants:
  - id: processor
    assistant_id: <assistant-id>
    system_prompt: You are a data processing assistant
states:
  - id: start
    assistant_id: processor
    next:
      state_id: end
```

Get assistant IDs to reference in YAML:
```bash
codemie sdk assistants list --projects Engineering --json | jq -r '.[] | "\(.id) \(.name)"'
```

## Update

```bash
# Update metadata only (no reconfig of graph)
codemie sdk workflows update <id> --data '{"name":"Updated Pipeline","project":"Engineering","shared":false}'

# Update metadata and graph definition
codemie sdk workflows update <id> --json updates.json --config path/to/new-config.yaml
```

**Update field reference:**

| Field | Required | Description |
|-------|----------|-------------|
| `name` | ✅ | Workflow display name |
| `project` | ✅ | Project the workflow belongs to |
| `yaml_config` | optional | New graph definition — only if changing the workflow structure |
| `mode` | optional | Change execution mode: `"Sequential"` |
| `shared` | optional | Change visibility |
| `description` | optional | Update description |
| `icon_url` | optional | Update icon URL |

## Delete

```bash
codemie sdk workflows get <id>
codemie sdk workflows delete <id>
```

## Scripting

```bash
# Export workflow config
codemie sdk workflows get <id> --json > workflow-backup.json

# List workflows by project, get IDs
codemie sdk workflows list --projects DataPipeline --json | jq -r '.[].id'
```
