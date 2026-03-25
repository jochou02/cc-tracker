import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { validateUserId, validateApiKey, response } from "../lib/validate.mjs";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient());
const TABLE = process.env.TABLE_NAME;

export async function handler(event) {
  const authError = validateApiKey(event);
  if (authError) return authError;

  const userId = event.queryStringParameters?.user;
  if (!validateUserId(userId)) {
    return response(400, { error: "Invalid or missing user" });
  }

  const { Item } = await ddb.send(new GetCommand({
    TableName: TABLE,
    Key: { pk: `USER#${userId}`, sk: "STATE" },
  }));

  return response(200, {
    creditState: Item?.creditState ?? {},
  });
}
