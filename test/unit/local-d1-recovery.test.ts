import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { afterEach, beforeEach, expect, it } from "vitest";
import {
  backupLocalD1,
  inspectDatabase,
  restoreLocalD1,
} from "../../scripts/local-d1-recovery.ts";

const relativeDatabase = "v3/d1/miniflare-D1DatabaseObject/site.sqlite";
const portableText = JSON.stringify([
  {
    _type: "block",
    children: [{ _type: "span", text: 'Exact text: 🦊 "quotes"\nnext line' }],
  },
  { _type: "image", asset: { url: "/blog/example/photo.png" }, alt: "A photo" },
]);
let directory: string;
let state: string;
let database: string;
let writer: DatabaseSync;

beforeEach(() => {
  directory = mkdtempSync(
    join(realpathSync(tmpdir()), "local recovery $ ` ; ")
  );
  state = join(directory, "source state");
  database = join(state, relativeDatabase);
  mkdirSync(dirname(database), { recursive: true });
  writer = new DatabaseSync(database);
  // D1 metadata and a different storage resource are not application databases.
  writeFileSync(join(state, "v3/d1/metadata.sqlite"), "metadata");
  mkdirSync(join(state, "v3/r2"));
  writeFileSync(join(state, "v3/r2/object.sqlite"), "not D1");
  writer.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA wal_autocheckpoint = 0;
    CREATE TABLE _emdash_collections (id TEXT PRIMARY KEY, slug TEXT UNIQUE);
    CREATE TABLE _emdash_migrations (name TEXT PRIMARY KEY);
    CREATE TABLE options (name TEXT PRIMARY KEY, value TEXT NOT NULL);
    CREATE TABLE ec_posts (id TEXT PRIMARY KEY, status TEXT, content TEXT,
      collection_id TEXT REFERENCES _emdash_collections(id));
    CREATE INDEX posts_status ON ec_posts(status);
    CREATE TABLE audit (message TEXT);
    CREATE TRIGGER post_insert AFTER INSERT ON ec_posts
      BEGIN INSERT INTO audit VALUES (new.id); END;
    CREATE VIEW published_posts AS SELECT * FROM ec_posts WHERE status = 'published';
    CREATE VIRTUAL TABLE post_search USING fts5(content);
    CREATE TABLE typed_values (integer_value INTEGER, real_value REAL, blob_value BLOB, null_value, text_value TEXT);
    INSERT INTO _emdash_collections VALUES ('posts', 'posts');
    INSERT INTO _emdash_migrations VALUES ('001_initial');
    INSERT INTO options VALUES ('nonseed-marker', '{"private":"keep me"}');
    INSERT INTO typed_values VALUES (9223372036854775806, 1.25, x'00ff10', NULL, '1');
    INSERT INTO typed_values SELECT * FROM typed_values;
    INSERT INTO post_search (rowid, content) VALUES (27, 'recovery wal sentinel');
  `);
  const insert = writer.prepare(
    "INSERT INTO ec_posts VALUES (?, ?, ?, 'posts')"
  );
  insert.run("published", "published", portableText);
  insert.run("draft", "draft", portableText);
});

afterEach(() => {
  writer.close();
  rmSync(directory, { recursive: true, force: true });
});

function rewriteManifest(
  backupDirectory: string,
  updates: Record<string, unknown>
): void {
  const path = join(backupDirectory, "manifest.json");
  const manifest = JSON.parse(readFileSync(path, "utf8"));
  writeFileSync(path, JSON.stringify({ ...manifest, ...updates }));
}

it("round-trips committed WAL data, exact content, complete schema and typed duplicate rows using the CLI", () => {
  const backupDirectory = join(directory, "backup $ ` ; space");
  const restored = join(directory, "restored state");
  const before = inspectDatabase(database);
  const mainBytes = readFileSync(database);
  const walBytes = readFileSync(`${database}-wal`);
  expect(walBytes.length).toBeGreaterThan(0);
  for (const args of [
    ["backup", state, backupDirectory],
    ["restore", backupDirectory, restored],
  ]) {
    const output = execFileSync(
      process.execPath,
      ["scripts/local-d1-recovery.ts", ...args],
      {
        cwd: process.cwd(),
        encoding: "utf8",
      }
    );
    expect(output).toContain("verified");
    expect(output).not.toContain("keep me");
  }
  expect(readFileSync(database)).toEqual(mainBytes);
  expect(readFileSync(`${database}-wal`)).toEqual(walBytes);
  expect(inspectDatabase(database)).toEqual(before);
  const restoredFile = join(restored, relativeDatabase);
  expect(inspectDatabase(restoredFile)).toEqual(before);
  const db = new DatabaseSync(restoredFile, { readOnly: true });
  try {
    expect(
      db.prepare("SELECT id, status, content FROM ec_posts ORDER BY id").all()
    ).toEqual([
      { id: "draft", status: "draft", content: portableText },
      { id: "published", status: "published", content: portableText },
    ]);
    expect(
      db
        .prepare("SELECT value FROM options WHERE name = 'nonseed-marker'")
        .get()?.value
    ).toBe('{"private":"keep me"}');
    expect(db.prepare("SELECT name FROM _emdash_migrations").get()?.name).toBe(
      "001_initial"
    );
    expect(db.prepare("SELECT id FROM published_posts").all()).toEqual([
      { id: "published" },
    ]);
    expect(
      db
        .prepare(
          "SELECT rowid FROM post_search WHERE post_search MATCH 'sentinel'"
        )
        .all()
    ).toEqual([{ rowid: 27 }]);
    const values = db.prepare("SELECT * FROM typed_values");
    values.setReadBigInts(true);
    expect(values.all()).toEqual(
      Array.from({ length: 2 }, () => ({
        integer_value: 9_223_372_036_854_775_806n,
        real_value: 1.25,
        blob_value: new Uint8Array([0, 255, 16]),
        null_value: null,
        text_value: "1",
      }))
    );
    expect(
      db.prepare("SELECT message FROM audit ORDER BY message").all()
    ).toEqual([{ message: "draft" }, { message: "published" }]);
    expect(db.prepare("PRAGMA foreign_key_list(ec_posts)").all()).toHaveLength(
      1
    );
    expect(
      db
        .prepare("SELECT sql FROM sqlite_schema WHERE name = 'posts_status'")
        .get()?.sql
    ).toContain("CREATE INDEX");
    expect(
      db
        .prepare("SELECT sql FROM sqlite_schema WHERE name = 'post_insert'")
        .get()?.sql
    ).toContain("CREATE TRIGGER");
  } finally {
    db.close();
  }
  for (const path of [backupDirectory, restored, dirname(restoredFile)]) {
    expect(statSync(path).mode % 0o1000).toBe(0o700);
  }
  for (const path of [
    ...readdirSync(backupDirectory).map((file) => join(backupDirectory, file)),
    ...readdirSync(dirname(restoredFile)).map((file) =>
      join(dirname(restoredFile), file)
    ),
  ]) {
    expect(statSync(path).mode % 0o1000).toBe(0o600);
  }
});

