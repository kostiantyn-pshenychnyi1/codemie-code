# Integrations Examples

## List

```bash
# User-level integrations (default)
codemie sdk integrations list

# Project-level integrations
codemie sdk integrations list --setting-type project

# Search and filter
codemie sdk integrations list --search 'jira'
codemie sdk integrations list --projects Engineering
codemie sdk integrations list --page 0 --per-page 25 --json
```

**setting-type:** `user` (default) or `project`

**List columns:** ID, Alias, Type, Project

## Get

```bash
# By ID
codemie sdk integrations get 6fcbb938-239c-40c4-b304-b1f3cec3d501
codemie sdk integrations get 6fcbb938-239c-40c4-b304-b1f3cec3d501 --setting-type project --json

# By alias (more convenient)
codemie sdk integrations get-by-alias jira-main
codemie sdk integrations get-by-alias jira-main --json
```

**JSON fields:** `id`, `alias`, `credential_type`, `project_name`, `setting_type`, `default`, `is_global`, `credential_values`, `date`, `update_date`, `user_id`, `created_by`

> Note: Sensitive credential values are masked as `**********` in output.

## Create

```bash
# Inline JSON
codemie sdk integrations create --data '{
  "credential_type": "Jira",
  "project_name": "Engineering",
  "alias": "jira-main",
  "setting_type": "user",
  "credential_values": [
    {"key": "url", "value": "https://company.atlassian.net"},
    {"key": "token", "value": "your-api-token"},
    {"key": "username", "value": "bot@company.com"},
    {"key": "alias", "value": "jira-main"}
  ]
}'

# From file
codemie sdk integrations create --json jira-integration.json
```

**Field reference:**

| Field | Required | Description |
|-------|----------|-------------|
| `credential_type` | ✅ | Integration type — e.g. `"Jira"`, `"Confluence"`, `"Git"`, `"LiteLLM"` |
| `project_name` | ✅ | Project to associate the integration with |
| `credential_values` | ✅ | Array of `{"key": "...", "value": "..."}` credential pairs — **must include `alias` key** |
| `setting_type` | — | `"user"` (default, personal) or `"project"` (team-shared) |
| `alias` | — | Human-readable identifier used with `get-by-alias` |
| `default` | — | `true` = mark as the default integration of this type for the project |
| `enabled` | — | `false` = disable the integration without deleting it (default: `true`) |
| `external_id` | — | External system identifier for cross-referencing with other tools |

**Common `credential_type` values:** `Jira`, `Confluence`, `Git`, `AWS`, `GCP`, `Azure`, `Keycloak`, `Elastic`, `OpenAPI`, `Webhook`, `SQL`, `MCP`, `LiteLLM`, `AzureDevOps`, `ServiceNow`, `Telegram`

> **Important:** `credential_values` **must include an `alias` key** with the same value as the top-level `alias` field, otherwise the API returns an error. Always add `{"key": "alias", "value": "<alias>"}` to the array.

### Type examples

**Confluence:**
```json
{
  "credential_type": "Confluence",
  "project_name": "Documentation",
  "alias": "confluence-main",
  "setting_type": "user",
  "credential_values": [
    {"key": "url", "value": "https://company.atlassian.net/wiki"},
    {"key": "token", "value": "api-token"},
    {"key": "username", "value": "admin@company.com"},
    {"key": "alias", "value": "confluence-main"}
  ]
}
```

**Git:**
```json
{
  "credential_type": "Git",
  "project_name": "Engineering",
  "alias": "github-main",
  "setting_type": "project",
  "credential_values": [
    {"key": "url", "value": "https://github.com/org/repo"},
    {"key": "token", "value": "ghp_yourToken"},
    {"key": "alias", "value": "github-main"}
  ]
}
```

**LiteLLM:**
```json
{
  "credential_type": "LiteLLM",
  "project_name": "AI",
  "alias": "litellm-proxy",
  "setting_type": "user",
  "credential_values": [
    {"key": "base_url", "value": "http://localhost:4000"},
    {"key": "api_key", "value": "sk-master-key"}
  ]
}
```

Output: `✓ Specified credentials saved`

## Update

```bash
codemie sdk integrations update <id> --data '{
  "credential_type": "Jira",
  "project_name": "Engineering",
  "alias": "jira-main",
  "credential_values": [
    {"key": "url", "value": "https://company.atlassian.net"},
    {"key": "token", "value": "new-rotated-token"},
    {"key": "username", "value": "bot@company.com"}
  ]
}'
```

Output: `✓ Specified credentials updated`

## Delete

```bash
codemie sdk integrations delete <id>
codemie sdk integrations delete <id> --setting-type project
```

Output: `✓ Integration <id> deleted.`
