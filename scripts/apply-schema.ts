import { createClient, type Client } from '@libsql/client'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { pathToFileURL } from 'url'
import * as dotenv from 'dotenv'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })

export function splitSqlStatements(schemaSQL: string): string[] {
  return schemaSQL
    .split(';')
    .map((statement) => statement.trim())
    .filter(Boolean)
}

export async function applySchema(db: Pick<Client, 'execute'>, schemaSQL: string) {
  const statements = splitSqlStatements(schemaSQL)
  for (const statement of statements) {
    await db.execute(statement)
  }
  return statements.length
}

async function main() {
  const url = process.env.TURSO_DATABASE_URL
  if (!url) throw new Error('TURSO_DATABASE_URL is not set')

  const db = createClient({
    url,
    authToken: process.env.TURSO_AUTH_TOKEN,
  })

  const schemaSQL = readFileSync('./lib/schema.sql', 'utf-8')
  const count = await applySchema(db, schemaSQL)
  console.log(`Applied ${count} schema statement${count > 1 ? 's' : ''}.`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
