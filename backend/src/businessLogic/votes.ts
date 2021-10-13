import * as uuid from 'uuid'
import { CreateVoteRequest } from "../requests/CreateVoteRequest";
import { VoteItem } from "../models/VoteItem";
import { VotesAccess } from '../dataLayer/VotesAccess';
import { createLogger } from '../utils/logger';
import * as createHttpError from 'http-errors';
import { UpdateVoteRequest } from '../requests/UpdateVoteRequest';
import { UpdateVoteType } from '../models/UpdateVoteType';
import { VotesStorage } from '../dataLayer/VotesStorage';
import { UpdateVoteDoneRequest } from '../requests/UpdateVoteDoneRequest';
import { UpdateVote } from '../models/UpdateVote';
const logger = createLogger('votes')

const votesAccess = new VotesAccess();
const votesStorage = new VotesStorage();

export async function createVote(userId: string, createVote: CreateVoteRequest) {
    const voteId = uuid.v4();

    const newItem: VoteItem = {
        userId,
        voteId,
        createdAt: new Date().toISOString(),
        voteNoCount: 0,
        voteYesCount: 0,
        done: false,
        ...createVote
    }

    await votesAccess.createVote(newItem)

    return newItem;
}

export async function getAllVotes(userId: string): Promise<VoteItem[]> {

    return await votesAccess.getVotes(userId);

}

export async function updateVoteType(userId: string, voteId: string, updateVote: UpdateVoteRequest) {

    const item = await votesAccess.getVoteItemById(voteId, userId);

    logger.info(`vote recovered ${item}`)

    let voteUpdate: UpdateVoteType = {
        voteYesCount: item.voteYesCount,
        voteNoCount: item.voteNoCount,
    }

    if (!item) {
        logger.error('Item not found')
        throw createHttpError(404, 'Item not found')
    }

    if (item.userId !== userId) {
        logger.error(`User ${userId} does not have permission to update vote ${voteId}`)
        throw createHttpError(403, `User ${userId} unauthorized`)
    }

    if (updateVote.voteType == 'yes') {
        voteUpdate.voteYesCount++
    } else {
        voteUpdate.voteNoCount++
    }

    votesAccess.updateVoteTypeItemById(voteId, userId, voteUpdate)

}

export async function updateVote(userId: string, voteId: string, updateVote: UpdateVoteDoneRequest) {

    const item = await votesAccess.getVoteItemById(voteId, userId);

    logger.info(`vote recovered ${item}`)

    if (!item) {
        logger.error('Item not found')
        throw createHttpError(404, 'Item not found')
    }

    if (item.userId !== userId) {
        logger.error(`User ${userId} does not have permission to update vote ${voteId}`)
        throw createHttpError(403, `User ${userId} unauthorized`)
    }

    votesAccess.updateVoteItemById(voteId, userId, updateVote as UpdateVote)

}

export async function deleteVote(userId: string, voteId: string) {

    const item = await votesAccess.getVoteItemById(voteId, userId);

    logger.info(`vote recovered ${item}`)

    if (!item) {
        logger.error('Item not found')
        throw createHttpError(404, 'Item not found')
    }

    if (item.userId !== userId) {
        logger.error(`User ${userId} does not have permission to update vote ${voteId}`)
        throw createHttpError(403, `User ${userId} unauthorized`)
    }

    votesAccess.deleteVoteItemById(voteId, userId)

}

export async function updateAttachmentUrl(userId: string, voteId: string, attachmentId: string) {
    logger.info(`Generating attachment URL for attachment ${attachmentId}`)
  
    const attachmentUrl = await votesStorage.getAttachmentUrl(attachmentId)
  
    logger.info(`Updating vote ${voteId} with attachment URL ${attachmentUrl}`, { userId, voteId })
  
    const item = await votesAccess.getVoteItemById(voteId, userId)
  
    if (!item){
      logger.error('Item not found')
      throw createHttpError(404, 'Item not found')
    }
  
    if (item.userId !== userId) {
      logger.error(`User ${userId} does not have permission to update vote ${voteId}`)
      throw createHttpError(403, `User ${userId} unauthorized`)
    }
  
    await votesAccess.updateAttachmentUrlById(userId, voteId, attachmentUrl)
  }

export async function generateUploadUrl(attachmentId: string): Promise<string> {
    logger.info(`upload URL ${attachmentId}`)

    const uploadUrl = await votesStorage.getUploadUrl(attachmentId)

    return uploadUrl
}