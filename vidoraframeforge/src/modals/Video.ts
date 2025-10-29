import mongoose, { Document, Schema } from "mongoose";

export interface IVideo extends Document {
  user: mongoose.Types.ObjectId;
  url: string;
  fileId: string;
  name: string;
  createdAt: Date;
}

const VideoSchema: Schema = new Schema<IVideo>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    fileId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true } // adds createdAt and updatedAt
);

const Video = mongoose.model<IVideo>("Video", VideoSchema);
export default Video;
