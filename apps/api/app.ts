import express from "express";
import type { Request, Response } from "express";

const app = express();
app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
    res.json({
        status: 'ok'
    })
})

app.listen(3001, () => {
    console.log("Server is runnig on 3001")
});
