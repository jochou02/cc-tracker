import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { validateUserId, validateApiKey, response } from "../lib/validate.mjs";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient());
const TABLE = process.env.TABLE_NAME;

export async function handler(event) {
  const authError = validateApiKey(event);
  if (authError) return authError;

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return response(400, { error: "Invalid JSON" });
  }

  const { user, creditId, checked, note, dateUsed } = body;

  if (!validateUserId(user)) {
    return response(400, { error: "Invalid or missing user" });
  }
  if (!creditId || typeof creditId !== "string") {
    return response(400, { error: "Invalid or missing creditId" });
  }
  if (typeof checked !== "boolean") {
    return response(400, { error: "checked must be a boolean" });
  }

  // Build the entry — only include optional fields if non-empty
  const entry = { checked };
  if (note && typeof note === "string" && note.trim()) {
    entry.note = note.trim();
  }
  if (dateUsed && typeof dateUsed === "string" && dateUsed.trim()) {
    entry.dateUsed = dateUsed.trim();
  }

  // Ensure the creditState map exists on first write, then set the nested key
  await ddb.send(new UpdateCommand({
    TableName: TABLE,
    Key: { pk: `USER#${user}`, sk: "STATE" },
    UpdateExpression: "SET #cs = if_not_exists(#cs, :empty), #ua = :now",
    ExpressionAttributeNames: {
      "#cs": "creditState",
      "#ua": "updatedAt",
    },
    ExpressionAttributeValues: {
      ":empty": {},
      ":now": new Date().toISOString(),
    },
  }));

  await ddb.send(new UpdateCommand({
    TableName: TABLE,
    Key: { pk: `USER#${user}`, sk: "STATE" },
    UpdateExpression: "SET #cs.#cid = :entry",
    ExpressionAttributeNames: {
      "#cs": "creditState",
      "#cid": creditId,
    },
    ExpressionAttributeValues: {
      ":entry": entry,
    },
  }));

  return response(200, { ok: true });
}
