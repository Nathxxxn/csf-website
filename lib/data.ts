import type { PoleData, Event, Partner } from './types'
import teamRaw from '@/data/team.json'
import eventsRaw from '@/data/events.json'
import partnersRaw from '@/data/partners.json'

const teamData = teamRaw satisfies PoleData[]
const eventsData = eventsRaw satisfies Event[]
const partnersData = partnersRaw satisfies Partner[]

export function getTeam(): PoleData[] {
  return teamData
}

export function getEvents(): Event[] {
  return eventsData
}

export function getUpcomingEvents(): Event[] {
  return [...getEvents()]
    .filter(e => e.status === 'upcoming')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

export function getPastEvents(): Event[] {
  return [...getEvents()]
    .filter(e => e.status === 'past')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getPartners(): Partner[] {
  return partnersData
}
