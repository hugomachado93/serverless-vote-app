export interface VoteItem {
    userId: string
    voteId: string
    createdAt: string
    voteName: string
    startDate: string
    endDate: string
    question: string
    voteYesCount: number
    voteNoCount: number
    done: boolean
}