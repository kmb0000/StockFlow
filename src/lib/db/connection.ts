import { Pool } from "pg";

//Crée un Pool de connexions (réutilisables)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, //Nécessaire pour Neon
  },
});

//function helper pour exécuter des requêtes
export const db = {
  query: (text: string, params?: any[]) => pool.query(text, params),
};
