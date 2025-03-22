import { Webhook } from 'svix'
import { inngest } from '@/inngest/client'

const webhookSecret: string = process.env.SIGNING_SECRET!

export async function POST(req: Request) {
  const svix_id = req.headers.get('svix-id') ?? ''
  const svix_timestamp = req.headers.get('svix-timestamp') ?? ''
  const svix_signature = req.headers.get('svix-signature') ?? ''

  const body = await req.text()

  const sivx = new Webhook(webhookSecret)

  let msg: any

  try {
    msg = sivx.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    })
  } catch (err) {
    return new Response('Bad Request', { status: 400 })
  }

  switch (msg.event) {
    case 'race.setting_up':
      await inngest.send({
        name: 'race/initiate',
        data: {
          matchId: msg.match_id,
          racetimeUrl: msg.racetime_url,
          raceId: msg.race_id,
        },
      })
      break
    case 'race.scheduled':
      await inngest.send({
        name: 'race/scheduled',
        data: {
          matchId: msg.match_id,
        },
      })
      break
    default:
      throw Error(`Unknown event: ${msg.event}`)
  }

  return new Response('OK', { status: 200 })
}
