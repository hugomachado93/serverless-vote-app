import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { getUserId } from '../utils'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'
import { getAllVotes } from '../../businessLogic/votes'

const logger = createLogger('votes')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const userId = getUserId(event)
    logger.info(`event ${event}`)

    const items = await getAllVotes(userId)
  
    return {
      statusCode: 200,
      body: JSON.stringify({
        items,
      })
    }
  }
)

handler
.use(
  cors({
    credentials: true
  })
)