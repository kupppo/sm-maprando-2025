import { getMatch } from '@/lib/inertia'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import InertiaAPI from '@/lib/inertia'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ matchId: string }> },
) {
  const { matchId } = await params
  const cookieStore = await cookies()
  const authCookie = cookieStore.get('inertia-auth')
  let userId = null
  if (authCookie) {
    const [authUserId, _token] = authCookie.value.split(':')
    const tournamentSlug = process.env.TOURNAMENT_SLUG
    const userReq = await InertiaAPI(
      `/api/tournaments/${tournamentSlug}/users/${authUserId}`,
      {
        method: 'GET',
      },
    )
    if (!userReq) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    userId = userReq.id
  }

  const matchData = await getMatch(matchId, userId)
  return NextResponse.json(matchData)
}
