'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { MagicCard } from '@/components/ui/magic-card'
import type { Member } from '@/lib/types'

interface MemberCardProps {
  member: Member
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0].toUpperCase())
    .join('')
}

export function MemberCard({ member }: MemberCardProps) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div>
          <MagicCard
            className="cursor-pointer rounded-xl border border-border bg-card p-4 text-center"
            gradientColor="#222222"
          >
            <Avatar className="size-14 mx-auto mb-3">
              {member.photo && <AvatarImage src={member.photo} alt={member.name} />}
              <AvatarFallback className="bg-secondary text-muted-foreground text-sm font-semibold">
                {getInitials(member.name)}
              </AvatarFallback>
            </Avatar>
            <p className="text-sm font-semibold leading-tight">{member.name}</p>
            <Badge variant="secondary" className="mt-2 text-xs">
              {member.role}
            </Badge>
          </MagicCard>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-64 bg-card border-border">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold">{member.name}</p>
          <p className="text-xs text-muted-foreground">{member.role}</p>
          {member.linkedin && (
            <a
              href={member.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-foreground underline underline-offset-4"
            >
              LinkedIn →
            </a>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
