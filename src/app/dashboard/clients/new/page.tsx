import { Header } from '@/components/layout/header'
import { ClientForm } from '@/components/clients/client-form'

export default function NewClientPage() {
  return (
    <div>
      <Header title="Nuevo Cliente" />
      <div className="p-6">
        <ClientForm />
      </div>
    </div>
  )
}
