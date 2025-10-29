"use client"
import { useRef, useState } from "react";
import {
    ImageKitAbortError,
    ImageKitInvalidRequestError,
    ImageKitServerError,
    ImageKitUploadNetworkError,
    upload,
} from "@imagekit/next";

interface FileUploadProps {
    onSuccess: (res: any) => void
    onProgress?: (progress: number) => void
    fileType?: "image" | "video"
}

const FileUpload = ({ onSuccess, onProgress, fileType }: FileUploadProps) => {
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // validation
    const validateFile = (file: File) => {
        if (fileType === "video") {

            if (!file.type.startsWith("video/")) {
                setError("Upload a valid video file");
                return false;
            }

            if (file.size > 100 * 1024 * 1024) {
                setError("File size must be less than 100MB");
                return false;
            }
        }

        if (fileType === "image") {
            if (!file.type.startsWith("image/")) {
                setError("Upload a valid image file");
                return false;
            }
        }
        return true;
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {

        const file = e.target.files?.[0]

        if (fileType === "image" && !file.type.startsWith("image/")) {
            setError("Upload a valid image file");
            return false;
        }

        try {
            const authRes = await fetch("/api/auth/imageKit-auth")
            const auth = await authRes.json()

            const res = await upload({
                file,
                fileName: file.name,
                publicKey: process.env.NEXT_PUBLIC_PUBLIC_KEY!,
                signature: auth.signature,
                expire: auth.expire,
                token: auth.token,

                onProgress: (event) => {
                    if (event.lengthComputable && onProgress) {
                        const percent = (event.loaded / event.total) *
                            100

                        onProgress(Math.round(percent))
                    }
                },

            })
            onSuccess(res)
        } catch (error) {
            console.error("uplaod failed", error)
        } finally {
            setUploading(false)
        }
    }

    return (
        <>

            <input
                type="file"
                accept={fileType === "video" ? "video/*" : "image/*"}
                onChange={handleFileChange}

            />

            {uploading && (<span>Loading..</span>)}

        </>
    );
};

export default FileUpload;
