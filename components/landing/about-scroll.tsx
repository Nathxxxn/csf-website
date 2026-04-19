"use client";
import Image from "next/image";
import Link from "next/link";
import { ContainerTextScroll } from "@/components/ui/container-text-scroll";

export function AboutScroll() {
  return (
    <div className="flex flex-col overflow-hidden">
      <ContainerTextScroll
        titleComponent={
          <div className="flex flex-col items-center gap-4">
            <p className="text-sm font-semibold uppercase tracking-widest text-gray-400">
              Qui sommes-nous
            </p>
            <h2 className="text-4xl md:text-6xl font-bold leading-tight">
              Club de la Sorbonne
              <br />
              <span className="text-5xl md:text-[5.5rem] font-extrabold leading-none">
                Finance
              </span>
            </h2>
            <p className="max-w-md text-base md:text-lg text-gray-300 leading-relaxed">
              Former les futurs acteurs des marchés financiers à travers des
              événements, des formations et des rencontres avec les
              professionnels du secteur.
            </p>
            <Link
              href="/equipe"
              className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              Découvrir l&apos;équipe →
            </Link>
          </div>
        }
      >
        <Image
          src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1400&q=80"
          alt="Graphique boursier — Club de la Sorbonne Finance"
          height={720}
          width={1400}
          className="mx-auto rounded-2xl object-cover h-full object-center"
          draggable={false}
        />
      </ContainerTextScroll>
    </div>
  );
}
