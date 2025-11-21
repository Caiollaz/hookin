export const API_URL = import.meta.env.VITE_API_URL

export interface Session {
  slugData: {
    slug: string
    share_pin: string
    is_shared: boolean
    is_pending_delete: boolean
    created_at: string
    expires_at: string
  }
  role: 'owner' | 'guest'
  authData: {
    owner: string[]
    guest: string[]
  }
}
