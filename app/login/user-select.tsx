'use client'

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { LoaderCircle } from 'lucide-react'
import { AnimatedNamePill } from '../setup/username'
import { cn } from '@/lib/utils'
import { sendLoginLink } from '../actions/setup'
import { useSearchParams } from 'next/navigation'

export default function UserSelect({ users = [] }: { users: any[] }) {
  const searchParams = useSearchParams()
  const returnTo = searchParams.get('returnTo')
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [state, setState] = useState<
    'idle' | 'submitting' | 'success' | 'error'
  >('idle')
  const handleSubmit = async (userId: string) => {
    setState('submitting')
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      const req = await sendLoginLink(userId, returnTo)
      console.log(req)
      setState('success')
    } catch (error) {
      setState('error')
    }
  }

  if (selectedUser) {
    const userData = users.find((user) => user.id === selectedUser)
    const isDisabled = state !== 'idle' && state !== 'error'

    return (
      <div className="min-h-[350px]">
        <h1 className="text-2xl mb-8">Send Login Link</h1>
        <div className="flex flex-col gap-y-8">
          <div className="flex flex-col">
            <div className="w-auto mx-auto">
              <AnimatedNamePill name={userData.name} />
            </div>
            <div className={cn('w-auto mx-auto', isDisabled && 'invisible')}>
              <Button
                variant="ghost"
                className="leading-none opacity-40"
                size="sm"
                onClick={() => setSelectedUser(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
          <div>
            <Button
              disabled={isDisabled}
              onClick={() => handleSubmit(selectedUser)}
            >
              <span>
                {(state === 'idle' || state === 'error') && 'Send login link'}
                {state === 'submitting' && (
                  <div className="relative">
                    <span className="invisible">Send login link</span>
                    <div className="w-full h-full flex absolute top-0 left-0 justify-center">
                      <LoaderCircle className="animate-spin w-2 h-2" />
                    </div>
                  </div>
                )}
                {state === 'success' && 'Login link sent'}
              </span>
            </Button>
            <p className="mt-8 text-sm text-center max-w-[300px] mx-auto">
              {state === 'idle' && (
                <>
                  This will send a DM to you from{' '}
                  <span className="font-semibold">Inertia</span> on Discord with
                  a link to login.
                </>
              )}
              {state === 'submitting' && <>Sending login link...</>}
              {state === 'success' && (
                <>Please check your DMs for the login link sent.</>
              )}
            </p>
            {state === 'error' && (
              <p className="mt-8 text-sm text-center max-w-[300px] mx-auto text-red-700">
                An error occured. Please try again.
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[350px] flex flex-col">
      <h1 className="text-2xl mb-4">Send Login Link</h1>
      <Command
        className="rounded-lg border shadow-md md:min-w-[450px] outline-none"
        filter={(
          _value: string,
          search: string,
          keywords: string[] | undefined,
        ) => {
          if (!keywords) return 0
          const extendValue = keywords.join(' ')
          if (extendValue.includes(search)) return 1
          return 0
        }}
      >
        <CommandInput placeholder="Enter your Discord username..." autoFocus />
        <CommandList>
          <CommandEmpty>No user found.</CommandEmpty>
          <CommandGroup>
            {users.map((user) => (
              <CommandItem
                key={user.id}
                value={user.id}
                keywords={[user.name]}
                onSelect={() => {
                  setSelectedUser(user.id)
                }}
              >
                {user.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  )
}
