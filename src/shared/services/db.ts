import Database from "@tauri-apps/plugin-sql";

// IMPORTANT: this connection string must exactly match the one registered
// via add_migrations(...) in src-tauri/src/lib.rs, or migrations won't run
// and every table query will fail with "no such table". A relative path
// here is resolved by the SQL plugin against the app's data directory
// automatically — no need to resolve appDataDir() manually on the JS side.
const DB_CONNECTION = "sqlite:omnia.db";

let db: Database | null = null;

export const getDb = async () => {
  if (!db) {
    db = await Database.load(DB_CONNECTION);
  }
  return db;
};

export const query = async <T>(sql: string, bindValues: unknown[] = []): Promise<T[]> => {
  const database = await getDb();
  return await database.select<T[]>(sql, bindValues);
};

export const execute = async (sql: string, bindValues: unknown[] = []): Promise<void> => {
  const database = await getDb();
  await database.execute(sql, bindValues);
};
