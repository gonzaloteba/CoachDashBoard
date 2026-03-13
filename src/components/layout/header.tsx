'use client'

import { Bell } from 'lucide-react'
import Link from 'next/link'

interface HeaderProps {
  title: string
  alertCount?: number
}

export function Header({ title, alertCount = 0 }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <h2 className="text-lg font-semibold">{title}</h2>

      <Link
        href="/dashboard/alerts"
        className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Bell className="h-5 w-5" />
        {alertCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-medium text-white">
            {alertCount > 99 ? '99+' : alertCount}
          </span>
        )}
      </Link>
    </header>
  )
}