it("fingerprints row values, duplicate multiplicity and full schema without depending on row order", () => {
  const before = inspectDatabase(database);
  writer.exec(
    "DELETE FROM audit; INSERT INTO audit VALUES ('draft'), ('published');"
  );
  expect(inspectDatabase(database)).toEqual(before);
  writer.exec("UPDATE typed_values SET integer_value = integer_value - 1;");
  expect(inspectDatabase(database).rows).not.toBe(before.rows);
  writer.exec(
    "UPDATE typed_values SET integer_value = integer_value + 1; DELETE FROM typed_values WHERE rowid = 2;"
  );
  expect(inspectDatabase(database).rows).not.toBe(before.rows);
  writer.exec("CREATE INDEX extra_index ON audit(message);");
  expect(inspectDatabase(database).schema).not.toBe(before.schema);
});

it("rejects missing, ambiguous, empty and unrelated databases without creating backup output", async () => {
  const output = join(directory, "backup");
  await expect(
    backupLocalD1(join(directory, "missing"), output)
  ).rejects.toThrow();
  const extra = join(dirname(database), "extra.sqlite");
  writeFileSync(extra, "");
  await expect(backupLocalD1(state, output)).rejects.toThrow("exactly one");
  rmSync(extra);
  const emptyState = join(directory, "empty");
  const emptyDatabase = join(emptyState, relativeDatabase);
  mkdirSync(dirname(emptyDatabase), { recursive: true });
  writeFileSync(emptyDatabase, "");
  await expect(backupLocalD1(emptyState, output)).rejects.toThrow(
    "populated EmDash"
  );
  const unrelated = new DatabaseSync(emptyDatabase);
  unrelated.exec(
    "CREATE TABLE unrelated (id INTEGER); INSERT INTO unrelated VALUES (1);"
  );
  unrelated.close();
  await expect(backupLocalD1(emptyState, output)).rejects.toThrow(
    "populated EmDash"
  );
  expect(existsSync(output)).toBe(false);
});

