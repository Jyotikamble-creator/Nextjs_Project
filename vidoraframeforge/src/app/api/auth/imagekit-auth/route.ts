import { NextRequest, NextResponse } from "next/server";
import { getUploadAuthParams } from "@imagekit/next/server"

export async function GET() {
    try {
        // authenticationParameters={ token, expire, signature }
        const authenticationParameters = getUploadAuthParams({
            privateKey: process.env.IMAGEKIT_PRIVATE_KEY as string,
            publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY as string,
        })
        
        return NextResponse.json({ 
            authenticationParameters, 
            publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY 
        })
    } catch (error) {
        console.error("ImageKit auth error:", error)
        return NextResponse.json({
            error: "Authentication for ImageKit failed"
        }, { status: 500 })
    }
}