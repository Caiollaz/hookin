import { useQuery } from '@tanstack/react-query'
import { API_URL } from '../config'
import { endpointDetailSchema } from '../http/schemas/endpoints'
import { SectionDataTable } from './section-data-table'
import { SectionTitle } from './section-title'
import { CopyButton } from './ui/copy-button'
import { WebhooksList } from './webhooks-list'

interface EndpointDetailsProps {
  slug: string
}

export function EndpointDetails({ slug }: EndpointDetailsProps) {
  const {
    data: endpointData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['endpoint', slug],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/endpoints/${slug}`, {
        credentials: 'include',
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Endpoint não encontrado')
        }
        throw new Error('Erro ao carregar endpoint')
      }

      const data = await response.json()
      return endpointDetailSchema.parse(data)
    },
    retry: false,
  })

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-zinc-400">Carregando...</p>
      </div>
    )
  }

  if (error || !endpointData) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-zinc-200">
            Endpoint não encontrado
          </p>
          <p className="mt-2 text-sm text-zinc-400">
            O endpoint com slug "{slug}" não existe.
          </p>
        </div>
      </div>
    )
  }

  const overviewData = [
    { key: 'URL', value: endpointData.url },
    { key: 'Slug', value: endpointData.slug },
    { key: 'Total de Webhooks', value: String(endpointData.webhooks.length) },
    {
      key: 'Criado em',
      value: endpointData.createdAt.toLocaleString('pt-BR'),
    },
  ]

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-4 border-b border-zinc-700 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-100">
              {endpointData.slug}
            </h1>
            <p className="mt-1 text-sm text-zinc-400">Endpoint de webhook</p>
          </div>
          <CopyButton value={endpointData.url} />
        </div>

        <div className="flex items-center gap-1 rounded-lg bg-zinc-800 px-3 py-2 font-mono text-sm text-zinc-300">
          <span className="truncate">{endpointData.url}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6 p-4 md:p-6">
          <div className="space-y-4">
            <SectionTitle>Informações do Endpoint</SectionTitle>
            <SectionDataTable data={overviewData} />
          </div>

          <div className="space-y-4">
            <SectionTitle>Webhooks Recebidos</SectionTitle>
            <WebhooksList endpointSlug={slug} />
          </div>
        </div>
      </div>
    </div>
  )
}
