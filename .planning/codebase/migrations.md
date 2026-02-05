# Migration Standards

These rules apply to all Drizzle ORM database migrations. They are enforced on every migration change.

## Naming Convention

- **Never use random Drizzle default names.** Always specify a descriptive name with a standard number prefix.
- **Format:** `NNNN_descriptive_name` (4-digit zero-padded number + underscore + snake_case description).

```bash
# Good
npx drizzle-kit generate --name 0000_create_auth_tables
npx drizzle-kit generate --name 0001_add_github_accounts
npx drizzle-kit generate --name 0002_add_installation_tracking

# Bad (random Drizzle defaults)
npx drizzle-kit generate
# produces: 0000_orange_bloodaxe.sql
```

## Renaming Migrations

When renaming a migration file, you **must also update** the `tag` field in `meta/_journal.json`. Drizzle tracks migrations by the `tag` value, not the filename alone. Failing to update the journal causes Drizzle to see the renamed file as a new migration and attempt to re-run it.

```json
// meta/_journal.json
{
  "entries": [
    {
      "idx": 0,
      "tag": "0000_create_auth_tables",
      ...
    }
  ]
}
```

## Schema Files

- **One schema file per domain** in `backend/src/db/schema/` (e.g., `auth.ts`, `github.ts`).
- **Re-export from `index.ts`:** `export * from './auth.js'`
- **`drizzle.config.ts` uses a schema array**, not the barrel `index.ts`. This avoids a CJS `.js` import resolution conflict.

```typescript
// drizzle.config.ts
export default defineConfig({
  schema: [
    './src/db/schema/auth.ts',
    // add new schema files here
  ],
  // ...
})
```

## Migration Script

- **Separate migration script** at `backend/scripts/migrate.ts`. It runs independently of the application server, suitable for CI/CD pipelines.
- **Reads `process.env` directly** (exempt from the config-only rule, since it is a CLI tool).
- **Run before service deployment** in CI/CD. Also runnable manually for local development.

## Generation Workflow

1. Edit schema files in `backend/src/db/schema/`.
2. Generate migration: `npx drizzle-kit generate --name NNNN_descriptive_name`
3. Review the generated SQL in `backend/migrations/NNNN_descriptive_name.sql`.
4. Apply: `npx tsx scripts/migrate.ts` (or via Docker compose).
5. Commit both the schema change and the migration file together.

## Rules

- **Never edit generated migration SQL** unless you understand the implications. If the generated SQL is wrong, fix the schema and regenerate.
- **Never delete a migration** that has been applied to any database (dev, test, or prod). Create a new migration to undo changes.
- **Migrations are append-only.** Each new migration gets the next sequential number.
