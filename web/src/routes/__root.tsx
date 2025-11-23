import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Menu } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { Sidebar } from '../components/sidebar'
import { useMediaQuery } from '../hooks/use-media-query'

const queryClient = new QueryClient()

const RootLayout = () => {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    if (!isMobile) {
      setIsSidebarOpen(false)
    }
  }, [isMobile])

  return (
    <QueryClientProvider client={queryClient}>
      <div className="h-screen bg-zinc-900 text-zinc-100">
        {isMobile ? (
          <div className="flex h-full flex-col">
            <div className="flex items-center border-b border-zinc-800 bg-zinc-900 px-4 py-3">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="mr-3 rounded-md p-1 hover:bg-zinc-800"
              >
                <Menu className="size-6 text-zinc-400" />
              </button>
              <div className="flex items-baseline">
                <span className="text-lg font-semibold text-zinc-100">
                  {'<'} Hook
                </span>
                <span className="text-lg font-normal text-zinc-400">
                  In {'/>'}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              <Outlet />
            </div>

            {isSidebarOpen && (
              <div className="fixed inset-0 z-50 flex">
                <div
                  className="fixed inset-0 bg-black/80 backdrop-blur-sm"
                  onClick={() => setIsSidebarOpen(false)}
                />
                <div className="relative w-[80%] max-w-xs bg-zinc-900 shadow-xl">
                  <Sidebar />
                </div>
              </div>
            )}
          </div>
        ) : (
          <PanelGroup direction="horizontal">
            <Panel defaultSize={20} minSize={15} maxSize={25}>
              <Sidebar />
            </Panel>

            <PanelResizeHandle className="w-px bg-zinc-700 hover:bg-zinc-600 transition-colors duration-150" />

            <Panel defaultSize={80} minSize={60}>
              <Outlet />
            </Panel>
          </PanelGroup>
        )}
      </div>
    </QueryClientProvider>
  )
}

export const Route = createRootRoute({ component: RootLayout })
