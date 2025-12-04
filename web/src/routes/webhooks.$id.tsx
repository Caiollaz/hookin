import { createFileRoute } from '@tanstack/react-router'
import { WebhookDetails } from '../components/webhook-details'

export const Route = createFileRoute('/webhooks/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()

  return <WebhookDetails id={id} />
}
