import { bookingsApi } from "@/api/bookings.api"
import { qk } from '@/lib/queryKeys'

export const bookingsByEmailQuery = (email: string) => ({
  queryKey: qk.bookingsByEmail(email),
  queryFn: () => bookingsApi.byEmail(email),
  enabled: !!email,
})
