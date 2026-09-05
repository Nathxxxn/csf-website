import type { SiteContent } from './types'

/**
 * The text currently live on the site for every editable field. getSiteContent()
 * falls back to these when a key has never been saved, so the admin forms show
 * the real current copy instead of blank fields.
 */
export const SITE_CONTENT_DEFAULTS: SiteContent = {
  hero_title: 'La finance\nà CentraleSupélec',
  hero_subtitle: "Des rencontres avec des professionnels, des formats pour progresser et un réseau qui aide vraiment à comprendre les métiers de la finance.",
  stats_poles: '6',
  stats_membres: '20',
  stats_etudiants: '4000',
  stats_evenements: '20',
  partners_marquee_label: 'Des entreprises avec qui nous avons déjà travaillé',
  partners_cta_eyebrow: 'Partenariat',
  partners_cta_title: 'Monter un événement avec CS Finance.',
  partners_cta_body: 'Vous voulez organiser une conférence, un workshop ou une rencontre avec nos membres ? On prépare des formats simples, sérieux et utiles pour tout le monde.',
  partners_cta_primary_label: 'En discuter',
  partners_cta_secondary_label: 'Voir les partenaires',
  events_eyebrow: 'Agenda & Rétrospective',
  events_intro: 'Conférences, ateliers, visites, rencontres alumni. On essaie surtout de faire des formats utiles, avec des intervenants qui connaissent vraiment le terrain.',
  about_heading: "CentraleSupélec Finance, l'association qui fait le lien entre les élèves de CentraleSupélec et le monde de la finance.",
  about_intro: "Concrètement, nous organisons des rencontres avec des professionnels du secteur, des formations pour progresser techniquement et des échanges avec les alumni, pour donner aux élèves les clés pour comprendre la finance, s'y orienter et y construire leur réseau.",
  about_legal_address: '3 rue Joliot Curie, 91190 Gif-sur-Yvette',
  about_legal_rna: 'W913012869',
}
