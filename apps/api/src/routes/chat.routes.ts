import { Router } from "express";
import chatController from "../controllers/chat.controller.js";

const router = Router();

router.post("/", chatController.chat);

router.post("/stream", chatController.stream);

router.post("/validate-key", chatController.validateKey);

export default router;