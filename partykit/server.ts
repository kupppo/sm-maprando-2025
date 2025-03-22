import type * as Party from 'partykit/server'

export default class Server implements Party.Server {
  constructor(readonly room: Party.Room) {}

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    // TODO: Send initial connection message
  }

  async onRequest() {
    return new Response(JSON.stringify({ msg: 'hello!' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  onMessage(message: string, sender: Party.Connection) {
    try {
      const payload = JSON.parse(message)
      console.log('payload', payload)
      this.room.broadcast(`${sender.id}: ${message}`)
    } catch (err: unknown) {
      console.error(err)
    }
  }
}

Server satisfies Party.Worker
