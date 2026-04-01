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
})

describe('getPastEvents', () => {
  it('returns only past events', () => {
    const events = getPastEvents()
    events.forEach(e => expect(e.status).toBe('past'))
  })
})

describe('getPartners', () => {
  it('returns an array of partners', () => {
    const partners = getPartners()
    expect(Array.isArray(partners)).toBe(true)
    expect(partners[0]).toHaveProperty('name')
    expect(partners[0]).toHaveProperty('logo')
  })
})
