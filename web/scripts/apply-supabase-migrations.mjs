import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { Client } from "pg";

const webRoot = process.cwd();
const repoRoot = path.resolve(webRoot, "..");
const envPath = path.join(webRoot, ".env.local");
const migrationsDir = path.join(repoRoot, "supabase", "migrations");

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};

  return Object.fromEntries(
    fs
      .readFileSync(filePath, "utf8")
      .split(/\r?\n/)
      .map((line) => line.match(/^\s*([^#][^=]+)=(.*)$/))
      .filter(Boolean)
      .map((match) => [match[1].trim(), match[2].trim().replace(/^"|"$/g, "")])
  );
}

const env = { ...readEnvFile(envPath), ...process.env };
const databaseUrl = env.SUPABASE_DB_URL;

if (!databaseUrl) {
  console.error("SUPABASE_DB_URL is missing in web/.env.local.");
  console.error("Get it from Supabase Project Settings -> Database -> Connection string.");
  process.exit(1);
}

try {
  new URL(databaseUrl);
} catch {
  console.error("SUPABASE_DB_URL is not a valid Postgres URL.");
  console.error("If your database password contains special characters, URL-encode them.");
  console.error("Common replacements: % -> %25, # -> %23, & -> %26, @ -> %40, / -> %2F, ? -> %3F");
  console.error("An easier option is to reset the Supabase database password to letters/numbers only, then update web/.env.local.");
  process.exit(1);
}

if (!fs.existsSync(migrationsDir)) {
  console.error(`Migrations directory not found: ${migrationsDir}`);
  process.exit(1);
}

const migrationFiles = fs
  .readdirSync(migrationsDir)
  .filter((file) => file.endsWith(".sql"))
  .sort();

if (migrationFiles.length === 0) {
  console.log("No migrations found.");
  process.exit(0);
}

const client = new Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false }
});

try {
  await client.connect();
  await client.query(`
    create table if not exists public.schema_migrations (
      version text primary key,
      applied_at timestamptz not null default now()
    );
  `);

  for (const file of migrationFiles) {
    const { rowCount } = await client.query(
      "select 1 from public.schema_migrations where version = $1",
      [file]
    );

    if (rowCount) {
      console.log(`Skipping ${file}`);
      continue;
    }

    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    console.log(`Applying ${file}`);
    await client.query("begin");
    try {
      await client.query(sql);
      await client.query("insert into public.schema_migrations (version) values ($1)", [file]);
      await client.query("commit");
      console.log(`Applied ${file}`);
    } catch (error) {
      await client.query("rollback");
      throw error;
    }
  }

  console.log("Supabase migrations complete.");
} finally {
  await client.end();
}
