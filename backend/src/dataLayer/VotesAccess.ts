import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { VoteItem } from '../models/VoteItem'
import { createLogger } from '../utils/logger'
import { UpdateVoteType } from '../models/UpdateVoteType'
import { UpdateVote } from '../models/UpdateVote'
const logger = createLogger('VotesAccess')

const XAWS = AWSXRay.captureAWS(AWS)


export class VotesAccess {

  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly votesTable = process.env.VOTES_TABLE,
    private readonly votesIndex = process.env.INDEX_NAME,
  ) { }


  async createVote(voteItem: VoteItem) {
    await this.docClient.put({
      TableName: this.votesTable,
      Item: voteItem,
    }).promise();
  }

  async getVotes(userId: string): Promise<VoteItem[]> {
    const result = await this.docClient.query({
      TableName: this.votesTable,
      IndexName: this.votesIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }).promise()

    const items = result.Items;

    return items as VoteItem[];
  }

  async getVoteItemById(voteId: string, userId: String): Promise<VoteItem> {
    logger.info(`Getting vote ${voteId} from ${this.votesTable}`)

    const result = await this.docClient.get({
      TableName: this.votesTable,
      Key: {
        voteId,
        userId
      }
    }).promise()

    const item = result.Item

    logger.info(`result ${item}`)

    return item as VoteItem
  }


  async updateVoteTypeItemById(voteId: string, userId: String, voteUpdate: UpdateVoteType) {
    logger.info(`Update vote item ${voteId}`)

    await this.docClient.update({
      TableName: this.votesTable,
      Key: {
        voteId,
        userId
      },
      UpdateExpression: 'set voteYesCount = :voteYesCount, voteNoCount = :voteNoCount',
      ExpressionAttributeValues: {
        ":voteYesCount": voteUpdate.voteYesCount,
        ":voteNoCount": voteUpdate.voteNoCount,
      }
    }).promise()
  }

  async updateVoteItemById(voteId: string, userId: String, voteUpdate: UpdateVote) {
    logger.info(`Update vote item ${voteId}`)

    await this.docClient.update({
      TableName: this.votesTable,
      Key: {
        voteId,
        userId
      },
      UpdateExpression: 'set done = :done',
      ExpressionAttributeValues: {
        ":done": voteUpdate.done,
      }
    }).promise()
  }

  async updateAttachmentUrlById(userId: String, voteId: string, attachmentUrl: string) {
    logger.info(`Updating attachment URL for vote ${voteId} in ${this.votesTable}`)

    await this.docClient.update({
      TableName: this.votesTable,
      Key: {
        voteId,
        userId
      },
      UpdateExpression: 'set attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ':attachmentUrl': attachmentUrl
      }
    }).promise()
  }

  async deleteVoteItemById(voteId: string, userId: String) {
    logger.info(`Deleting vote item ${voteId} from ${this.votesTable}`)

    await this.docClient.delete({
      TableName: this.votesTable,
      Key: {
        voteId,
        userId
      }
    }).promise()
  }
}