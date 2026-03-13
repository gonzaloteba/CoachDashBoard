import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { ClientForm } from '@/components/clients/client-form'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditClientPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single()

  if (!client) notFound()

  return (
    <div>
      <Header title={`Editar: ${client.first_name} ${client.last_name}`} />
      <div className="p-6">
        <ClientForm client={client} />
      </div>
    </div>
  )
}
