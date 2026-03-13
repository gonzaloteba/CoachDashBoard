import { Header } from '@/components/layout/header'

export default function SettingsPage() {
  return (
    <div>
      <Header title="Configuración" />
      <div className="p-6">
        <div className="max-w-2xl space-y-6">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="font-medium mb-4">Integraciones</h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">Typeform</p>
                  <p className="text-muted-foreground">
                    Webhook para recibir check-ins automáticamente
                  </p>
                </div>
                <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                  Configurado
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">TrainingPeaks</p>
                  <p className="text-muted-foreground">
                    Gestión manual de planes de entrenamiento
                  </p>
                </div>
                <span className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                  Manual
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="font-medium mb-4">Variables de Entorno Requeridas</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><code className="rounded bg-muted px-1.5 py-0.5">NEXT_PUBLIC_SUPABASE_URL</code> - URL de tu proyecto Supabase</p>
              <p><code className="rounded bg-muted px-1.5 py-0.5">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> - Clave anon de Supabase</p>
              <p><code className="rounded bg-muted px-1.5 py-0.5">SUPABASE_SERVICE_ROLE_KEY</code> - Clave service role para webhooks</p>
              <p><code className="rounded bg-muted px-1.5 py-0.5">TYPEFORM_WEBHOOK_SECRET</code> - Secret para validar webhooks de Typeform</p>
              <p><code className="rounded bg-muted px-1.5 py-0.5">CRON_SECRET</code> - Secret para proteger el cron job de alertas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
