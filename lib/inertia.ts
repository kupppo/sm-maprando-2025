export default async function InertiaAPI(
  endpoint: string,
  { method = 'GET', payload = {} }: { method?: string; payload?: any },
) {
  const inertiaUrl = process.env.INERTIA_URL
  const inertiaToken = process.env.INERTIA_TOKEN
  const options: any = {
    method,
    headers: {
      authorization: `Bearer ${inertiaToken}`,
    },
  }
  if (method === 'POST' || method === 'PUT') {
    options.headers['Content-Type'] = 'application/json'
    options.body = JSON.stringify(payload)
  }
  const req = await fetch(`${inertiaUrl}/${endpoint}`, options)
  const data = await req.json()
  if (!req.ok) {
    console.log('ERRORS', data.errors)
  }
  return data
}

export async function getMatch(matchId: string, userId: string | null) {
  const tournamentSlug = process.env.TOURNAMENT_SLUG
  const match = await InertiaAPI(
    `/api/tournaments/${tournamentSlug}/matches/${matchId}`,
    {
      method: 'GET',
    },
  )
  if (!match) {
    throw new Error('Match not found')
  }

  return parseMatchData(match, userId)
}

export const parseMatchData = (match: any, userId: string | null) => {
  const statusMetafield = match.metafields.find((m: any) => m.key === 'status')
  const higherSeed =
    match.metafields.find((m: any) => m.key === 'higher_seed')?.value || null
  const firstPlayer =
    match.metafields.find((m: any) => m.key === 'player_1')?.value || null
  const isFirstPlayer = firstPlayer === userId || false
  const opponentId = match.racers.find((r: any) => r.id !== userId).id
  const lastActiveRace = match.races.filter((race: any) => race.status === 'SETTING_UP').at(-1)
  const currentRacetimeUrl = lastActiveRace?.externalUrl || null

  return {
    matchId: match.id,
    userId,
    status: statusMetafield.value,
    higherSeed,
    firstPlayer,
    isPlayer: userId !== null,
    isFirstPlayer,
    opponentId,
    player1Veto:
      match.metafields.find((m: any) => m.key === 'player_1_veto')?.value ||
      null,
    player2Veto:
      match.metafields.find((m: any) => m.key === 'player_2_veto')?.value ||
      null,
    player1Pick:
      match.metafields.find((m: any) => m.key === 'player_1_pick')?.value ||
      null,
    player2Pick:
      match.metafields.find((m: any) => m.key === 'player_2_pick')?.value ||
      null,
    game3Mode:
      match.metafields.find((m: any) => m.key === 'game_3_mode')?.value || null,
    racers: {
      [match.racers[0].id]: match.racers[0].user.name,
      [match.racers[1].id]: match.racers[1].user.name,
    },
    currentRacetimeUrl,
  }
}
