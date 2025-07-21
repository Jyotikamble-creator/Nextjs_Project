import { authOptions } from "@/lib/auth";
import { connectionToDatabase } from "@/lib/db";
import  Video, { IVideo }  from "@/models/Video";
import { error } from "console";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// read the videos from the imagekit 

export async function GET() {
    
    try {
        await connectionToDatabase()
        const videos = await Video.find({}).sort({ createdAt: -1 }).lean();

        if(!videos || videos.length===0){
            return NextResponse.json([],{status:200})

        }

        return NextResponse.json(videos)

    } catch (error) {

        return NextResponse.json(
            {error:"failed to fetch the videos"},
            {status:500}
        )
        
    }
}

// write /upload videos 
export async function POST(request: NextResponse) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    await connectionToDatabase();

    const body: IVideo = await request.json();

    if (!body.title || !body.description || !body.videoUrl || !body.thumbnailUrl) {
        return NextResponse.json({ error: "missing files" }, { status: 400 });
    }

    const videoData = {
        ...body,
        controls: body?.controls ?? true,
        transformation: {
            height: 1920,
            width: 1080,
            quality: body.transformtion?.quality ?? 100, // Typo here too!
        },
    };

    const newVideo = await Video.create(videoData);
    return NextResponse.json(newVideo);
}
