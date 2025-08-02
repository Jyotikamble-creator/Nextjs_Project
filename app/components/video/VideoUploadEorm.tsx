"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Upload, X, Video } from "lucide-react"
import { toast } from "react-hot-toast"
import { useUpload } from "@/hooks/use-upload"

const uploadSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  description: z.string().min(1, "Description is required").max(1000, "Description too long"),
  category: z.string().min(1, "Category is required"),
  tags: z.string().optional(),
  isPublic: z.boolean().default(true),
})

type UploadFormData = z.infer<typeof uploadSchema>

export default function VideoUpload() {
  const [file, setFile] = useState<File | null>(null)
  const { uploadVideo, uploading, progress } = useUpload()

  const form = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      tags: "",
      isPublic: true,
    },
  })

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const videoFile = acceptedFiles[0]
      if (videoFile) {
        setFile(videoFile)
        // Auto-fill title from filename
        const fileName = videoFile.name.replace(/\.[^/.]+$/, "")
        form.setValue("title", fileName)
      }
    },
    [form],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [".mp4", ".avi", ".mov", ".wmv", ".flv", ".webm"],
    },
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024, // 100MB
  })

  const onSubmit = async (data: UploadFormData) => {
    if (!file) {
      toast.error("Please select a video file")
      return
    }

    try {
      await uploadVideo(file, {
        ...data,
        tags: data.tags ? data.tags.split(",").map((tag) => tag.trim()) : [],
      })

      toast.success("Video uploaded successfully!")
      form.reset()
      setFile(null)
    } catch (error) {
      toast.error("Failed to upload video")
    }
  }

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Upload Video</CardTitle>
          <CardDescription>Share your video with the world</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
            }`}
          >
            <input {...getInputProps()} />
            {file ? (
              <div className="flex items-center justify-center space-x-2">
                <Video className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setFile(null)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div>
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium">Drop your video here</p>
                <p className="text-sm text-muted-foreground">or click to browse</p>
                <p className="text-xs text-muted-foreground mt-2">Max file size: 100MB</p>
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter video title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe your video" rows={4} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="entertainment">Entertainment</SelectItem>
                        <SelectItem value="music">Music</SelectItem>
                        <SelectItem value="sports">Sports</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Input placeholder="tag1, tag2, tag3" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={uploading || !file}>
                {uploading ? "Uploading..." : "Upload Video"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
