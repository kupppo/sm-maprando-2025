'use client'

import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from '@/components/ui/select'
import { setHigherSeed } from '@/app/actions/match'

export default function EditSeedForm({ matchId, name, racers }: any) {
  const handleSubmit = async (value: string) => {
    await setHigherSeed(value, matchId)
  }
  return (
    <div>
      <Select onValueChange={handleSubmit}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={name || <>&mdash;</>} />
        </SelectTrigger>
        <SelectContent>
          {racers.map((racer: any) => (
            <SelectItem key={racer.id} value={racer.id}>
              {racer.user.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
