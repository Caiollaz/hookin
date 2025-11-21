import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { createEndpointResponseSchema } from '../http/schemas/endpoints'
import { IconButton } from './ui/icon-button'
import { API_URL } from '../config'

export function CreateEndpointButton() {
  const queryClient = useQueryClient()

  const { mutate: createEndpoint, isPending } = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${API_URL}/api/endpoints`, {
        method: 'POST',
        credentials: 'include',
      })
      const data = await response.json()
      return createEndpointResponseSchema.parse(data)
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['endpoints'] })
      window.location.href = `/endpoints/${data.slug}`
    },
  })

  return (
    <IconButton
      icon={<Plus className="size-4 text-zinc-300 hover:cursor-pointer" />}
      onClick={() => createEndpoint()}
      disabled={isPending}
      className="shrink-0"
      title="Criar novo endpoint"
    />
  )
}
