import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateRoutine } from '@/lib/routine-ai'
import { generatePlanPdf } from '@/lib/pdf-generator'
import { toTitleCase } from '@/lib/utils'
import { ApiKeyMissingError, AnthropicApiError } from '@/lib/transcript-ai'
import type { Client } from '@/lib/types'

export const maxDuration = 60

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    // Auth check
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Fetch client data
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single()

    if (clientError || !client) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    const typedClient = client as Client

    // Check that the client has audit data
    if (!typedClient.first_meal_time && !typedClient.wake_time) {
      return NextResponse.json(
        { error: 'El cliente no tiene datos de auditoría inicial. Debe completar el formulario primero.' },
        { status: 400 }
      )
    }

    // Generate routine with Claude
    const routine = await generateRoutine(typedClient)

    // Generate PDF with routine embedded in page 3
    const clientName = `${toTitleCase(typedClient.first_name)} ${toTitleCase(typedClient.last_name)}`
    const pdfBytes = await generatePlanPdf(clientName, routine)

    // Return PDF as downloadable file
    const fileName = `Plan Alimentacion - ${toTitleCase(typedClient.first_name)} ${toTitleCase(typedClient.last_name)}.pdf`
    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    })
  } catch (error) {
    if (error instanceof ApiKeyMissingError) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY no está configurada en Vercel. Ve a Vercel → Settings → Environment Variables y agrégala.' },
        { status: 500 }
      )
    }
    if (error instanceof AnthropicApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode || 500 }
      )
    }
    const message = error instanceof Error ? error.message : 'Error desconocido'
    console.error('Plan PDF generation error:', message)
    return NextResponse.json(
      { error: `Error al generar el PDF: ${message}` },
      { status: 500 }
    )
  }
}
