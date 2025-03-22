'use client'

import { setupMatch } from '@/app/actions/setup'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SetupMatch({ id }: { id: string }) {
  const [state, setState] = useState<
    'idle' | 'submitting' | 'success' | 'error'
  >('idle')
  const router = useRouter()
  return (
    <>
      <Button
        variant="outline"
        onClick={async () => {
          setState('submitting')
          try {
            await setupMatch(id)
            setState('success')
            await new Promise((resolve) => setTimeout(resolve, 3000))
            router.refresh()
          } catch (error) {
            setState('error')
          }
        }}
      >
        Setup
      </Button>
      {state === 'error' && <p className="text-red-500">Error</p>}
    </>
  )
}
