# Skills Examples

## List

```bash
# Default list (first 10)
codemie sdk skills list

# Paginate
codemie sdk skills list --page 2 --per-page 25

# Filter by scope
codemie sdk skills list --scope marketplace
codemie sdk skills list --scope project
codemie sdk skills list --scope project_with_marketplace

# JSON output
codemie sdk skills list --json
```

**`--scope` values:** `marketplace`, `project`, `project_with_marketplace` (default returns all accessible)

**List columns:** ID, Name, Project, Visibility

**JSON fields (list):** `id`, `name`, `project`, `visibility`

## Get

```bash
codemie sdk skills get 3d5b188f-185b-48df-b4b3-e608e4efb1ad
codemie sdk skills get 3d5b188f-185b-48df-b4b3-e608e4efb1ad --json
```

**Detail fields:** `id`, `name`, `project`, `visibility`, `description`, `created_by` (with `name`), `created_date`, `updated_date`, `content`

> Note: `content` contains the full skill markdown text (SKILL.md body).

## Scripting

```bash
# Find skill ID by name
codemie sdk skills list --json | jq -r '.[] | select(.name == "my-skill") | .id'

# List all public skills
codemie sdk skills list --scope marketplace --json | jq -r '.[] | "\(.id) \(.name)"'

# Get skill content
codemie sdk skills get <id> --json | jq -r '.content'
```
