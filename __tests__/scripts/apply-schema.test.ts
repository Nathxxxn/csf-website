import { describe, expect, it } from 'vitest'

describe('apply-schema helpers', () => {
  it('splits SQL schema into executable statements and includes formations', async () => {
    const { splitSqlStatements } = await import('@/scripts/apply-schema')

    const statements = splitSqlStatements(`
      CREATE TABLE alpha (id TEXT);

      CREATE TABLE formations (
        id TEXT PRIMARY KEY
      );
    `)

    expect(statements).toEqual([
      'CREATE TABLE alpha (id TEXT)',
      'CREATE TABLE formations (\n        id TEXT PRIMARY KEY\n      )',
    ])
    expect(statements.some((statement) => statement.includes('CREATE TABLE formations'))).toBe(true)
  })
})
