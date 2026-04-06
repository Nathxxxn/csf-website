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

export interface EventHighlight {
  title: string
  description: string
}

export interface EventPhoto {
  src: string
  caption: string
}

export interface Event {
  id: string
  title: string
  date: string
  partner: string
  partnerDescription?: string
  pole: string
  description: string
  image: string | null
  images: string[]
  highlights?: EventHighlight[]
  photos?: EventPhoto[]
  status: 'upcoming' | 'past'
}

export interface Partner {
  name: string
  logo: string
}

// --- Types admin (avec IDs pour CRUD) ---

export interface AdminMember {
  id: string
  name: string
  role: string
  photo_url: string | null
  linkedin: string | null
  pole_id: string
  order_index: number
}

export interface AdminPole {
  id: string
  name: string
  badge: string
  description: string
  order_index: number
  members: AdminMember[]
}

export interface AdminHighlight {
  id: string
  event_id: string
  title: string
  description: string
  order_index: number
}

export interface AdminPhoto {
  id: string
  event_id: string
  url: string
  caption: string | null
  order_index: number
}

export interface AdminEvent {
  id: string
  title: string
  date: string
  partner: string
  partner_description: string | null
  pole: string | null
  description: string
  image_url: string | null
  status: 'upcoming' | 'past'
  order_index: number
  highlights: AdminHighlight[]
  photos: AdminPhoto[]
}

export interface AdminPartner {
  id: string
  name: string
  logo_url: string
  order_index: number
}

export interface SiteContent {
  hero_title: string
  hero_subtitle: string
  stats_poles: string
  stats_membres: string
  stats_evenements: string
  apropos_mission_title: string
  apropos_mission_text: string
}
