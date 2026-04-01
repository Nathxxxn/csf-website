import { describe, it, expect } from 'vitest'
import { getTeam, getEvents, getPartners, getUpcomingEvents, getPastEvents } from '@/lib/data'

describe('getTeam', () => {
  it('returns an array of pole data', () => {
    const team = getTeam()
    expect(Array.isArray(team)).toBe(true)
    expect(team.length).toBeGreaterThan(0)
    expect(team[0]).toHaveProperty('pole')
    expect(team[0]).toHaveProperty('members')
    expect(Array.isArray(team[0].members)).toBe(true)
  })
})

describe('getEvents', () => {
  it('returns an array of events', () => {
    const events = getEvents()
    expect(Array.isArray(events)).toBe(true)
    expect(events.length).toBeGreaterThan(0)
    expect(events[0]).toHaveProperty('id')
    expect(events[0]).toHaveProperty('status')
  })

  it('returns events with valid status', () => {
    const events = getEvents()
    events.forEach(e => {
      expect(['upcoming', 'past']).toContain(e.status)
    })
  })
})

describe('getUpcomingEvents', () => {
  it('returns only upcoming events', () => {
    const events = getUpcomingEvents()
    events.forEach(e => expect(e.status).toBe('upcoming'))
  })

  it('returns upcoming events sorted ascending by date', () => {
    const events = getUpcomingEvents()
    for (let i = 1; i < events.length; i++) {
      expect(new Date(events[i].date).getTime())
        .toBeGreaterThanOrEqual(new Date(events[i - 1].date).getTime())
    }
  })
})

describe('getPastEvents', () => {
  it('returns only past events', () => {
    const events = getPastEvents()
    events.forEach(e => expect(e.status).toBe('past'))
  })

  it('returns past events sorted descending by date', () => {
    const events = getPastEvents()
    for (let i = 1; i < events.length; i++) {
      expect(new Date(events[i].date).getTime())
        .toBeLessThanOrEqual(new Date(events[i - 1].date).getTime())
    }
  })
})

describe('getPartners', () => {
  it('returns an array of partners', () => {
    const partners = getPartners()
    expect(Array.isArray(partners)).toBe(true)
    expect(partners.length).toBeGreaterThan(0)
    expect(partners[0]).toHaveProperty('name')
    expect(partners[0]).toHaveProperty('logo')
  })
})
