import type { PoleData, Event, Partner } from './types'
import teamData from '@/data/team.json'
import eventsData from '@/data/events.json'
import partnersData from '@/data/partners.json'

export function getTeam(): PoleData[] {
  return teamData as PoleData[]
}

export function getEvents(): Event[] {
  return eventsData as Event[]
}

export function getUpcomingEvents(): Event[] {
  return getEvents()
    .filter(e => e.status === 'upcoming')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

export function getPastEvents(): Event[] {
  return getEvents()
    .filter(e => e.status === 'past')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getPartners(): Partner[] {
  return partnersData as Partner[]
}
