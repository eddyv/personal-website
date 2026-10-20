# EmDash recovery preparation and future upgrade

This change prepares a **local D1 snapshot and restore rehearsal**. It does
not upgrade EmDash, migrate a database, deploy, or provide a complete site,
media, or production backup. The repository currently pairs `emdash` and
`@emdash-cms/cloudflare` at **0.17.2**, with Wrangler **4.99.0**.

## Rehearse local D1 recovery first

Use **Node 24** for this tool and its Vitest tests. It uses Node's built-in
`node:sqlite` online `backup()` API and native TypeScript stripping; no SQLite
CLI, new package, Wrangler import, network connection, or cloud credential is
needed. Run from the repository root:

```sh
node --version
# Stop dev/preview servers and any other local writers before this rehearsal.
bun run cms:recovery backup ".wrangler/state" ".local-recovery/before-upgrade"
bun run cms:recovery restore ".local-recovery/before-upgrade" ".local-recovery/restored-state"
```

Both output directories must be **new**. Restore reconstructs the original
relative D1 path under the new state root; it never replaces `.wrangler/state`.
Choose a restore root outside the original live state, as in the example above.
Restore checks overlap with the backup directory; the manifest does not retain
the original absolute state root, so this additional isolation is the caller's
responsibility.
Do not delete existing state, reseed it, or start an upgraded app against the
original state to test recovery. A later, explicit cutover can choose which
verified state to use after preserving the original.

The tool searches only `<state-root>/v3/d1` for exactly one ordinary `.sqlite`
file (excluding `metadata.sqlite`), and requires populated EmDash collections,
migration records, and options. Missing, ambiguous, empty, and unrelated
databases fail rather than silently backing up a newly created database. R2
SQLite files are outside discovery. Symlinks in input paths or the inspected
D1/backup tree, existing destinations, and source/destination overlap in either
direction are rejected. Use physical paths if an ancestor is a symlink.

`database.sqlite` is produced with SQLite's [online backup API](https://sqlite.org/backup.html),
which includes committed WAL data. Copying only the main `.sqlite` file while
a WAL is active can omit committed writes. The source connection is read-only;
the tool does not checkpoint it, drop FTS tables, or export/replay SQL.

`manifest.json` records format version 1, the original relative D1 path, the
snapshot SHA-256, and separate schema and row-value SHA-256 fingerprints. The
fingerprints cover full schema SQL (including indexes, triggers, views, virtual
and shadow tables) and every table's declared column values. Integers use BigInt, blobs
use hex, floats retain their binary representation, and sorted row encodings
retain duplicates without relying on query order. Integrity and foreign key
checks must pass. The completed snapshot is inspected, so the manifest describes
one SQLite view rather than two observations of a changing source.
The physical backup preserves implicit rowids and database properties; the
fingerprints do not independently compare implicit rowids or all PRAGMA values.

Restore checks the manifest path, checksum, integrity, foreign keys, and
fingerprints **before creating the destination**. It uses SQLite backup to
restore, then verifies the restored database against the same fingerprints.
Success prints no rows. A failed command exits nonzero; partially created new
output may remain for inspection and must not be treated as a recovery point.
Retry with a different new directory; the tool never removes existing files.

Keep `.local-recovery/` private: it is gitignored, new directories have mode
`700`, and output files have mode `600`. Snapshots contain authentication and
other private data. Hashes detect damage; they do not encrypt or authenticate
a backup. Store any retained copy securely and keep its matching application
commit/artifact and runtime versions. The fingerprint comparison loads and sorts
rows in memory; this small local-site tool is not intended for large databases.

Before accepting the real-state rehearsal, record the backup/restore command
results and manifest hashes, then independently inspect the restored copy for
published posts, drafts, exact Portable Text, options/non-seed edits, migration
records, and working FTS search. The focused Vitest fixture exercises these
properties, including committed WAL rows with an open writer. It does not
replace a rehearsal against the actual local database. Keep
`test/fixtures/expected-posts.ts` unchanged for later app verification.

The online backup provides a consistent SQLite snapshot, not a coordinated
snapshot across resources. Stop writers for rehearsals and any multi-resource
capture. **R2 objects, KV, static media files, deployment configuration, secrets,
and encryption keys are not included.** Preserve each separately as applicable.
This command does not switch the app to the restored state or start a server.

## Upgrade work belongs in later PRs

As checked on October 20, 2026, the npm `latest` versions of EmDash and its
Cloudflare adapter are **1.3.1**, released October 18. Keep the two packages
at the same version: the adapter requires its exact matching EmDash release.
Recheck the target and changelogs when the upgrade starts. See the
[updating guide](https://docs.emdashcms.com/deployment/updating/) and
[1.3.1 release notes](https://github.com/emdash-cms/emdash/releases/tag/emdash@1.3.1).

1. Finish and retain a verified recovery rehearsal with the current 0.17.2
   application and preserve the other resources above.
2. In a separate upgrade PR, move **both packages to 0.35.0** and review the
   intervening changelogs. The updater requires EmDash >=0.35.0. Establish a
   recovery point before starting the upgraded app: runtime startup can apply
   forward-only migrations on the first request.
3. Use the updater for the remaining upgrade only in that later work. Review
   its plan and generated `.emdash/UPGRADE.md`, including added migrations,
   project actions, and the matching application/build artifact. Verify recovery
   before any upgraded runtime starts or deploys.
4. Audit `astro.config.mjs` before 1.x. Its four `emdash/middleware/{auth,redirect,request-context,setup}`
   optimizeDeps entries refer to internals moved under `emdash/internal/` in
   1.0. Remove or adjust the obsolete workarounds based on actual target exports
   and SSR behavior; do not blindly rename them. Also review the parent
   `emdash/middleware` entry. See the [1.0 breaking changes](https://docs.emdashcms.com/upgrade-to-v1/).
5. Validate types/build, unit tests, and the unchanged semantic content contract
   against an isolated restored state before considering a production cutover.

Use Node 24 here. The reviewed 1.3.1 package runtime floor is Node >=22.16;
the current [getting-started guide](https://docs.emdashcms.com/getting-started/)
asks for >=22.22. Recheck requirements for the selected target rather than
relying on this repository's older `engines` floor.

## Production is a separate recovery and migration operation

For a future Workers upgrade **from 0.38 or earlier**, the 1.3.1 release requires
CLI migration before deploy for the large content migrations. Read the
[core migrations guide](https://docs.emdashcms.com/deployment/core-migrations/)
and use the exact manifest from the target build. **`emdash migrate` targets
remote D1 only. Never run it, including status/check variants, as part of this
local rehearsal.** This preparation does not provision, inspect, or change a
remote database.

Production recovery needs an appropriate D1 Time Travel recovery point and/or
an offsite D1 dump, plus a separately rehearsed R2/media recovery procedure and
the matching configuration/secrets. Raw local `.sqlite` snapshots are not remote
D1 imports. Cloudflare's [import/export guide](https://developers.cloudflare.com/d1/best-practices/import-export-data/)
describes SQL export/import and its limitations; no SQL exporter is implemented
here.

Reverting application code **does not revert a migrated database**. EmDash's
JSON backup and this repository's `.emdash/seed.json` are not rollback recovery
points: seed content cannot reproduce drafts, auth, arbitrary edits, migration
history, and all other database state. Follow EmDash's
[backups and recovery guide](https://docs.emdashcms.com/guides/backups/) for the
production database and media. Production cutover and rollback remain future,
explicitly planned work.
