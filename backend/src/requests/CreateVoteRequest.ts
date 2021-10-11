/**
 * Fields in a request to create a single TODO item.
 */
export interface CreateVoteRequest {
  voteName: string
  startDate: string
  endDate: string
  question: string
}
