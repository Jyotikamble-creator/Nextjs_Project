export function getVideoIdFromUrl(url: string): string | null {
  try {
    const segments = url.split("/");
    return segments.pop() || null;
  } catch {
    return null;
  }
}

// export function getYouTubeVideoId(url: string): string | null {
//   const regExp = /(?:youtube\.com\/.*v=|youtu\.be\/)([^&]+)/;
//   const match = url.match(regExp);
//   return match ? match[1] : null;
// }
