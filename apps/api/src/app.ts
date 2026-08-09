import express from "express";
import cors from "cors";
import type { Request, Response } from "express";

import chatRouter from "./routes/chat.routes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
    res.json({
        status: 'ok'
    })
});

app.use("/chat", chatRouter);

export default app;