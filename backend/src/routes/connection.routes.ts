import { Router } from "express";
import { RequireSession } from "../middleware/requireSessions.js";
import {
  createCalendarConnectUrl,
  getCalendarConnection,
  refreshCalendarConnection,
} from "../services/connection.service.js";
import { ensureUser } from "../repositories/user.repository.js";

export const connectionRouter = Router();

connectionRouter.use(RequireSession);

connectionRouter.get("/", async (req, res) => {
  try {
    const user = await ensureUser({
      authUserId: req.auth!.authUserId,
      email: req.auth!.email,
    });

    const connection = await getCalendarConnection(user.id);
    res.json({ connection });
  } catch (err) {
    console.error("GET /connections failed:", err);
    res.status(500).json({ error: "could not load connections" });
  }
});

connectionRouter.post("/connect", async (req, res) => {
  try {
    const refreshToken =
      typeof req.body?.refreshToken === "string" ? req.body.refreshToken : "";

    if (!refreshToken) {
      res.status(400).json({ error: "Refresh token required" });
      return;
    }

    const redirectUrl =
      typeof req.body?.redirectUrl === "string"
        ? req.body.redirectUrl
        : `${process.env.APP_URL ?? "http://localhost:3000"}/dashboard`;

    const user = await ensureUser({
      authUserId: req.auth!.authUserId,
      email: req.auth!.email,
    });

    const result = await createCalendarConnectUrl({
      userId: user.id,
      refreshToken,
      redirectUrl,
    });

    res.json(result);
  } catch (err) {
    console.error("GET /connections failed:", err);
    res.status(500).json({ error: "could not start connection" });
  }
});

connectionRouter.post("/refresh-status", async (req, res) => {
  try {
    const user = await ensureUser({
      authUserId: req.auth!.authUserId,
      email: req.auth!.email,
    });

    const connection = await refreshCalendarConnection({
      userId: user.id,
      authUserId: req.auth!.authUserId,
    });

    res.json({ connection });
  } catch (err) {
    console.error("GET /connections failed:", err);
    res.status(500).json({ error: "failed to refresh the status" });
  }
});
