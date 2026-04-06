import Link from "next/link"

export function PartnershipCTA() {
  return (
    <div className="mt-24 px-6 max-w-3xl mx-auto pb-32 text-center">
      <p className="text-xs tracking-widest uppercase text-muted-foreground mb-4">
        Partenariats
      </p>
      <h2 className="text-3xl font-bold tracking-tighter mb-4">
        Un format à construire avec nous ?
      </h2>
      <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
        Si vous voulez venir parler d&apos;un métier, proposer un case study ou rencontrer nos membres, on peut en discuter simplement.
      </p>
      <Link
        href="/contact"
        className="inline-flex items-center gap-2 rounded-md bg-white text-black text-sm font-semibold px-6 py-3 transition-opacity hover:opacity-80"
      >
        Écrire à l&apos;équipe
      </Link>
    </div>
  )
}
