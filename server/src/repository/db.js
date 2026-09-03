/**
 * La connexion à la base. Un seul fichier SQLite, server/data/quizm9.db par
 * défaut ; la variable d'environnement DB_PATH permet de le placer ailleurs
 * (dans un conteneur, sur un volume : semaine 3).
 *
 * Le fichier n'est pas versionné : chacun a le sien, régénéré au besoin.
 * Pour repartir à neuf : arrêtez le serveur et supprimez le fichier.
 */
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dataDir = new URL('../../data/', import.meta.url);
const dbPath = process.env.DB_PATH ?? fileURLToPath(new URL('quizm9.db', dataDir));

mkdirSync(dirname(dbPath), { recursive: true });
export const db = new DatabaseSync(dbPath);

// Les lecteurs (le harnais, un autre processus) ne bloquent pas le serveur.
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

/** Crée les tables (schema.sql), puis les remplit (seed.sql) si la base est vide. */
export function initializeDatabase() {
  // console.warn('repository/db.js : initializeDatabase est À faire.');
  const schemaSQL = readFileSync(fileURLToPath(new URL('schema.sql', dataDir)), 'utf8');
  db.exec(schemaSQL);
  const quizCount = db.prepare('SELECT COUNT(*) AS count FROM quiz').get().count;
  if (quizCount === 0) {
    const seedSQL = readFileSync(fileURLToPath(new URL('seed.sql', dataDir)), 'utf8');
    db.exec(seedSQL);
  }
}

/**
 * Enveloppe des écritures qui doivent réussir ENSEMBLE. Si fn lève une
 * erreur, tout est annulé (ROLLBACK) ; sinon tout est confirmé (COMMIT).
 */
export function withTransaction(fn) {
  db.exec('BEGIN');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
}
