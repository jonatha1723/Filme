import path from "path";
import fs from "fs";

// Import the server logic from dist/index.js
// We use a dynamic import because the file is generated during build
export default async function handler(req: any, res: any) {
  const distPath = path.resolve(process.cwd(), "dist", "index.js");
  
  if (!fs.existsSync(distPath)) {
    return res.status(500).json({ error: "Server build not found" });
  }

  // Import the express app from the build
  // Note: We need to make sure the server/_core/index.ts exports the app
  const { default: app } = await import(distPath);
  
  // Vercel handles the routing to this handler
  return app(req, res);
}
