import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('AboutPage', () => {
  it('does not expose the /a-propos route module', () => {
    expect(existsSync(join(process.cwd(), 'app/a-propos/page.tsx'))).toBe(false)
  })
})
