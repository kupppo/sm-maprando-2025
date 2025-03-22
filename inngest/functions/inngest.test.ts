import { InngestTestEngine } from '@inngest/test'
import { handleRaceStart } from '.'
import InertiaAPI from '@/lib/inertia'
import { send as InngestSend } from '@/lib/inngest'
import { NonRetriableError } from 'inngest'
import exp from 'constants'

jest.mock('@/lib/inertia', () => {
  return {
    __esModule: true,
    default: jest.fn(),
  }
})

jest.mock('@/lib/inngest', () => {
  return {
    __esModule: true,
    send: jest.fn(),
  }
})

type MatchOpts = {
  matchStatus?: string
}

const mockIntertiaMatchFactory = ({
  matchStatus = 'AWAITING_PLAYER_ASSIGNMENT',
}: MatchOpts) => ({
  id: '1',
  racesToSchedule: 3,
  parentId: null,
  roundId: '1',
  status: 'COMPLETED',
  publishedAt: '2024-11-18T21:30:35.246Z',
  firstPublishedAt: '2024-11-18T21:30:35.246Z',
  discordThreadId: null,
  createdAt: '2024-11-18T21:30:28.236Z',
  updatedAt: '2024-11-27T17:14:16.337Z',
  races: [
    {
      id: '1',
      name: 'player1 vs player2',
      matchId: '1',
      status: 'PENDING',
      scheduledAt: null,
      seedAt: null,
      scheduleOnFinish: false,
      externalUrl: null,
      seedUrl: null,
      ordering: 0,
      parentId: null,
      sgRaceId: null,
      createdAt: '2024-11-18T21:30:35.846Z',
      updatedAt: '2024-11-28T12:08:49.552Z',
    },
    {
      id: '2',
      name: 'player1 vs player2',
      matchId: '1',
      status: 'PENDING',
      scheduledAt: null,
      seedAt: null,
      scheduleOnFinish: true,
      externalUrl: null,
      seedUrl: null,
      ordering: 1,
      parentId: null,
      sgRaceId: null,
      createdAt: '2024-11-18T21:30:35.846Z',
      updatedAt: '2024-11-27T17:15:32.965Z',
    },
    {
      id: '3',
      name: 'player1 vs player2',
      matchId: '1',
      status: 'PENDING',
      scheduledAt: null,
      seedAt: null,
      scheduleOnFinish: true,
      externalUrl: null,
      seedUrl: null,
      ordering: 2,
      parentId: null,
      sgRaceId: null,
      createdAt: '2024-11-18T21:30:35.846Z',
      updatedAt: '2024-11-27T17:16:30.253Z',
    },
  ],
  racers: [
    {
      id: '1',
      userId: '1',
      createdAt: '2024-11-18T14:13:13.753Z',
      updatedAt: '2024-11-18T14:13:13.753Z',
    },
    {
      id: '2',
      userId: '2',
      createdAt: '2024-11-18T21:29:57.353Z',
      updatedAt: '2024-11-18T21:29:57.353Z',
    },
  ],
  metafields: [
    {
      id: '1',
      model: 'match',
      modelId: '1',
      key: 'higher_seed',
      value: '1',
      public: false,
      owner: 'api/1',
      createdAt: '2024-11-27T16:57:31.630Z',
      updatedAt: '2024-11-27T16:57:31.630Z',
    },
    {
      id: '2',
      model: 'match',
      modelId: '1',
      key: 'player_1',
      value: '1',
      public: false,
      owner: 'api/1',
      createdAt: '2024-12-01T16:13:59.583Z',
      updatedAt: '2024-12-01T16:13:59.583Z',
    },
    {
      id: '3',
      model: 'match',
      modelId: '1',
      key: 'player_1_veto',
      value: 'Low%',
      public: false,
      owner: 'api/1',
      createdAt: '2024-12-01T16:14:06.180Z',
      updatedAt: '2024-12-01T16:14:06.180Z',
    },
    {
      id: '4',
      model: 'match',
      modelId: '1',
      key: 'player_2_pick',
      value: 'Any%\r',
      public: false,
      owner: 'api/1',
      createdAt: '2024-12-01T16:14:35.584Z',
      updatedAt: '2024-12-01T16:14:35.584Z',
    },
    {
      id: '5',
      model: 'match',
      modelId: '1',
      key: 'player_2_veto',
      value: 'Max% GT Code',
      public: false,
      owner: 'api/1',
      createdAt: '2024-12-01T16:14:25.625Z',
      updatedAt: '2024-12-01T16:14:25.625Z',
    },
    {
      id: '6',
      model: 'match',
      modelId: '1',
      key: 'status',
      value: matchStatus,
      public: false,
      owner: 'api/1',
      createdAt: '2024-11-19T00:55:28.058Z',
      updatedAt: '2024-12-01T16:14:35.931Z',
    },
    {
      id: '7',
      model: 'match',
      modelId: '1',
      key: 'player_1_pick',
      value: 'GT Classic',
      public: false,
      owner: 'api/1',
      createdAt: '2024-12-01T16:14:35.584Z',
      updatedAt: '2024-12-01T16:14:35.584Z',
    },
  ],
})

