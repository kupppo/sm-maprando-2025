'use client'

import { useState, useEffect } from 'react'

interface AnimatedNamePillProps {
  name: string
}

export function AnimatedNamePill({ name }: AnimatedNamePillProps) {
  const [gradientPosition, setGradientPosition] = useState(0)

  useEffect(() => {
    const intervalId = setInterval(() => {
      setGradientPosition((prevPosition) => (prevPosition + 1) % 100)
    }, 50)

    return () => clearInterval(intervalId)
  }, [])

  return (
    <div className="relative inline-block overflow-hidden rounded-full p-[2px] bg-background">
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(90deg, 
            #496a78, #7196a1, #a0c0cc, #bddde5, #d6eef3, #e5f5f8, #f3fbfc, #f8fcfc, #d7e9c9, #c7d8a1, #aecf85, #97bc7e, #73a764, #5b8f58, #4d7b4a, #426440, #2f5235, #496a78)`,
          backgroundSize: '1800% 100%',
          backgroundPosition: `${gradientPosition}% 0`,
          transition: 'background-position 1s ease-in-out',
        }}
      />
      <div className="relative px-4 py-1 bg-background rounded-full bg-gradient-to-b from-transparent via-foreground/10 via-70% to-foreground/20">
        <span className="text-lg font-mono font-medium text-foreground">
          {name}
        </span>
      </div>
    </div>
  )
}
