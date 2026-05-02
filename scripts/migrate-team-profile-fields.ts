import { createClient } from '@libsql/client'

const url = process.env.TURSO_DATABASE_URL
if (!url) throw new Error('TURSO_DATABASE_URL is not set')

const db = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN })

const columns: Array<{ name: string; definition: string }> = [
  { name: 'tagline', definition: 'TEXT' },
  { name: 'bio', definition: 'TEXT' },
  { name: 'promo', definition: 'TEXT' },
  { name: 'joined_year', definition: 'TEXT' },
  { name: 'contributions', definition: 'INTEGER' },
  { name: 'skills', definition: "TEXT NOT NULL DEFAULT '[]'" },
  { name: 'email', definition: 'TEXT' },
]

async function migrate() {
  const { rows } = await db.execute('PRAGMA table_info(team_members)')
  const existing = new Set(rows.map((row) => String(row.name)))

  for (const column of columns) {
    if (existing.has(column.name)) continue
    await db.execute(`ALTER TABLE team_members ADD COLUMN ${column.name} ${column.definition}`)
    console.log(`Added team_members.${column.name}`)
  }

  console.log('Team profile fields migration complete')
}

migrate().catch((error) => {
  console.error(error)
  process.exit(1)
})
