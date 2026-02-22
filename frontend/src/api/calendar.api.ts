import { apiClient } from "./client"
import { endpoints } from "./endpoints"

export type BusyResponse = { busy: string[] }
export type SlotsResponse = { times: string[] }

export const calendarApi = {
  busy: async (year: number, month: number): Promise<BusyResponse> => {
    const res = await apiClient.get<BusyResponse>(endpoints.calendarBusy(), {
      params: { year, month },
    })
    return res.data
  },

  slots: async (date: string): Promise<SlotsResponse> => {
    const res = await apiClient.get<SlotsResponse>(endpoints.calendarSlots(), {
      params: { date },
    })
    return res.data
  },
}
