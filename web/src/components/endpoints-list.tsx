import { Loader2 } from 'lucide-react'
import { endpointListSchema } from '../http/schemas/endpoints'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { CopyButton } from './ui/copy-button'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { API_URL } from '../config'

export function EndpointsList() {
  const { data } = useSuspenseQuery({
    queryKey: ['endpoints'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/endpoints`)
      const data = await response.json()
      return endpointListSchema.parse(data)
    },
  })

  if (data.endpoints.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="text-center">
          <p className="text-sm text-zinc-400">Nenhum endpoint criado ainda.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="space-y-1 p-2">
        {data.endpoints.map((endpoint) => {
          return (
            <Link
              key={endpoint.id}
              to="/endpoints/$slug"
              params={{ slug: endpoint.slug }}
              className="group block rounded-lg transition-colors duration-150 hover:bg-zinc-700/30"
            >
              <div className="flex items-start gap-3 px-4 py-2.5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="truncate text-xs font-mono text-zinc-200 leading-tight">
                      {endpoint.slug}
                    </p>
                    <CopyButton size="sm" value={endpoint.url} />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <span>
                      {endpoint.webhookCount || 0} webhook
                      {endpoint.webhookCount !== 1 ? 's' : ''}
                    </span>
                    <span>•</span>
                    <span>
                      {formatDistanceToNow(endpoint.createdAt, {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
