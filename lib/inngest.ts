import { inngest } from '@/inngest/client'

export const send = (event: any) => inngest.send(event)
