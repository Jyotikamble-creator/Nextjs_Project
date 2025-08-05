
import express from "express"
import { authenticate } from "../middleware/auth"
import { uploadVideo, getVideos, getVideoById, deleteVideo } from "../controllers/video.controller"

const router = express.Router()

router.post("/upload", authenticate, uploadVideo)
router.get("/", getVideos) // Public route for all videos
router.get("/:id", getVideoById) // Public route for single video
router.delete("/:id", authenticate, deleteVideo)

export default router
