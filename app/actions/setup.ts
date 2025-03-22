'use server'

import InertiaAPI from '@/lib/inertia'
import { PUBLIC_URL } from '@/app/env'
import { inngest } from '@/inngest/client'

export const confirmParticipation = async (id: string) => {
  const url = `/api/metafields`
  return InertiaAPI(url, {
    method: 'POST',
    payload: {
      model: 'userInTournament',
      modelId: id,
      key: 'participation',
      value: 'confirmed',
    },
  })
}

export const sendLoginLink = async (id: string, returnTo: string | null) => {
  const baseUrl = `/api/tournaments/${process.env.TOURNAMENT_SLUG}/users/${id}`
  const user = await InertiaAPI(baseUrl, {
    method: 'GET',
  })
  const authField = user.metafields.find(
    (metafield: any) => metafield.key === 'authToken',
  )
  if (!authField || !authField.value) {
    throw new Error('Auth token not found')
  }

  const loginLink = new URL(`${PUBLIC_URL}/auth/${id}/${authField.value}`)
  if (returnTo) {
    loginLink.searchParams.set('returnTo', returnTo)
  }
  const msg = `Here's your login link for the SM Multi-Cat 2024 tournament:\n${loginLink.toString()}`
  return InertiaAPI(`${baseUrl}/msg`, {
    method: 'POST',
    payload: {
      msg,
    },
  })
}

export const setupMatch = async (matchId: string) => {
  await inngest.send({
    name: 'race/scheduled',
    data: {
      matchId: matchId,
    },
  })
}
