import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import Confirmation from './confirm'
import { AnimatedNamePill } from './username'

export default async function RunnerSetup() {
  const cookieStore = await cookies()
  const auth = cookieStore.get('inertia-auth')
  if (!auth) {
    return notFound()
  }

  const [userId, token] = auth.value.split(':')

  const inertiaUrl = process.env.INERTIA_URL
  const tournamentSlug = process.env.TOURNAMENT_SLUG
  const inertiaToken = process.env.INERTIA_TOKEN
  const userReq = await fetch(
    `${inertiaUrl}/api/tournaments/${tournamentSlug}/users/${userId}`,
    {
      headers: {
        Authorization: `Bearer ${inertiaToken}`,
      },
    },
  )

  if (!userReq) {
    return notFound()
  }

  const user = await userReq.json()
  const authMetafield = user.metafields.find(
    (metafield: any) => metafield.key === 'authToken',
  )
  if (!authMetafield || authMetafield.value !== token) {
    return notFound()
  }

  const confirmedMetafield = user.metafields.find(
    (metafield: any) => metafield.key === 'participation',
  )
  const alreadyConfirmed = confirmedMetafield?.value === 'confirmed'

  return (
    <div className="min-h-screen flex flex-col justify-center items-center w-full md:w-1/2 max-w-[500px] mx-auto px-4 text-center gap-y-8">
      <div>
        <h1 className="text-4xl leading-none">SM Multi-Cat 2024</h1>
        <div className="mt-4">
          <AnimatedNamePill name={user.name} />
        </div>
      </div>
      <Confirmation id={user.id} confirmed={alreadyConfirmed} />
    </div>
  )
}
