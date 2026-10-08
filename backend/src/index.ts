import "dotenv/config";
import cors from "cors";
import express from "express";
import { getPool } from "./db/pool.js";
import { connectionRouter } from "./routes/connection.routes.js";
import { agentRoutes } from "./routes/agent.routes.js";

const app = express();
const port = Number(process.env.PORT) || 4000;
const appOrigin = process.env.APP_URL ?? "http://localhost:3000";

app.use(
  cors({
    origin: appOrigin,
    credentials: true,
  }),
);

app.use(express.json());

app.get("/api/health", async (_req, res) => {
  try {
    await getPool().query("SELECT 1");
    res.status(200).json({
      status: "ok",
      service: "agentic-calendar-app",
      database: "up"
    });
  } catch(error) {
    console.error("Health check database report: ", error);
    res.status(503).json({
      status: "error",
      // success: false,
      service: "agentic-calendar-app",
      // message: "Internal Server Error",
      database: "down"
    });
  }
});

app.use("/api/connections", connectionRouter);
app.use("/api/agent", agentRoutes);

app.listen(port, () => {
  console.log(`Agentic Calendar App is running on port ${port}`);
});
