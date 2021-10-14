import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { getUserId } from '../utils'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'
import { createVote } from '../../businessLogic/votes'
import { CreateVoteRequest } from '../../requests/CreateVoteRequest'
import * as createHttpError from 'http-errors'

const logger = createLogger('votes')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const userId = getUserId(event)
    const newVote: CreateVoteRequest = JSON.parse(event.body)
    logger.info(`event ${event.body}`)

    if(!newVote.voteName || !newVote.endDate || !newVote.question || !newVote.startDate) {
      throw createHttpError(400, 'Parameters are missing')
    }

    const newItem = await createVote(userId, newVote)
  
    return {
      statusCode: 201,
      body: JSON.stringify({
        item: newItem
      })
    }
  }
)

handler
.use(httpErrorHandler())
.use(
  cors({
    credentials: true
  })
)