'use client'

import { LoadingDots } from '@/components/loading-dots'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { confirmParticipation } from '@/app/actions/setup'

export default function Confirmation({
  confirmed = false,
  id,
}: {
  confirmed: boolean
  id: string
}) {
  const [state, setState] = useState<
    'idle' | 'submitting' | 'success' | 'error'
  >(confirmed ? 'success' : 'idle')

  return (
    <div className="h-40 relative">
      <p className="mb-8">
        Thank you for joining the tournament.
        <br />
        {state === 'idle' &&
          'To confirm your participation, please click the link below.'}
        {state === 'submitting' && 'Confirming...'}
        {state === 'success' && (
          <>
            <span className="font-semibold">You are now confirmed</span>.<br />
            <br />
            You may now close this window.
          </>
        )}
        {state === 'error' && (
          <>
            <span className="font-semibold text-red-500">
              Failed to confirm participation.
            </span>{' '}
            Please try again.
          </>
        )}
      </p>
      <Button
        onClick={async () => {
          try {
            setState('submitting')
            await confirmParticipation(id)
            setState('success')
          } catch (err: unknown) {
            console.log(err)
            setState('error')
          }
        }}
        className={cn(
          'transition-all duration-300 ease-in-out',
          state !== 'idle' && state !== 'error' && 'opacity-0 -translate-y-4',
        )}
      >
        Confirm Participation
      </Button>
      <div
        className={cn(
          'absolute w-full mx-auto opacity-0 transition-all duration-300',
          (state === 'idle' || state === 'error') && 'translate-y-2',
          state === 'submitting' && 'opacity-100 -translate-y-4',
          state === 'success' && '-translate-y-8',
        )}
      >
        <LoadingDots />
      </div>
    </div>
  )
}