it("never overwrites directories and rejects overlapping roots in both directions", async () => {
  await expect(backupLocalD1(state, directory)).rejects.toThrow("overlap");
  await expect(
    backupLocalD1(state, join(state, "nested", "backup"))
  ).rejects.toThrow("overlap");
  // Existing ancestors must be compared by identity on case-insensitive volumes.
  const caseAlias = join(directory, "SOURCE STATE");
  if (existsSync(caseAlias)) {
    await expect(
      backupLocalD1(state, join(caseAlias, "new backup"))
    ).rejects.toThrow("overlap");
  }
  const backupDirectory = join(directory, "backup");
  await backupLocalD1(state, backupDirectory);
  await expect(backupLocalD1(state, backupDirectory)).rejects.toThrow(
    "new directory"
  );
  await expect(restoreLocalD1(backupDirectory, state)).rejects.toThrow(
    "new directory"
  );
  await expect(restoreLocalD1(backupDirectory, directory)).rejects.toThrow(
    "overlap"
  );
  await expect(
    restoreLocalD1(backupDirectory, join(backupDirectory, "nested"))
  ).rejects.toThrow("overlap");
});

it("rejects source, backup and destination-ancestor symlinks without writes", async () => {
  const alias = join(directory, "alias");
  symlinkSync(state, alias);
  await expect(backupLocalD1(alias, join(directory, "unused"))).rejects.toThrow(
    "Symlinks"
  );
  await expect(
    backupLocalD1(state, join(alias, "missing", "backup"))
  ).rejects.toThrow("Symlinks");
  const link = join(dirname(database), "alias.sqlite");
  symlinkSync(database, link);
  await expect(backupLocalD1(state, join(directory, "unused"))).rejects.toThrow(
    "Symlinks"
  );
  rmSync(link);
  const backupDirectory = join(directory, "backup");
  await backupLocalD1(state, backupDirectory);
  const backupAlias = join(directory, "backup alias");
  symlinkSync(backupDirectory, backupAlias);
  const output = join(directory, "restore");
  await expect(restoreLocalD1(backupAlias, output)).rejects.toThrow("Symlinks");
  await expect(
    restoreLocalD1(backupDirectory, join(alias, "new state"))
  ).rejects.toThrow("Symlinks");
  rmSync(join(backupDirectory, "database.sqlite"));
  symlinkSync(database, join(backupDirectory, "database.sqlite"));
  await expect(restoreLocalD1(backupDirectory, output)).rejects.toThrow(
    "Symlinks"
  );
  expect(existsSync(output)).toBe(false);
  expect(existsSync(join(directory, "unused"))).toBe(false);
});

it("validates manifest paths, checksums, integrity and fingerprints before restore writes", async () => {
  const backupDirectory = join(directory, "backup");
  const output = join(directory, "restore");
  await backupLocalD1(state, backupDirectory);
  const manifestBytes = readFileSync(join(backupDirectory, "manifest.json"));
  for (const relativePath of [
    "../escape.sqlite",
    "/v3/d1/escape.sqlite",
    "v3/d1/../../escape.sqlite",
    "v3/d1\\escape.sqlite",
  ]) {
    rewriteManifest(backupDirectory, { relativePath });
    await expect(restoreLocalD1(backupDirectory, output)).rejects.toThrow(
      "manifest database path"
    );
    expect(existsSync(output)).toBe(false);
  }
  writeFileSync(join(backupDirectory, "manifest.json"), manifestBytes);
  rewriteManifest(backupDirectory, {
    fingerprint: { schema: "0".repeat(64), rows: "0".repeat(64) },
  });
  await expect(restoreLocalD1(backupDirectory, output)).rejects.toThrow(
    "fingerprint mismatch"
  );
  writeFileSync(join(backupDirectory, "manifest.json"), manifestBytes);
  writeFileSync(
    join(backupDirectory, "database.sqlite"),
    "corrupt SQLite snapshot"
  );
  await expect(restoreLocalD1(backupDirectory, output)).rejects.toThrow(
    "checksum mismatch"
  );
  rewriteManifest(backupDirectory, {
    sha256: createHash("sha256")
      .update("corrupt SQLite snapshot")
      .digest("hex"),
  });
  await expect(restoreLocalD1(backupDirectory, output)).rejects.toThrow();
  expect(existsSync(output)).toBe(false);
});

it("rejects foreign key violations rather than certifying a broken recovery point", async () => {
  writer.exec(
    "PRAGMA foreign_keys = OFF; UPDATE ec_posts SET collection_id = 'missing';"
  );
  await expect(backupLocalD1(state, join(directory, "backup"))).rejects.toThrow(
    "foreign key check"
  );
});
