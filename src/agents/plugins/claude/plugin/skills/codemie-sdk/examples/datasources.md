# Datasources Examples

> **Important:** `create` and `update` require a **type subcommand**: `confluence`, `jira`, `file`, `code`, `google`
>
> **Name constraint:** must match `^[a-zA-Z0-9][\w-]*$` — no spaces, use hyphens (e.g. `my-wiki`, not `My Wiki`)

## List

```bash
# Basic list
codemie sdk datasources list

# Filter
codemie sdk datasources list --search 'Wiki' --projects Documentation
codemie sdk datasources list --status completed
codemie sdk datasources list --datasource-types confluence,jira
codemie sdk datasources list --sort-key update_date --sort-order desc --json
```

**Status values:** `completed`, `failed`, `fetching`, `in_progress`

**List columns:** ID, Name, Project, Type, Status

## Get

```bash
codemie sdk datasources get ebfe842a-07af-4a8e-8790-7213834068e9
codemie sdk datasources get ebfe842a-07af-4a8e-8790-7213834068e9 --json
```

## Create

**Base fields (all types):**

| Field | Required | Description |
|-------|----------|-------------|
| `name` | ✅ | Must match `^[a-zA-Z0-9][\w-]*$` — no spaces, use hyphens |
| `project_name` | ✅ | Project to create the datasource in |
| `description` | — | Human-readable description of this datasource |
| `shared_with_project` | — | `true` = visible to all project members |
| `setting_id` | — | Integration ID to authenticate fetching — get IDs: `codemie sdk integrations list --json` |

### Confluence

> Requires a **Confluence integration** already configured in the project.
> Get the integration ID: `codemie sdk integrations list --setting-type project --json | jq -r '.[] | select(.credential_type=="Confluence") | "\(.id) \(.alias)"'`

```bash
codemie sdk datasources create confluence --data '{
  "name": "company-wiki",
  "project_name": "Documentation",
  "cql": "space=TEAM AND type=page",
  "description": "Company-wide wiki",
  "shared_with_project": true
}'
```

**Confluence-specific fields:**

| Field | Required | Description |
|-------|----------|-------------|
| `cql` | ✅ | Confluence Query Language — e.g. `space=TEAM`, `space=TEAM AND type=page` |
| `include_restricted_content` | — | Include pages that are restricted but accessible by the integration user |
| `include_archived_content` | — | Include archived/historic pages |
| `include_attachments` | — | Include file attachments from pages |
| `include_comments` | — | Include page comments in indexed content |
| `keep_markdown_format` | — | Preserve Markdown formatting in fetched content |
| `keep_newlines` | — | Preserve newlines (prevents content collapsing) |
| `max_pages` | — | Maximum number of pages to fetch (caps the index size) |
| `pages_per_request` | — | Batch size per API call — tune lower to avoid Confluence rate limits |

**Full Confluence example:**
```json
{
  "name": "engineering-wiki",
  "project_name": "Engineering",
  "cql": "space=ENG AND type=page AND ancestor=12345",
  "description": "Engineering team wiki pages",
  "shared_with_project": true,
  "include_attachments": false,
  "include_comments": false,
  "keep_markdown_format": true,
  "max_pages": 500,
  "pages_per_request": 25
}
```

### Jira

> Requires a **Jira integration** already configured in the project.
> Get the integration ID: `codemie sdk integrations list --setting-type project --json | jq -r '.[] | select(.credential_type=="Jira") | "\(.id) \(.alias)"'`

```bash
codemie sdk datasources create jira --data '{
  "name": "support-tickets",
  "project_name": "Support",
  "jql": "project=SUP AND status != Done",
  "description": "Open support tickets",
  "shared_with_project": true
}'
```

**Jira-specific fields:**

| Field | Required | Description |
|-------|----------|-------------|
| `jql` | ✅ | Jira Query Language — e.g. `project=SUP AND status=Open ORDER BY created DESC` |

### File (local files)

```bash
# One or more files (max 10), plus metadata
codemie sdk datasources create file --file ./doc1.pdf --file ./doc2.docx --data '{"name":"team-docs","project_name":"Engineering"}'

# From metadata file
codemie sdk datasources create file --file ./report.pdf --json metadata.json
```

**`metadata.json`:**
```json
{
  "name": "project-docs",
  "project_name": "Engineering",
  "description": "Key project documents",
  "shared_with_project": true
}
```

Supported file formats: PDF, DOCX, XLSX, TXT, MD, and other common document types. Max 10 files per create call.

### Code Repository

```bash
codemie sdk datasources create code --data '{
  "name": "main-repo",
  "project_name": "Engineering",
  "link": "https://github.com/org/repo",
  "branch": "main",
  "index_type": "code",
  "description": "Main application codebase"
}'
```

Output: `✓ Indexing of datasource main-repo has been started in the background`

**Code-specific fields:**

