import { EndpointsList } from './endpoints-list'
import { Suspense } from 'react'
import { CreateEndpointButton } from './create-endpoint-button'

export function Sidebar() {
  return (
    <div className="flex h-screen flex-col">
      <div className="flex items-center justify-between border-b border-zinc-700 px-4 py-5">
        <div className="flex items-baseline">
          <span className="text-2xl font-semibold text-zinc-100">
            {'<'} Hook
          </span>
          <span className="text-2xl font-normal text-zinc-400">In {'/>'}</span>
        </div>
        <CreateEndpointButton />
      </div>

      <Suspense fallback={<p className="mt-4 text-center">Carregando...</p>}>
        <EndpointsList />
      </Suspense>
    </div>
  )
}
