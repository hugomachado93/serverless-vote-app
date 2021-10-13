/**
 * Fields in a request to create a single vote item.
 */
export interface CreateVoteRequest {
  voteName: string
  startDate: string
  endDate: string
  question: string
}
