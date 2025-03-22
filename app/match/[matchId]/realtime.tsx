'use client'

import usePartySocket from 'partysocket/react'
import { PARTYKIT_HOST } from '@/app/env'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { MatchStates, RaceModes } from '@/app/config/tournament'
import { setFirstPlayer, setRaceMode, setVetoMode } from '@/app/actions/match'
import { toast } from 'sonner'
import useSWR from 'swr'
import { cn } from '@/lib/utils'
import { CardContent, CardFooter } from '@/components/ui/card'
import { LoadingDots } from '@/components/loading-dots'

const Pending = () => <span className="italic text-foreground/20">-</span>

const PlayerAssignment = ({
  higherSeed,
  opponentId,
  userId,
  matchId,
}: {
  higherSeed: string | null
  opponentId: string
  userId: string
  matchId: string
}) => {
  const handleSubmit = async (playerId: string) => {
    const toastId = toast('Setting first player...')
    try {
      await setFirstPlayer(playerId, matchId)
      toast.success('First player set!', { id: toastId })
      const evt = new CustomEvent('live:update', {
        detail: { eventName: 'match:player_assigned', playerId },
      })
      document.dispatchEvent(evt)
    } catch (err: unknown) {
      const error = err as Error
      toast.error(error.message, { id: toastId })
    }
  }
  const isHigherSeed = higherSeed === userId || false
  return (
    <div className="w-full">
      {isHigherSeed ? (
        <div>
          <p className="text-center">
            You need to pick if to be player 1 or 2.
          </p>
          <div className="flex gap-2 justify-center mt-4">
            <Button onClick={() => handleSubmit(userId)}>Player 1</Button>
            <Button onClick={() => handleSubmit(opponentId)}>Player 2</Button>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <LoadingDots />
          <p className="mt-4">
            Waiting for the higher seed to pick player order
          </p>
        </div>
      )}
    </div>
  )
}

const AwaitingSeed = () => {
  return (
    <div className="w-full">
      <h3>Awaiting Seed</h3>
    </div>
  )
}

const disabledModes = (props: any) =>
  [
    props.player1Veto,
    props.player2Veto,
    props.player1Pick,
    props.player2Pick,
  ].filter(Boolean)

