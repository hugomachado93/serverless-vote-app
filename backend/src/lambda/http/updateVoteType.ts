import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { getUserId } from '../utils'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'
import { UpdateVoteRequest } from '../../requests/UpdateVoteRequest'
import { updateVoteType } from '../../businessLogic/votes'

const logger = createLogger('todos')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const userId = getUserId(event)
    const updateVote: UpdateVoteRequest = JSON.parse(event.body)
    logger.info(`event ${event.body}`)
    const voteId = event.pathParameters.voteId
    await updateVoteType(userId, voteId, updateVote)
  
    return {
      statusCode: 200,
      body: ''
    }
  }
)

handler
.use(
  cors({
    credentials: true
  })
)