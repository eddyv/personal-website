import { createHash } from "node:crypto";
import {
  chmodSync,
  closeSync,
  lstatSync,
  mkdirSync,
  openSync,
  readdirSync,
  readFileSync,
  realpathSync,
  writeFileSync,
} from "node:fs";
import {
  basename,
  dirname,
  isAbsolute,
  join,
  relative,
  resolve,
  sep,
} from "node:path";
import { backup, DatabaseSync, type SQLOutputValue } from "node:sqlite";
import { pathToFileURL } from "node:url";

interface Fingerprint {
  schema: string;
  rows: string;
}

interface Manifest {
  version: 1;
  relativePath: string;
  sha256: string;
  fingerprint: Fingerprint;
}

// Only our static validation messages are safe to print; SQLite errors may
// contain private SQL or row values.
class RecoveryError extends Error {}

const hashPattern = /^[a-f0-9]{64}$/;
const requiredTables = ["_emdash_collections", "_emdash_migrations", "options"];

function exists(path: string): boolean {
  try {
    lstatSync(path);
    return true;
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

// Inspect existing ancestors even when the final destination does not exist.
// Reject aliases rather than allowing a symlink to evade overlap checks.
function safePath(input: string): string {
  const requested = resolve(input);
  const parent = dirname(requested);
  const path =
    parent === requested
      ? requested
      : join(safePath(parent), basename(requested));
  if (exists(path)) {
    if (lstatSync(path).isSymbolicLink()) {
      throw new RecoveryError("Symlinks are not allowed in recovery paths.");
    }
    return realpathSync(path);
  }
  return path;
}

function isWithin(parent: string, child: string): boolean {
  const path = relative(parent, child);
  if (
    path === "" ||
    (!isAbsolute(path) && path !== ".." && !path.startsWith(`..${sep}`))
  ) {
    return true;
  }
  if (!exists(parent)) {
    return false;
  }
  // realpath can retain alias casing on macOS. Compare existing ancestor
  // identities too, including the parent of a not-yet-created destination.
  const parentInfo = lstatSync(parent);
  let ancestor = child;
  while (true) {
    if (exists(ancestor)) {
      const info = lstatSync(ancestor);
      if (info.dev === parentInfo.dev && info.ino === parentInfo.ino) {
        return true;
      }
    }
    const next = dirname(ancestor);
    if (next === ancestor) {
      return false;
    }
    ancestor = next;
  }
}

function newDestination(source: string, output: string): string {
  const destination = safePath(output);
  if (isWithin(source, destination) || isWithin(destination, source)) {
    throw new RecoveryError("Source and destination must not overlap.");
  }
  if (exists(destination)) {
    throw new RecoveryError("Destination must be a new directory.");
  }
  return destination;
}

function privateDirectory(path: string): void {
  if (!exists(dirname(path))) {
    privateDirectory(dirname(path));
  }
  mkdirSync(path, { mode: 0o700 });
}

function ordinaryFiles(directory: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = safePath(join(directory, entry.name));
    if (entry.isDirectory()) {
      files.push(...ordinaryFiles(path));
    } else if (entry.isFile()) {
      files.push(path);
    } else {
      throw new RecoveryError(
        "Recovery inputs must contain only ordinary files and directories."
      );
    }
  }
  return files;
}

function sourceDatabase(root: string): string {
  const candidates = ordinaryFiles(join(root, "v3", "d1")).filter(
    (path) => path.endsWith(".sqlite") && basename(path) !== "metadata.sqlite"
  );
  if (candidates.length !== 1) {
    throw new RecoveryError(
      "Expected exactly one SQLite database under state-root/v3/d1."
    );
  }
  return candidates[0];
}

function quoteIdentifier(name: string): string {
  return `"${name.replaceAll('"', '""')}"`;
}

function requireEmDash(db: DatabaseSync): void {
  for (const table of requiredTables) {
    if (
      !(
        db
          .prepare(
            "SELECT 1 FROM sqlite_schema WHERE type = 'table' AND name = ?"
          )
          .get(table) &&
        db.prepare(`SELECT 1 FROM ${quoteIdentifier(table)} LIMIT 1`).get()
      )
    ) {
      throw new RecoveryError(
        "Expected a populated EmDash database (collections, migrations, options)."
      );
    }
  }
}

function hash(value: string | Uint8Array): string {
  return createHash("sha256").update(value).digest("hex");
}

function encodeValue(value: SQLOutputValue): [string, string?] {
  if (value === null) {
    return ["null"];
  }
  if (typeof value === "bigint") {
    return ["integer", value.toString()];
  }
  if (typeof value === "number") {
    const bytes = Buffer.alloc(8);
    bytes.writeDoubleBE(value);
    return ["float", bytes.toString("hex")];
  }
  if (typeof value === "string") {
    return ["text", value];
  }
  return ["blob", Buffer.from(value).toString("hex")];
}

function inspect(db: DatabaseSync): Fingerprint {
  requireEmDash(db);
  const integrity = db.prepare("PRAGMA integrity_check").all();
  if (integrity.length !== 1 || integrity[0].integrity_check !== "ok") {
    throw new RecoveryError("SQLite integrity check failed.");
  }
  if (db.prepare("PRAGMA foreign_key_check").all().length !== 0) {
    throw new RecoveryError("SQLite foreign key check failed.");
  }
  const schema = db
    .prepare(
      "SELECT type, name, tbl_name, sql FROM sqlite_schema ORDER BY type, name"
    )
    .all();
  const tables = db
    .prepare(
      "SELECT name FROM sqlite_schema WHERE type = 'table' ORDER BY name"
    )
    .all();
  const rows = createHash("sha256");
  for (const { name } of tables) {
    if (typeof name !== "string") {
      throw new RecoveryError("Invalid SQLite table name.");
    }
    const statement = db.prepare(`SELECT * FROM ${quoteIdentifier(name)}`);
    statement.setReadBigInts(true);
    // SQLite SELECT * has unique column names for a table, including FTS shadows.
    const encodings = statement
      .all()
      .map((row) => JSON.stringify(Object.values(row).map(encodeValue)));
    encodings.sort();
    rows.update(JSON.stringify([name, encodings]));
  }
  return { schema: hash(JSON.stringify(schema)), rows: rows.digest("hex") };
}

/** Inspect an existing database without creating an empty database on a bad path. */
export function inspectDatabase(path: string): Fingerprint {
  const database = safePath(path);
  if (!lstatSync(database).isFile()) {
    throw new RecoveryError("Expected an ordinary SQLite file.");
  }
  const db = new DatabaseSync(database, { readOnly: true });
  try {
    return inspect(db);
  } finally {
    db.close();
  }
}

async function snapshot(
  source: DatabaseSync,
  destination: string
): Promise<void> {
  // Reserve an exclusively new, private file before SQLite opens the target.
  closeSync(openSync(destination, "wx", 0o600));
  await backup(source, destination);
  chmodSync(destination, 0o600);
}

function privateFiles(directory: string): void {
  for (const file of ordinaryFiles(directory)) {
    chmodSync(file, 0o600);
  }
}

function matchingFingerprint(actual: Fingerprint, expected: Fingerprint): void {
  if (actual.schema !== expected.schema || actual.rows !== expected.rows) {
    throw new RecoveryError(
      "Database schema or row-value fingerprint mismatch."
    );
  }
}

/** Local SQLite online backup only; never imports Wrangler or contacts D1. */
export async function backupLocalD1(
  stateRoot: string,
  backupDirectory: string
): Promise<void> {
  const source = safePath(stateRoot);
  const destination = newDestination(source, backupDirectory);
  const path = sourceDatabase(source);
  const db = new DatabaseSync(path, { readOnly: true });
  try {
    requireEmDash(db);
    privateDirectory(destination);
    const database = join(destination, "database.sqlite");
    await snapshot(db, database);
    // Inspect the completed snapshot, not a separately observed live source.
    const fingerprint = inspectDatabase(database);
    privateFiles(destination);
    const manifest: Manifest = {
      version: 1,
      relativePath: relative(source, path).split(sep).join("/"),
      sha256: hash(readFileSync(database)),
      fingerprint,
    };
    writeFileSync(
      join(destination, "manifest.json"),
      `${JSON.stringify(manifest, null, 2)}\n`,
      {
        flag: "wx",
        mode: 0o600,
      }
    );
  } finally {
    db.close();
  }
}

function readManifest(directory: string): Manifest {
  const manifest: unknown = JSON.parse(
    readFileSync(join(directory, "manifest.json"), "utf8")
  );
  if (typeof manifest !== "object" || manifest === null) {
    throw new RecoveryError("Invalid recovery manifest.");
  }
  const { version, relativePath, sha256, fingerprint } =
    manifest as Partial<Manifest>;
  if (
    version !== 1 ||
    typeof relativePath !== "string" ||
    typeof sha256 !== "string" ||
    !hashPattern.test(sha256) ||
    typeof fingerprint?.schema !== "string" ||
    !hashPattern.test(fingerprint.schema) ||
    typeof fingerprint?.rows !== "string" ||
    !hashPattern.test(fingerprint.rows)
  ) {
    throw new RecoveryError(
      "Invalid recovery manifest version or fingerprints."
    );
  }
  const parts = relativePath.split("/");
  if (
    parts.length < 3 ||
    parts[0] !== "v3" ||
    parts[1] !== "d1" ||
    !relativePath.endsWith(".sqlite") ||
    parts.some((part) => !part || part === "." || part === "..") ||
    relativePath.includes("\\") ||
    relativePath.includes("\0")
  ) {
    throw new RecoveryError(
      "Invalid manifest database path; expected a relative v3/d1 SQLite path."
    );
  }
  return { version, relativePath, sha256, fingerprint };
}

export async function restoreLocalD1(
  backupDirectory: string,
  stateRoot: string
): Promise<void> {
  const source = safePath(backupDirectory);
  const destination = newDestination(source, stateRoot);
  ordinaryFiles(source);
  const manifest = readManifest(source);
  const database = join(source, "database.sqlite");
  if (hash(readFileSync(database)) !== manifest.sha256) {
    throw new RecoveryError("Snapshot SHA-256 checksum mismatch.");
  }
  // All input validation finishes before creating any restore destination.
  matchingFingerprint(inspectDatabase(database), manifest.fingerprint);
  const db = new DatabaseSync(database, { readOnly: true });
  try {
    privateDirectory(destination);
    const restored = join(destination, manifest.relativePath);
    privateDirectory(dirname(restored));
    await snapshot(db, restored);
    matchingFingerprint(inspectDatabase(restored), manifest.fingerprint);
    privateFiles(destination);
  } finally {
    db.close();
  }
}

async function main(args: string[]): Promise<void> {
  const [command, source, destination] = args;
  if (
    args.length !== 3 ||
    !source ||
    !destination ||
    (command !== "backup" && command !== "restore")
  ) {
    throw new RecoveryError(
      "Usage: cms:recovery backup <state-root> <new-backup-dir> | restore <backup-dir> <new-state-root>"
    );
  }
  if (command === "backup") {
    await backupLocalD1(source, destination);
  } else {
    await restoreLocalD1(source, destination);
  }
  process.stdout.write(
    `Local D1 ${command} verified. No other resources were captured.\n`
  );
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  try {
    await main(process.argv.slice(2));
  } catch (error) {
    const reason =
      error instanceof RecoveryError
        ? error.message
        : "Check SQLite inputs and use a new destination.";
    process.stderr.write(
      `Local D1 recovery failed: ${reason} No existing data was replaced.\n`
    );
    process.exitCode = 1;
  }
}
