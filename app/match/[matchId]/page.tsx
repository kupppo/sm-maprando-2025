import { notFound } from 'next/navigation'
import RealtimeUpdates from './realtime'
import { cookies } from 'next/headers'
import InertiaAPI, { parseMatchData } from '@/lib/inertia'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function MatchPage({
  params,
}: {
  params: Promise<{ matchId: string }>
}) {
  const { matchId } = await params

  const isPlayer = false

  const tournamentSlug = process.env.TOURNAMENT_SLUG
  const match = await InertiaAPI(
    `/api/tournaments/${tournamentSlug}/matches/${matchId}`,
    {
      method: 'GET',
    },
  )

  if (!match) {
    return notFound()
  }

  // check auth
  const cookieStore = await cookies()
  const authCookie = cookieStore.get('inertia-auth')

  let userId = null
  let userName = null
  if (authCookie) {
    const [authUserId, _token] = authCookie.value.split(':')
    const userReq = await InertiaAPI(
      `/api/tournaments/${tournamentSlug}/users/${authUserId}`,
      {
        method: 'GET',
      },
    )
    if (!userReq) {
      return notFound()
    }
    userId = userReq.id
    userName = userReq.name
  }

  const initialData = parseMatchData(match, userId)
  const returnUrl = `/match/${matchId}`
  const loginUrl = `/login?returnTo=${returnUrl}`

  return (
    <div className="flex flex-col items-center justify-center min-h-screen relative">
      <Card className="w-full mx-4 md:mx-0 md:w-1/2 max-w-[480px]">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-center">
            <h1>{match.races[0].name}</h1>
          </CardTitle>
        </CardHeader>
        <RealtimeUpdates {...initialData} />
      </Card>
      {!authCookie ? (
        <div className="text-center w-full h-0 overflow-visible relative top-4">
          <Button asChild variant="ghost" size="sm" className="text-primary/40">
            <Link href={loginUrl} prefetch={false}>
              Login
            </Link>
          </Button>
        </div>
      ) : (
        <div className="text-center w-full h-0 overflow-visible relative top-4 text-foreground/60 text-xs">
          <Link
            href={loginUrl}
            prefetch={false}
            className="underline underline-offset-4 text-foreground/40 hover:text-foreground transition-colors"
          >
            Logged in as {userName}
          </Link>
        </div>
      )}
    </div>
  )
}
