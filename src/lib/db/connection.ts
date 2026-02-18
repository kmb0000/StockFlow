import { Pool, QueryResultRow } from "pg";

//Crée un Pool de connexions (réutilisables)
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, //Nécessaire pour Neon
  },
});

//function helper pour exécuter des requêtes
export const db = {
  query: <T extends QueryResultRow>(text: string, params?: unknown[]) =>
    pool.query<T>(text, params),
  getClient: () => pool.connect(),
};
