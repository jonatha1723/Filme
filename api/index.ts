import "dotenv/config";
import express from "express";
import { createServer } from "http";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";
import { registerOAuthRoutes } from "../server/_core/oauth";
import serveStatic from "serve-static";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// OAuth routes
registerOAuthRoutes(app);

// tRPC API routes
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// Serve static files
const distPublicPath = path.join(__dirname, "../dist/public");
if (fs.existsSync(distPublicPath)) {
  app.use(express.static(distPublicPath));
}

// SPA fallback - serve index.html for all other routes
app.get("*", (req, res) => {
  const indexPath = path.join(distPublicPath, "index.html");
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send("Not found");
  }
});

export default app;
