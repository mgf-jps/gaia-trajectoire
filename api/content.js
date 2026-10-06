import { neon } from '@neondatabase/serverless';

// Lecture publique des textes modifiés : { "hero.2": "…", … }
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  res.setHeader('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=60');
  try {
    const sql = neon(process.env.DATABASE_URL);
    const rows = await sql`select key, value from site_content`;
    const out = {};
    for (const r of rows) out[r.key] = r.value;
    return res.status(200).json(out);
  } catch {
    // Le site reste fonctionnel avec ses textes par défaut.
    return res.status(200).json({});
  }
}
