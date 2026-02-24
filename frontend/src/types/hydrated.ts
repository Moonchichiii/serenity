import type {
  WagtailHomePage,
  WagtailService,
  GlobalSettings,
} from '@/types/api/cms'

export interface HydratedPayload {
  page: WagtailHomePage
  services: WagtailService[]
  globals: GlobalSettings
}
