import { createServer } from "../server";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const app = createServer();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return new Promise((resolve, reject) => {
    app(req as any, res as any, (err: any) => {
      if (err) {
        return reject(err);
      }
      resolve(undefined);
    });
  });
}