| Field | Required | Description |
|-------|----------|-------------|
| `link` | ✅ | Repository HTTPS URL — e.g. `https://github.com/org/repo` |
| `branch` | ✅ | Branch to index — e.g. `main`, `develop` |
| `index_type` | ✅ | `"code"` = searchable code snippets; `"summary"` = LLM-generated summaries |
| `files_filter` | — | Glob pattern to limit indexed files — e.g. `src/**/*.ts`, `**/*.py` |
| `embeddings_model` | — | Embedding model `base_name` — get values: `codemie sdk llm list --embeddings --json` |
| `summarization_model` | — | LLM model `base_name` for summary generation — get values: `codemie sdk llm list --json` |
| `prompt` | — | Custom prompt template for summarization (overrides platform default) |
| `docs_generation` | — | `true` = auto-generate documentation from code during indexing |

**Full Code example:**
```json
{
  "name": "backend-api",
  "project_name": "Engineering",
  "link": "https://github.com/org/backend",
  "branch": "main",
  "index_type": "code",
  "description": "Backend API codebase",
  "files_filter": "src/**/*.ts",
  "docs_generation": true
}
```

### Google Docs

```bash
codemie sdk datasources create google --data '{
  "name": "team-docs",
  "project_name": "Product",
  "google_doc": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms",
  "description": "Team documentation",
  "shared_with_project": true
}'
```

**Google-specific fields:**

| Field | Required | Description |
|-------|----------|-------------|
| `google_doc` | ✅ | Google Doc ID (from URL) or full Google Docs URL |

## Update

Same subcommands as create, but takes `<id>` after the type:

```bash
codemie sdk datasources update confluence <id> --data '{"name":"updated-wiki","project_name":"Documentation","cql":"space=NEWTEAM"}'
codemie sdk datasources update jira <id> --data '{"name":"support-tickets","project_name":"Support","jql":"project=SUP AND status=Open"}'
codemie sdk datasources update file <id> --data '{"name":"team-docs","project_name":"Engineering","description":"Updated docs"}'
codemie sdk datasources update code <id> --json updates.json
# Output: ✓ Incremental reindexing of datasource <name> has been started in the background
```

**Update-only reindex flags** (add to any update payload):

| Flag | Description |
|------|-------------|
| `full_reindex` | Discard existing index and re-fetch everything from scratch |
| `incremental_reindex` | Only fetch and index content changed since last run (default for most types) |
| `resume_indexing` | Resume a previously interrupted indexing job |
| `skip_reindex` | Update metadata (name, description, etc.) without triggering any reindex |

```bash
# Rename without reindexing
codemie sdk datasources update confluence <id> --data '{"name":"new-name","project_name":"Documentation","cql":"space=TEAM","skip_reindex":true}'

# Force full re-fetch
codemie sdk datasources update code <id> --data '{"name":"main-repo","project_name":"Engineering","link":"https://github.com/org/repo","branch":"main","index_type":"code","full_reindex":true}'
```

## Delete

```bash
codemie sdk datasources get <id>
codemie sdk datasources delete <id>
```

## Linking to an Assistant

After creating a datasource, attach it to an assistant via the assistant's `context` field.

- Use `context_type: "knowledge_base"` for file, Confluence, Jira, and Google datasources.
- Use `context_type: "code"` for code repository datasources.

```bash
# Get datasource ID
DS_ID=$(codemie sdk datasources list --search 'my-docs' --json | jq -r '.[0].id')
DS_NAME=$(codemie sdk datasources list --search 'my-docs' --json | jq -r '.[0].name')

# Attach to assistant
codemie sdk assistants update <assistant-id> --data "{
  \"context\": [{\"id\": \"$DS_ID\", \"context_type\": \"knowledge_base\", \"name\": \"$DS_NAME\"}]
}"
```

> See [Assistants — Linking a Datasource](assistants.md#linking-a-datasource) for full details.

### JSON Knowledge Base

```bash
codemie sdk datasources create json --data '{
  "name": "json-data",
  "project_name": "Team",
  "description": "JSON knowledge base",
  "shared_with_project": true
}'
```

### Provider

```bash
codemie sdk datasources create provider --data '{
  "name": "my-provider",
  "project_name": "Team",
  "description": "Provider datasource",
  "shared_with_project": true
}'
```

### Summary

```bash
codemie sdk datasources create summary --data '{
  "name": "my-summary",
  "project_name": "Team",
  "description": "Summary datasource",
  "shared_with_project": true
}'
```

### Chunk Summary

```bash
codemie sdk datasources create chunk-summary --data '{
  "name": "my-chunk-summary",
  "project_name": "Team",
  "description": "Chunk summary datasource",
  "shared_with_project": true
}'
```

**Fields for json, provider, summary, chunk-summary (base fields only):**

| Field | Required | Description |
|-------|----------|-------------|
| `name` | ✅ | Must match `^[a-zA-Z0-9][\w-]*$` — no spaces, use hyphens |
| `project_name` | ✅ | Project to create the datasource in |
| `description` | — | Human-readable description |
| `shared_with_project` | — | `true` = visible to all project members |
| `setting_id` | — | Integration ID for authentication |

## Scripting

```bash
# Check for failed datasources
codemie sdk datasources list --status failed --json | jq -r '.[] | "\(.name) (\(.project_name)): \(.error_message)"'

# List by type
codemie sdk datasources list --datasource-types knowledge_base_confluence --json
```
