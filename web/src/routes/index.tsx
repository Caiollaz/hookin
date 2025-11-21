import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { endpointListSchema } from '../http/schemas/endpoints'
import { useEffect } from 'react'
import { API_URL, type Session } from '../config'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  const navigate = useNavigate()

  const { data: session } = useSuspenseQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/init`, {
        credentials: 'include',
      })
      const data = await response.json()
      return data as Session
    },
  })

  const { data: endpointsData } = useSuspenseQuery({
    queryKey: ['endpoints', session.slugData.slug],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/endpoints`, {
        credentials: 'include',
      })
      const data = await response.json()
      return endpointListSchema.parse(data)
    },
  })

  useEffect(() => {
    if (endpointsData.endpoints.length > 0) {
      navigate({
        to: '/endpoints/$slug',
        params: { slug: endpointsData.endpoints[0].slug },
      })
    }
  }, [endpointsData.endpoints, navigate])

  if (endpointsData.endpoints.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
          <h3 className="text-lg font-semibold text-zinc-200">
            Bem-vindo ao HookIn
          </h3>
          <p className="text-md text-zinc-400 max-w-md">
            Crie seu primeiro endpoint de webhook para começar a receber e
            inspecionar requisições.
          </p>
          <p className="text-sm text-zinc-500 max-w-md">
            Use o botão + na barra lateral para criar um novo endpoint.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
        <p className="text-sm text-zinc-400">Redirecionando...</p>
      </div>
    </div>
  )
}
