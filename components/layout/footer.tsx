import Image from 'next/image'
import Link from 'next/link'
import { Separator } from '@/components/ui/separator'

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="CSF Logo"
            width={22}
            height={22}
            className="mix-blend-screen opacity-50"
          />
          <span className="text-xs text-muted-foreground">
            CentraleSupélec Finance · 2026–2027
          </span>
        </div>
        <div className="flex items-center gap-6 text-xs text-muted-foreground">
          <Link
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            LinkedIn
          </Link>
          <Separator orientation="vertical" className="h-3" />
          <Link
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Instagram
          </Link>
          <Separator orientation="vertical" className="h-3" />
          <a
            href="mailto:contact@csf.fr"
            className="hover:text-foreground transition-colors"
          >
            contact@csf.fr
          </a>
        </div>
      </div>
    </footer>
  )
}
