"use client";
import Link from "next/link";
import { ContainerTextScroll } from "@/components/ui/container-text-scroll";
import TeamShowcase, { type TeamMember } from "@/components/ui/team-showcase";

export function TeamScrollCard({ members }: { members: TeamMember[] }) {
  return (
    <ContainerTextScroll>
      <div className="h-full w-full flex flex-col overflow-hidden">
        <div className="flex items-end justify-between px-6 md:px-10 pt-8 pb-4">
          <div>
            <p className="text-xs tracking-widest uppercase text-zinc-400 mb-2">
              L&apos;association
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              L&apos;équipe CS Finance
            </h2>
          </div>
          <Link
            href="/equipe"
            className="hidden sm:block text-sm text-zinc-400 border-b border-zinc-600 pb-0.5 hover:text-white transition-colors"
          >
            Voir toute l&apos;équipe →
          </Link>
        </div>

        <div className="flex-1 overflow-hidden">
          <TeamShowcase members={members} />
        </div>

        <div className="px-6 pb-6 sm:hidden">
          <Link
            href="/equipe"
            className="block text-center text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Voir toute l&apos;équipe →
          </Link>
        </div>
      </div>
    </ContainerTextScroll>
  );
}
