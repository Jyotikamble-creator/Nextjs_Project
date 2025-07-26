import express from "express";
import { authenticate } from "../middleware/auth";
import {
  uploadVideo,
  getVideos,
  deleteVideo,
} from "../controllers/video.controller";

const router = express.Router();

router.post("/upload", authenticate, uploadVideo);
router.get("/", authenticate, getVideos);
router.delete("/:id", authenticate, deleteVideo);

export default router;
