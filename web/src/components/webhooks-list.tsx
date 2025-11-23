import { useQueryClient, useSuspenseInfiniteQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { API_URL } from '../config'
import { useWebSocket } from '../hooks/use-websocket'
import { webhookListSchema } from '../http/schemas/webhooks'
import { WebhooksListItem } from './webhooks-list-item'

interface WebhooksListProps {
  endpointSlug?: string
}

export function WebhooksList({ endpointSlug }: WebhooksListProps = {}) {
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver>(null)
  const queryClient = useQueryClient()

  useWebSocket((message) => {
    if (message.type === 'new_webhook') {
      const newWebhook = message.webhook

      if (endpointSlug && newWebhook.endpointId) {
        // Invalidate query to fetch new data
        queryClient.invalidateQueries({ queryKey: ['webhooks'] })
        return
      }
      
      queryClient.invalidateQueries({ queryKey: ['webhooks'] })
    }
  })

  const { data, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery({
      queryKey: ['webhooks', endpointSlug],
      queryFn: async ({ pageParam }) => {
        const url = new URL(`${API_URL}/api/webhooks`)

        if (pageParam) {
          url.searchParams.set('cursor', pageParam)
        }

        if (endpointSlug) {
          url.searchParams.set('endpoint', endpointSlug)
        }

        const response = await fetch(url, { credentials: 'include' })
        const data = await response.json()

        return webhookListSchema.parse(data)
      },
      getNextPageParam: (lastPage) => {
        return lastPage.nextCursor ?? undefined
      },
      initialPageParam: undefined as string | undefined,
    })

  const webhooks = data.pages.flatMap((page) => page.webhooks)

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]

        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      {
        threshold: 0.1,
      },
    )

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  if (webhooks.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-sm text-zinc-400">Nenhum webhook recebido ainda.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="space-y-1 p-2">
        {webhooks.map((webhook) => {
          return <WebhooksListItem key={webhook.id} webhook={webhook} />
        })}
      </div>

      {hasNextPage && (
        <div className="p-2" ref={loadMoreRef}>
          {isFetchingNextPage && (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="size-5 animate-spin text-zinc-500" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
