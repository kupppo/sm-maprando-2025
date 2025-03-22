'use server'

import InertiaAPI from '@/lib/inertia'
import { inngest } from '@/inngest/client'

export const setFirstPlayer = async (playerId: string, matchId: string) => {
  const url = `/api/metafields`
  await InertiaAPI(url, {
    method: 'POST',
    payload: {
      model: 'match',
      modelId: matchId,
      key: 'player_1',
      value: playerId,
    },
  })
  await InertiaAPI(url, {
    method: 'PUT',
    payload: {
      model: 'match',
      modelId: matchId,
      key: 'status',
      value: 'PLAYER_1_VETO',
    },
  })
  return true
}

export const setVetoMode = async (
  modeId: string,
  matchId: string,
  key: string,
) => {
  const newStatus = key === 'player_1_veto' ? 'PLAYER_2_VETO' : 'PLAYER_2_PICK'
  const url = `/api/metafields`
  await InertiaAPI(url, {
    method: 'POST',
    payload: {
      model: 'match',
      modelId: matchId,
      key,
      value: modeId,
    },
  })
  await InertiaAPI(url, {
    method: 'PUT',
    payload: {
      model: 'match',
      modelId: matchId,
      key: 'status',
      value: newStatus,
    },
  })
  return true
}

export const setRaceMode = async (
  modeId: string,
  matchId: string,
  key: string,
  racetimeUrl: string,
) => {
  const newStatus =
    key === 'player_2_pick' ? 'PLAYING_RACE_1' : 'PLAYING_RACE_2'
  const url = `/api/metafields`
  await InertiaAPI(url, {
    method: 'POST',
    payload: {
      model: 'match',
      modelId: matchId,
      key,
      value: modeId,
    },
  })
  await InertiaAPI(url, {
    method: 'PUT',
    payload: {
      model: 'match',
      modelId: matchId,
      key: 'status',
      value: newStatus,
    },
  })
  await inngest.send({
    name: 'race/mode.select',
    data: {
      mode: modeId,
      racetimeUrl: racetimeUrl,
    },
  })
  return true
}

export const setHigherSeed = async (playerId: string, matchId: string) => {
  const url = `/api/metafields`
  try {
    await InertiaAPI(url, {
      method: 'POST',
      payload: {
        model: 'match',
        modelId: matchId,
        key: 'higher_seed',
        value: playerId,
      },
    })
  } catch (err) {
    await InertiaAPI(url, {
      method: 'PUT',
      payload: {
        model: 'match',
        modelId: matchId,
        key: 'higher_seed',
        value: playerId,
      },
    })
  }
  await InertiaAPI(url, {
    method: 'PUT',
    payload: {
      model: 'match',
      modelId: matchId,
      key: 'status',
      value: 'AWAITING_PLAYER_ASSIGNMENT',
    },
  })
  return true
}
