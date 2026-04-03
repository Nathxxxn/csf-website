export interface Member {
  name: string
  role: string
  photo: string | null
  linkedin: string | null
  bio?: string
  skills?: string[]
  email?: string
}

export interface PoleData {
  pole: string
  badge: string
  description: string
  members: Member[]
}

export interface Event {
  id: string
  title: string
  date: string
  partner: string
  pole: string
  description: string
  image: string | null
  images?: string[]
  status: 'upcoming' | 'past'
}

export interface Partner {
  name: string
  logo: string
}
