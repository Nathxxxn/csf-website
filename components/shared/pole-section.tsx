import { AvatarCircles } from '@/components/ui/avatar-circles'
import { BlurFade } from '@/components/ui/blur-fade'
import { MemberCard } from './member-card'
import type { PoleData } from '@/lib/types'

interface PoleSectionProps {
  pole: PoleData
  index: number
}

export function PoleSection({ pole, index }: PoleSectionProps) {
  const avatarUrls = pole.members.map(m => ({
    imageUrl: m.photo ?? '',
    profileUrl: m.linkedin ?? '#',
  }))

  return (
    <BlurFade delay={index * 0.1} inView>
      <div className="mb-16 last:mb-0">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-8 pb-6 border-b border-border">
          <div className="flex flex-col gap-2">
            <span className="text-xs tracking-widest uppercase text-muted-foreground">
              {pole.badge}
            </span>
            <h3 className="text-2xl font-bold tracking-tight">{pole.pole}</h3>
            <AvatarCircles
              numPeople={0}
              avatarUrls={avatarUrls}
              className="mt-1"
            />
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
            {pole.description}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {pole.members.map((member, i) => (
            <BlurFade key={member.name} delay={index * 0.1 + i * 0.05} inView>
              <MemberCard member={member} />
            </BlurFade>
          ))}
        </div>
      </div>
    </BlurFade>
  )
}
