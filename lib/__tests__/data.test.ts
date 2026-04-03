import { describe, it, expect } from 'vitest'
import { getEventById } from '../data'

describe('getEventById', () => {
  it('returns the event with matching id', () => {
    const event = getEventById('mock-trading-bnp-2025-04')
    expect(event).toBeDefined()
    expect(event?.title).toBe('Mock Trading Session')
  })

  it('returns undefined for unknown id', () => {
    expect(getEventById('does-not-exist')).toBeUndefined()
  })
})
