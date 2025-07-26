import { Request, Response } from "express";
import imagekit from "../config/imagekit";
import Video from "../models/Video";

export const uploadVideo = async (req: Request, res: Response) => {
  try {
    const { file, fileName } = req.body;
    const userId = req.user?.userId;

    const uploadResponse = await imagekit.upload({
      file,           // base64 or buffer
      fileName,       // my_video.mp4
      folder: "/videos",
    });

    const newVideo = new Video({
      user: userId,
      url: uploadResponse.url,
      fileId: uploadResponse.fileId,
      name: fileName,
    });

    await newVideo.save();

    res.status(201).json({ message: "Video uploaded", video: newVideo });
  } catch (error) {
    res.status(500).json({ message: "Error uploading video" });
  }
};

export const getVideos = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const videos = await Video.find({ user: userId });

    res.status(200).json(videos);
  } catch (error) {
    res.status(500).json({ message: "Error fetching videos" });
  }
};

export const deleteVideo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const video = await Video.findById(id);

    if (!video) return res.status(404).json({ message: "Video not found" });

    await imagekit.deleteFile(video.fileId);
    await Video.findByIdAndDelete(id);

    res.status(200).json({ message: "Video deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error deleting video" });
  }
};
