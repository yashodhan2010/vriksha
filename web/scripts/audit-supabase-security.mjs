import dotenv from "dotenv";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Client } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

const databaseUrl = process.env.SUPABASE_DB_URL;

if (!databaseUrl) {
  console.error("SUPABASE_DB_URL is missing in web/.env.local.");
  process.exit(1);
}

const queries = [
  {
    name: "Public tables without RLS",
    sql: `
      select n.nspname as schema, c.relname as table
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and c.relkind = 'r'
        and not c.relrowsecurity
      order by c.relname
    `,
  },
  {
    name: "Public table RLS status",
    sql: `
      select n.nspname as schema,
             c.relname as table,
             c.relrowsecurity as rls_enabled,
             c.relforcerowsecurity as rls_forced
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and c.relkind = 'r'
      order by c.relname
    `,
  },
  {
    name: "Public policy counts",
    sql: `
      select schemaname as schema,
             tablename as table,
             count(*)::int as policy_count,
             string_agg(policyname, ', ' order by policyname) as policies
      from pg_policies
      where schemaname = 'public'
      group by schemaname, tablename
      order by tablename
    `,
  },
  {
    name: "Anon/authenticated table grants",
    sql: `
      select table_schema as schema,
             table_name as table,
             grantee,
             string_agg(privilege_type, ', ' order by privilege_type) as privileges
      from information_schema.role_table_grants
      where table_schema = 'public'
        and grantee in ('anon', 'authenticated')
      group by table_schema, table_name, grantee
      order by table_name, grantee
    `,
  },
  {
    name: "Storage buckets",
    sql: `
      select id, name, public, file_size_limit, allowed_mime_types
      from storage.buckets
      order by id
    `,
  },
];

const client = new Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
});

try {
  await client.connect();

  let missingRlsCount = 0;
  let publicBucketCount = 0;

  for (const query of queries) {
    const result = await client.query(query.sql);
    console.log(`\n## ${query.name}`);
    console.table(result.rows);

    if (query.name === "Public tables without RLS") {
      missingRlsCount = result.rows.length;
    }

    if (query.name === "Storage buckets") {
      publicBucketCount = result.rows.filter((row) => row.public).length;
    }
  }

  if (missingRlsCount > 0 || publicBucketCount > 0) {
    console.error("\nSecurity audit failed.");
    process.exitCode = 1;
  } else {
    console.log("\nSecurity audit passed: no public tables without RLS and no public storage buckets found.");
  }
} catch (error) {
  console.error("\nCould not connect to Supabase Postgres.");
  console.error(error.code ? `${error.code}: ${error.message}` : error.message);
  console.error(
    "If this uses db.<project-ref>.supabase.co:5432 and your network has no IPv6 route, replace SUPABASE_DB_URL with the Supabase pooler connection string."
  );
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
