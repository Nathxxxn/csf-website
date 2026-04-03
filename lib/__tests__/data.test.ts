import { describe, it, expect } from 'vitest'
import { getEvents, getEventById } from '../data'

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

describe('event images', () => {
  it('events have an images array', () => {
    const events = getEvents()
    expect(events.length).toBeGreaterThan(0)
    events.forEach(event => {
      expect(Array.isArray(event.images)).toBe(true)
      expect(event.images!.length).toBeGreaterThan(0)
    })
  })

  it('each image is a non-empty string', () => {
    const events = getEvents()
    events.forEach(event => {
      event.images!.forEach(img => {
        expect(typeof img).toBe('string')
        expect(img.length).toBeGreaterThan(0)
      })
    })
  })
})
