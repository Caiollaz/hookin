import { createFileRoute } from '@tanstack/react-router'
import { EndpointDetails } from '../components/endpoint-details'

export const Route = createFileRoute('/endpoints/$slug')({
  component: RouteComponent,
})

function RouteComponent() {
  const { slug } = Route.useParams()

  return <EndpointDetails slug={slug} />
}
