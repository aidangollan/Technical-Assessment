import { FilterType } from "./filter"

export interface TimelineItem {
  id: string
  filterType: FilterType
  startTime: number
  endTime: number
}