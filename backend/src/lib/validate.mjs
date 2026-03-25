const ALLOWED_USERS = new Set(["ue", "john", "amy"]);
const API_KEY = process.env.API_KEY;

export function validateUserId(userId) {
  if (!userId || typeof userId !== "string") return false;
  return ALLOWED_USERS.has(userId);
}

/** Validate the x-api-key header. Returns an error response or null if valid. */
export function validateApiKey(event) {
  const key = event.headers?.["x-api-key"];
  if (!API_KEY || key !== API_KEY) {
    return response(403, { error: "Forbidden" });
  }
  return null;
}

/** Standard JSON response helper. */
export function response(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}