const PlayerVeto = (props: any) => {
  const { firstPlayer, status, userId } = props
  let picker = false
  if (status === 'PLAYER_1_VETO' && firstPlayer === userId) {
    picker = true
  } else if (status === 'PLAYER_2_VETO' && firstPlayer !== userId) {
    picker = true
  }

  const disabled = disabledModes(props)

  const handleSubmit = async (vetoValue: string) => {
    const toastId = toast('Setting veto...')
    try {
      const vetoKey = `player_${props.isFirstPlayer ? '1' : '2'}_veto`
      await setVetoMode(vetoValue, props.matchId, vetoKey)
      toast.success('Veto set', { id: toastId })
      const evt = new CustomEvent('live:update', {
        detail: { eventName: `match:${vetoKey}` },
      })
      document.dispatchEvent(evt)
    } catch (err: unknown) {
      const error = err as Error
      toast.error(error.message, { id: toastId })
    }
  }
  return (
    <div className="w-full">
      {picker ? (
        <>
          <p className="text-center w-full mb-4">Select a mode to veto</p>
          <ul className="grid grid-cols-2 gap-2">
            {RaceModes.map((mode) => (
              <li key={mode.slug} className="w-full">
                <Button
                  variant="default"
                  className={cn(
                    'w-full block',
                    disabled.includes(mode.slug) && 'line-through',
                  )}
                  onClick={() => handleSubmit(mode.slug)}
                  disabled={disabled.includes(mode.slug)}
                >
                  {mode.name}
                </Button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="w-full">
          <LoadingDots />
          <p className="text-center mt-4">
            Waiting for the other player to pick
          </p>
        </div>
      )}
    </div>
  )
}

const PlayerPick = (props: any) => {
  const { firstPlayer, status, userId } = props
  let picker = false
  if (status === 'PLAYER_1_PICK' && firstPlayer === userId) {
    picker = true
  } else if (status === 'PLAYER_2_PICK' && firstPlayer !== userId) {
    picker = true
  }

  const disabled = disabledModes(props)

  const handleSubmit = async (pickValue: string) => {
    const toastId = toast('Setting pick...')
    try {
      const pickKey = `player_${props.isFirstPlayer ? '1' : '2'}_pick`
      await setRaceMode(
        pickValue,
        props.matchId,
        pickKey,
        props.currentRacetimeUrl,
      )
      toast.success('Pick set', { id: toastId })
      const evt = new CustomEvent('live:update', {
        detail: { eventName: `match:${pickKey}` },
      })
      document.dispatchEvent(evt)
    } catch (err: unknown) {
      const error = err as Error
      toast.error(error.message, { id: toastId })
    }
  }
  return (
    <div className="w-full">
      {picker ? (
        <>
          <p className="text-center w-full mb-4">Select a mode to play</p>
          <ul className="grid grid-cols-2 gap-2">
            {RaceModes.map((mode) => (
              <li key={mode.slug} className="w-full">
                <Button
                  variant={disabled.includes(mode.slug) ? 'outline' : 'default'}
                  className={cn(
                    'w-full block',
                    disabled.includes(mode.slug) && 'line-through',
                  )}
                  onClick={() => handleSubmit(mode.slug)}
                  disabled={disabled.includes(mode.slug)}
                >
                  {mode.name}
                </Button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="w-full">
          <LoadingDots />
          <p className="text-center mt-4">
            Waiting for the other player to pick
          </p>
        </div>
      )}
    </div>
  )
}

const Race = (props: any) => {
  const raceNum = props.status.split('_')[2]
  return (
    <div className="w-full">
      {props.isPlayer && <LoadingDots />}
      <p className="text-center mt-4">
        <span className="font-semibold">
          Race #{raceNum} will begin shortly.
        </span>
        {props.isPlayer && (
          <>
            <br />
            You can now go back to the Racetime room.
          </>
        )}
      </p>
    </div>
  )
}

const getState = (status: string, props: any) => {
  switch (status) {
    case 'AWAITING_SEED':
      return <AwaitingSeed />
    case 'AWAITING_PLAYER_ASSIGNMENT':
      return <PlayerAssignment {...props} />
    case 'PLAYER_1_VETO':
    case 'PLAYER_2_VETO':
      return <PlayerVeto {...props} />
    case 'PLAYER_1_PICK':
    case 'PLAYER_2_PICK':
      return <PlayerPick {...props} />
    case 'PLAYING_RACE_1':
    case 'PLAYING_RACE_2':
      return <Race {...props} />
    case 'PLAYING_RACE_3':
      return null
    default:
      return <div>Unknown State: {status}</div>
  }
}

const getViewerState = (status: string, props: any) => {
  switch (status) {
    case 'AWAITING_SEED':
      return (
        <p className="text-center block w-full">
          Awaiting for the higher seed to be picked
        </p>
      )
    case 'AWAITING_PLAYER_ASSIGNMENT':
      const higherPlayer = props.racers[props.higherSeed]
      return (
        <p className="text-center block w-full">
          {higherPlayer} will select to be Player 1 or 2
        </p>
      )
    case 'PLAYER_1_VETO':
    case 'PLAYER_2_VETO':
      return (
        <p className="text-center block w-full">
          The players are now making their vetoes
        </p>
      )
    case 'PLAYER_1_PICK':
    case 'PLAYER_2_PICK':
      return (
        <p className="text-center block w-full">
          The players are now making their picks
        </p>
      )
    case 'PLAYING_RACE_1':
    case 'PLAYING_RACE_2':
      return <Race {...props} />
    case 'PLAYING_RACE_3':
      return null
  }
}

async function fetcher(key: string) {
  const res = await fetch(key)
  return res.json()
}

const getMode = (slug: string, placeholder?: string) => {
  try {
    const mode = RaceModes.find((mode) => mode.slug === slug)
    if (!mode) {
      if (placeholder) {
        return <span className="italic text-foreground/20">{placeholder}</span>
      }
      throw new Error('Mode not found')
    }
    return mode.name
  } catch (err) {
    return <Pending />
  }
}

const SummaryItem = ({
  label,
  value,
  active = false,
}: {
  label: string
  value: string | React.ReactNode
  active?: boolean
}) => (
  <li className="flex items-baseline px-0 md:px-4 rounded-full">
    <div
      className={cn(
        'w-1/2 text-xs font-mono uppercase',
        active ? 'text-foreground/80' : 'text-foreground/40',
      )}
    >
      {label}
    </div>
    <div className="w-full">{value}</div>
  </li>
)

export default function RealtimeUpdates({
  matchId,
  ...fallbackData
}: {
  matchId: string
}) {
  const { data, mutate } = useSWR(`/api/match/${matchId}`, fetcher, {
    fallbackData,
  })
  const socket = usePartySocket({
    host: PARTYKIT_HOST,
    room: matchId,
    onMessage(event) {
      console.log('msg received:', event.data)
      const refreshEvt = new CustomEvent('refresh:update')
      document.dispatchEvent(refreshEvt)
    },
  })

  useEffect(() => {
    function handleEvent(evt: Event) {
      const event = evt as CustomEvent
      console.log('live:update', event.detail)
      socket.send(JSON.stringify(event.detail))
    }
    function handleRefresh() {
      mutate()
    }
    document.addEventListener('live:update', handleEvent)
    document.addEventListener('refresh:update', handleRefresh)

    return () => {
      document.removeEventListener('live:update', handleEvent)
      document.removeEventListener('refresh:update', handleRefresh)
    }
  }, [mutate, socket])

  const status = MatchStates.find((state) => state.slug === data.status)
  if (!status) {
    return null
  }

  const firstPlayerName = data.racers[data.firstPlayer] || <Pending />
  const secondPlayer = Object.keys(data.racers).find(
    (id: string) => id !== data.firstPlayer && data.firstPlayer !== null,
  )
  const secondPlayerName = data.racers[secondPlayer!] || <Pending />
  const RenderedState = data.isPlayer
    ? getState(status.slug, data)
    : getViewerState(status.slug, data)

  return (
    <div>
      <CardContent>
        <ul className="flex flex-col gap-y-2">
          {data.higherSeed && (
            <SummaryItem
              label="Higher Seed"
              value={data.racers[data.higherSeed]}
            />
          )}
          <SummaryItem label="P1" value={firstPlayerName} />
          <SummaryItem label="P2" value={secondPlayerName} />
        </ul>
        <ul className="flex flex-col gap-y-2 border-foreground/10 border-t-[1px] mt-2 pt-2">
          <SummaryItem
            label="P1 Veto"
            value={getMode(data.player1Veto)}
            active={data.status === 'PLAYER_1_VETO'}
          />
          <SummaryItem
            label="P2 Veto"
            value={getMode(data.player2Veto)}
            active={data.status === 'PLAYER_2_VETO'}
          />
        </ul>
        <ul className="flex flex-col gap-y-2 border-foreground/10 border-t-[1px] mt-2 pt-2">
          <SummaryItem
            label="Game 1"
            value={getMode(
              data.player2Pick,
              `${secondPlayer ? secondPlayerName : 'P2'} Picks`,
            )}
            active={data.status === 'PLAYER_2_PICK'}
          />
          <SummaryItem
            label="Game 2"
            value={getMode(
              data.player1Pick,
              `${data.firstPlayer ? firstPlayerName : 'P1'} Picks`,
            )}
            active={data.status === 'PLAYER_1_PICK'}
          />
          <SummaryItem
            label="Game 3"
            value={getMode(data.game3Mode, 'Randomly Selected')}
          />
        </ul>
      </CardContent>
      <CardFooter>{RenderedState}</CardFooter>
    </div>
  )
}
