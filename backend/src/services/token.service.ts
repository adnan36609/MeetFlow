import { error } from "node:console";
import { CALENDAR_CONNECTION_ID, descopeClient } from "../config/descope.js";

export async function getCalendarAccessToken(authUserId: string) {
  if (!CALENDAR_CONNECTION_ID || !process.env.DESCOPE_MANAGEMENT_KEY) {
    throw new Error("Connection is not configured");
  }

  const response =
    await descopeClient.management.outboundApplication.fetchToken(
      CALENDAR_CONNECTION_ID,
      authUserId,
    );

  const accessToken =
    response.ok && response.data
      ? (response.data as { accessToken?: string }).accessToken
      : undefined;

  if (!accessToken) {
    throw new Error("Calendar access token is not present, reconnect!");
  }

  return accessToken;
}
