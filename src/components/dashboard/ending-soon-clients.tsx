import { Clock } from 'lucide-react'
import Link from 'next/link'

interface EndingSoonClient {
  id: string
  first_name: string
  last_name: string
  end_date: string
  days_remaining: number
}

interface EndingSoonClientsProps {
  clients: EndingSoonClient[]
}

export function EndingSoonClients({ clients }: EndingSoonClientsProps) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-medium text-muted-foreground">
          Finalizan en menos de 30 días
        </h3>
      </div>
      <p className="mt-2 text-3xl font-bold tracking-tight">
        {clients.length}
      </p>
      {clients.length > 0 ? (
        <ul className="mt-4 max-h-[200px] space-y-2 overflow-y-auto">
          {clients.map((client) => (
            <li key={client.id}>
              <Link
                href={`/dashboard/clients/${client.id}`}
                className="flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
              >
                <span className="font-medium">
                  {client.first_name} {client.last_name}
                </span>
                <span className={`text-xs font-medium ${client.days_remaining <= 7 ? 'text-red-600' : 'text-amber-600'}`}>
                  {client.days_remaining} días
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          No hay clientes próximos a finalizar.
        </p>
      )}
    </div>
  )
}
