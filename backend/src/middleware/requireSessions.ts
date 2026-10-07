import { NextFunction, Request, Response } from "express";
import { descopeClient } from "../config/descope.js";

export type AuthContext = {
  authUserId: string;
  email?: string;
  name?: string;
  userId: string;
  token: Record<string, unknown>;
};

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

export async function RequireSession(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ")
    ? header.slice("Bearer ".length).trim()
    : null;

  if (!token) {
    res.status(401).json({ error: "Unauthorized", success: false });
    return;
  }

  try {
    const authInfo = await descopeClient.validateSession(token);
    if (!authInfo) {
      res.status(401).json({ error: "Unauthorized", success: false });
      return;
    }
    const claims = authInfo.token as Record<string, unknown>;
    const authUserId = String(claims.sub ?? "");

    const email = typeof claims.email === "string" ? claims.email : undefined;

    req.auth = {
      authUserId,
      email,
      userId: authUserId,
      token: claims,
    };

    next();
  } catch {
    res.status(401).json({ error: "Unauthorized", success: false });
    return;
  }
}
