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

describe('event detail data — current mock data', () => {
  // These tests verify the current mock data is complete.
  // partnerDescription, highlights, and photos are optional on the type
  // (upcoming events may not have them yet), but all current mock events do.
  it('all current events have a non-empty partnerDescription', () => {
    const events = getEvents()
    for (const event of events) {
      expect(event.partnerDescription, `${event.id} should have partnerDescription`).toBeTruthy()
    }
  })

  it('all current events have at least one highlight with title and description', () => {
    const events = getEvents()
    for (const event of events) {
      const highlights = event.highlights ?? []
      expect(highlights.length, `${event.id} should have highlights`).toBeGreaterThan(0)
      for (const h of highlights) {
        expect(h.title, `highlight title in ${event.id}`).toBeTruthy()
        expect(h.description, `highlight description in ${event.id}`).toBeTruthy()
      }
    }
  })

  it('all current events have at least one photo with src and caption', () => {
    const events = getEvents()
    for (const event of events) {
      const photos = event.photos ?? []
      expect(photos.length, `${event.id} should have photos`).toBeGreaterThan(0)
      for (const p of photos) {
        expect(p.src, `photo src in ${event.id}`).toBeTruthy()
        expect(p.caption, `photo caption in ${event.id}`).toBeTruthy()
      }
    }
  })
})
