export interface Vote {
  userId: string
  voteId: string
  createdAt: string
  voteName: string
  startDate: string
  endDate: string
  question: string
  done: boolean
  attachmentUrl?: string
  voteNoCount: string
  voteYesCount: string
}