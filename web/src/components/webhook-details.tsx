import { useQuery } from '@tanstack/react-query'
import { API_URL } from '../config'
import { webhookDetailsSchema } from '../http/schemas/webhooks'
import { SectionDataTable } from './section-data-table'
import { SectionTitle } from './section-title'
import { CodeBlock } from './ui/code-block'
import { WebhookDetailHeader } from './webhook-detail-header'

interface WebhookDetailsProps {
  id: string
}

export function WebhookDetails({ id }: WebhookDetailsProps) {
  const {
    data: webhookData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['webhook', id],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/webhooks/${id}`, {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Webhook não encontrado')
      }

      const data = await response.json()

      return webhookDetailsSchema.parse(data)
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

  if (error || !webhookData) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-zinc-200">
            Webhook não encontrado
          </p>
          <p className="mt-2 text-sm text-zinc-400">
            O webhook com id "{id}" não existe.
          </p>
        </div>
      </div>
    )
  }

  const overviewData = [
    { key: 'Method', value: webhookData.method },
    { key: 'Status Code', value: String(webhookData.statusCode) },
    {
      key: 'Content-Type',
      value: webhookData.contentType || 'application/json',
    },
    { key: 'Content-Length', value: `${webhookData.contentLength || 0} bytes` },
  ]

  const headers = Object.entries(webhookData.headers).map(([key, value]) => {
    return { key, value: String(value) }
  })

  const queryParams = Object.entries(webhookData.queryParams || {}).map(
    ([key, value]) => {
      return { key, value: String(value) }
    },
  )

  return (
    <div className="flex h-full flex-col">
      <WebhookDetailHeader
        method={webhookData.method}
        pathname={webhookData.pathname}
        ip={webhookData.ip}
        createdAt={webhookData.createdAt}
      />
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6 p-6">
          <div className="space-y-4">
            <SectionTitle>Request Overview</SectionTitle>
            <SectionDataTable data={overviewData} />
          </div>

          <div className="space-y-4">
            <SectionTitle>Headers</SectionTitle>
            <SectionDataTable data={headers} />
          </div>

          {queryParams.length > 0 && (
            <div className="space-y-4">
              <SectionTitle>Query Parameters</SectionTitle>
              <SectionDataTable data={queryParams} />
            </div>
          )}

          {!!webhookData.body && (
            <div className="space-y-4">
              <SectionTitle>Request Body</SectionTitle>
              <CodeBlock code={webhookData.body} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
