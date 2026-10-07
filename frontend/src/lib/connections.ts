import { getRefreshToken } from "@descope/nextjs-sdk/client";
import { apiFetch } from "./api";
import { ConnectionInfo } from "./types";
// import { error } from "console";

export async function fetchCalendarFunction(token: string) {
  const data = await apiFetch<{ connection: ConnectionInfo }>(
    "/api/connections",
    { token },
  );

  return data.connection;
}

export async function ConnectCalendar(token: string) {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("refreahToken Invalid");
  const result = await apiFetch<{ url: string }>("/api/connections/connect", {
    method: "POST",
    token,
    body: {
        redirectUrl: `${window.location.origin}/dashboard`,
        refreshToken
    }
  })
  window.location.href= result.url;
}

export async function refreshCalendarConnection(token: string){
    await apiFetch("/api/connections/refresh-status", {
        method: "POST",
        token
    });
}

