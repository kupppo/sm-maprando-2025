import { redirect } from 'next/navigation'

export default function Home() {
  const slug = process.env.TOURNAMENT_SLUG
  const inertiaUrl = process.env.INERTIA_URL
  const tournamentUrl = new URL(`/tournaments/${slug}`, inertiaUrl)
  return redirect(tournamentUrl.toString())
}
