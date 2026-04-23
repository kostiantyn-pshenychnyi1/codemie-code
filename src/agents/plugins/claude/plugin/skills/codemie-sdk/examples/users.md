# Users Examples

## Get current user profile

```bash
codemie sdk users me
codemie sdk users me --json
```

**JSON fields:** `name`, `username`, `applications`, `picture`

## Get current user data

```bash
codemie sdk users data
codemie sdk users data --json
```

**JSON fields:** `id`, `user_id`, `date`, `update_date`, `sidebar_view`, `stt_support`

## Scripting

```bash
# Get your username
codemie sdk users me --json | jq -r '.username'

# Get your user UUID (from user data, not profile)
codemie sdk users data --json | jq -r '.user_id'

# Get list of projects you have access to
codemie sdk users me --json | jq -r '.applications[]'
```
