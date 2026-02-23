import { useMutation, useQuery } from '@tanstack/react-query'
import { bookingsByEmailQuery } from '@/queries/bookings.queries'
import {
  cancelBookingMutationOptions,
  createBookingMutationOptions,
  createVoucherBookingMutationOptions,
} from '@/queries/bookings.mutations'

export function useBookingsByEmail(email: string) {
  return useQuery(bookingsByEmailQuery(email))
}

export function useCreateBooking() {
  return useMutation(createBookingMutationOptions())
}

export function useCreateVoucherBooking() {
  return useMutation(createVoucherBookingMutationOptions())
}

export function useCancelBooking() {
  return useMutation(cancelBookingMutationOptions())
}