describe('Inngest', () => {
  describe('Handle Race Start', () => {
    const mockInertiaCall = InertiaAPI as jest.MockedFunction<any>
    const mockInngestCall = InngestSend as jest.MockedFunction<any>

    beforeEach(() => {
      jest.spyOn(console, 'error').mockImplementation(jest.fn())
      jest.clearAllMocks()
    })

    const t = new InngestTestEngine({
      function: handleRaceStart,
    })

    test('Match not found', async () => {
      mockInertiaCall.mockResolvedValue(null)
      const { error } = await t.executeStep('get-match', {
        events: [
          {
            name: 'race/initiate',
            data: {
              matchId: '1',
              raceId: '1',
              racetimeUrl: 'http://racetime.localhost/sm/123',
            },
          },
        ],
      })
      const err = error as NonRetriableError
      expect(err.name).toEqual('NonRetriableError')
      expect(err.message).toEqual('Match not found')
    })

    describe('Determine race number', () => {
      test('First race', async () => {
        const match = mockIntertiaMatchFactory({})
        mockInertiaCall.mockResolvedValue(match)
        const { result } = await t.executeStep('determine-race-number', {
          events: [
            {
              name: 'race/initiate',
              data: {
                matchId: '1',
                raceId: '1',
                racetimeUrl: 'http://racetime.localhost/sm/123',
              },
            },
          ],
        })
        expect(result).toEqual(false)
      })
      test('Second race', async () => {
        const match = mockIntertiaMatchFactory({})
        mockInertiaCall.mockResolvedValue(match)
        const { result } = await t.executeStep('determine-race-number', {
          events: [
            {
              name: 'race/initiate',
              data: {
                matchId: '1',
                raceId: '2',
                racetimeUrl: 'http://racetime.localhost/sm/123',
              },
            },
          ],
        })
        expect(result).toEqual(false)
      })
      test('Last race', async () => {
        const match = mockIntertiaMatchFactory({})
        mockInertiaCall.mockResolvedValue(match)
        const { result } = await t.executeStep('determine-race-number', {
          events: [
            {
              name: 'race/initiate',
              data: {
                matchId: '1',
                raceId: '3',
                racetimeUrl: 'http://racetime.localhost/sm/123',
              },
            },
          ],
        })
        expect(result).toEqual(true)
      })
    })

    describe('Progress match', () => {
      test('Game 1', async () => {
        const match = mockIntertiaMatchFactory({
          matchStatus: 'AWAITING_PLAYER_ASSIGNMENT',
        })
        mockInertiaCall.mockImplementation((endpoint: string, options: any) => {
          if (options.method === 'GET') {
            return Promise.resolve(match)
          }
          if (options.method === 'PUT') {
            return Promise.resolve({ data: 'PUT response' })
          }
        })
        await t.executeStep('progress-match', {
          events: [
            {
              name: 'race/initiate',
              data: {
                matchId: '1',
                raceId: '1',
                racetimeUrl: 'http://racetime.localhost/sm/123',
              },
            },
          ],
        })
        expect(mockInertiaCall).not.toHaveBeenLastCalledWith(
          '/api/metafields',
          expect.objectContaining({ method: 'PUT' }),
        )
      })
      test('Game 2', async () => {
        const match = mockIntertiaMatchFactory({
          matchStatus: 'PLAYING_RACE_1',
        })
        mockInertiaCall.mockImplementation((endpoint: string, options: any) => {
          if (options.method === 'GET') {
            return Promise.resolve(match)
          }
          if (options.method === 'PUT') {
            return Promise.resolve({ data: 'PUT response' })
          }
        })
        await t.executeStep('progress-match', {
          events: [
            {
              name: 'race/initiate',
              data: {
                matchId: '1',
                raceId: '1',
                racetimeUrl: 'http://racetime.localhost/sm/123',
              },
            },
          ],
        })
        expect(mockInertiaCall).toHaveBeenLastCalledWith(
          '/api/metafields',
          expect.objectContaining({
            method: 'PUT',
            payload: {
              key: 'status',
              value: 'PLAYER_1_PICK',
              model: 'match',
              modelId: '1',
            },
          }),
        )
      })
    })

    describe('Set Final Match', () => {
      test('Final match', async () => {
        const match = mockIntertiaMatchFactory({
          matchStatus: 'PLAYING_RACE_2',
        })
        mockInngestCall.mockImplementation(() => null)
        mockInertiaCall.mockImplementation((endpoint: string, options: any) => {
          if (options.method === 'GET') {
            return Promise.resolve(match)
          }
          if (options.method === 'POST') {
            return Promise.resolve({ data: 'POST response' })
          }
          if (options.method === 'PUT') {
            return Promise.resolve({ data: 'PUT response' })
          }
        })
        const { result } = await t.executeStep('set-final-match', {
          events: [
            {
              name: 'race/initiate',
              data: {
                matchId: '1',
                raceId: '3',
                racetimeUrl: 'http://racetime.localhost/sm/123',
              },
            },
          ],
        })
        const selectedKeys = [
          'player_1_pick',
          'player_2_pick',
          'player_1_veto',
          'player_2_veto',
        ]
        const previousModes = match.metafields
          .filter((metafield: any) => selectedKeys.includes(metafield.key))
          .map((metafield: any) => metafield.value)

        expect(previousModes.includes(result)).toBeFalsy()

        expect(mockInertiaCall).toHaveBeenCalledWith(
          '/api/metafields',
          expect.objectContaining({
            method: 'POST',
            payload: expect.objectContaining({
              key: 'game_3_mode',
            }),
          }),
        )
        expect(mockInngestCall).toHaveBeenCalledWith({
          name: 'race/mode.select',
          data: expect.objectContaining({
            roomUrl: 'http://racetime.localhost/sm/123',
          }),
        })
        expect(mockInertiaCall).toHaveBeenLastCalledWith(
          '/api/metafields',
          expect.objectContaining({
            method: 'PUT',
            payload: expect.objectContaining({
              key: 'status',
              value: 'PLAYING_RACE_3',
              model: 'match',
            }),
          }),
        )
      })
    })
  })
})
