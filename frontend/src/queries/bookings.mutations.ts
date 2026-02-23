import { mutationOptions } from '@tanstack/react-query'
import { bookingsApi, type BookingRequest, type VoucherBookingRequest } from '@/api/bookings.api'
import { normalizeHttpError, type ApiError } from '@/api/httpError'

export const createBookingMutationOptions = () =>
  mutationOptions({
    mutationKey: ['bookings', 'create'],
    mutationFn: async (payload: BookingRequest) => {
      try {
        return await bookingsApi.create(payload)
      } catch (e) {
        throw normalizeHttpError(e) as ApiError
      }
    },
  })

export const createVoucherBookingMutationOptions = () =>
  mutationOptions({
    mutationKey: ['bookings', 'createVoucher'],
    mutationFn: async (payload: VoucherBookingRequest) => {
      try {
        return await bookingsApi.createVoucher(payload)
      } catch (e) {
        throw normalizeHttpError(e) as ApiError
      }
    },
  })

export const cancelBookingMutationOptions = () =>
  mutationOptions({
    mutationKey: ['bookings', 'cancel'],
    mutationFn: async (confirmationCode: string) => {
      try {
        return await bookingsApi.cancel(confirmationCode)
      } catch (e) {
        throw normalizeHttpError(e) as ApiError
      }
    },
  })
