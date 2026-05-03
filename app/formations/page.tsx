import { getFormations } from '@/lib/data'
import { FormationsArchive } from '@/components/formations/formations-archive'

export const metadata = {
  title: 'Formations — CentraleSupélec Finance',
  description: 'Archives des formations et supports publiés par CentraleSupélec Finance.',
}

export const dynamic = 'force-dynamic'

export default async function FormationsPage() {
  const formations = await getFormations()
  return <FormationsArchive formations={formations} />
}
