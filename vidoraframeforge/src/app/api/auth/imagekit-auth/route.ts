import { NextResponse } from "next/server";
import { getUploadAuthParams } from "@imagekit/next/server"
import { Logger, LogTags, categorizeError } from "@/lib/logger";

export async function GET() {
  Logger.d(LogTags.IMAGEKIT_AUTH, 'ImageKit auth request received');

  try {
    // authenticationParameters={ token, expire, signature }
    const authenticationParameters = getUploadAuthParams({
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY as string,
      publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY as string,
    })

    Logger.i(LogTags.IMAGEKIT_AUTH, 'ImageKit authentication parameters generated successfully');
    Logger.d(LogTags.IMAGEKIT_AUTH, 'Auth parameters generated', {
      hasToken: !!authenticationParameters.token,
      hasSignature: !!authenticationParameters.signature,
      expire: authenticationParameters.expire
    });

    return NextResponse.json({
      authenticationParameters,
      publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY
    })
  } catch (error) {
    const categorizedError = categorizeError(error);
    Logger.e(LogTags.IMAGEKIT_AUTH, `ImageKit auth error: ${categorizedError.message}`, { error: categorizedError });
    return NextResponse.json({
      error: "Authentication for ImageKit failed"
    }, { status: 500 })
  }
}