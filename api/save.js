import { neon } from '@neondatabase/serverless';
import { createHash, timingSafeEqual } from 'node:crypto';

const KEY = /^[a-z0-9._-]{1,60}$/;
const MAX_LEN = 2000;
const MAX_KEYS = 100;

const sha = (s) => createHash('sha256').update(String(s)).digest();
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// Enregistrement protégé par mot de passe (variable d'environnement EDIT_PASSWORD).
// Corps : { changes: { "hero.2": "nouveau texte", "hero.3": "" } }  — "" = retour au texte d'origine.
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).end();

  const expected = process.env.EDIT_PASSWORD;
  if (!expected) return res.status(503).json({ error: "Mot de passe non configuré sur le serveur." });

  const given = (req.headers.authorization || '').replace(/^Bearer /, '');
  if (!timingSafeEqual(sha(given), sha(expected))) {
    await wait(800);
    return res.status(401).json({ error: 'Mot de passe incorrect.' });
  }

  const changes = req.body && req.body.changes;
  if (!changes || typeof changes !== 'object' || Array.isArray(changes)) {
    return res.status(400).json({ error: 'Requête invalide.' });
  }
  const entries = Object.entries(changes);
  if (entries.length > MAX_KEYS) return res.status(400).json({ error: 'Trop de champs.' });
  for (const [k, v] of entries) {
    if (!KEY.test(k) || typeof v !== 'string' || v.length > MAX_LEN) {
      return res.status(400).json({ error: `Champ invalide : ${k}` });
    }
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    for (const [k, v] of entries) {
      if (v.trim() === '') {
        await sql`delete from site_content where key = ${k}`;
      } else {
        await sql`insert into site_content (key, value) values (${k}, ${v})
                  on conflict (key) do update set value = excluded.value, updated_at = now()`;
      }
    }
    return res.status(200).json({ ok: true, saved: entries.length });
  } catch {
    return res.status(500).json({ error: "Échec de l'enregistrement." });
  }
}
