import { APIGatewayProxyHandler } from 'aws-lambda';
import { v4 as uuid } from 'uuid';

import { document } from '../utils/dynamodbClient'

interface IRequest {
  title: string;
  deadline: string;
}

export const handle: APIGatewayProxyHandler = async (event) => {
  const { user_id } = event.pathParameters
  const { title, deadline } = JSON.parse(event.body) as IRequest

  const id = uuid()

  await document.put({
    TableName: 'todos',
    Item: {
        id,
        user_id,
        title,
        done: false,
        deadline: new Date(deadline)
    }
  }).promise()

  const response = await document.query({
    TableName: 'todos',
    KeyConditionExpression: "id = :id",
    ExpressionAttributeValues: {
      ":id": id
    }
  }).promise()

  return {
    statusCode: 201,
    body: JSON.stringify(response.Items[0]),
    headers: {
      "Content-type": "application/json"
    }
  }
}
