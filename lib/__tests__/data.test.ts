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
  it('events have a non-empty images array', () => {
    const events = getEvents()
    expect(events.length).toBeGreaterThan(0)
    for (const event of events) {
      expect(event.images, `event ${event.id} should have images`).toBeDefined()
      expect(event.images.length, `event ${event.id} images should be non-empty`).toBeGreaterThan(0)
    }
  })

  it('each image is a non-empty string', () => {
    const events = getEvents()
    for (const event of events) {
      for (const img of event.images) {
        expect(typeof img).toBe('string')
        expect(img.length).toBeGreaterThan(0)
      }
    }
  })
})
