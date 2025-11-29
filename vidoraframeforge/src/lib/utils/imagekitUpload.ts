import axios from "axios";

export async function uploadToImageKit(file: File) {
  console.log("File:", file, "size:", file.size, "type:", file.type);

  // TEMPORARY: Create thumbnail data URL for testing
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        // Create thumbnail canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const maxSize = 300;
        let { width, height } = img;

        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        const thumbnailDataURL = canvas.toDataURL('image/jpeg', 0.8);

        const mockResponse = {
          fileId: `mock-${Date.now()}`,
          name: file.name,
          url: thumbnailDataURL, // Use thumbnail as main image for display
          thumbnail: thumbnailDataURL,
          width: Math.round(width),
          height: Math.round(height),
          size: file.size,
          fileType: 'image'
        };
        console.log("Mock upload successful with thumbnail data URL");
        resolve(mockResponse);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });

  /*
  // ACTUAL UPLOAD CODE (commented out for testing)
  // 1) get auth
  const { data: auth } = await axios.get("/api/auth/imagekit-auth");

  // 2) prepare form
  const formData = new FormData();
  formData.append("file", file);
  formData.append("fileName", file.name);
  formData.append("token", auth.authenticationParameters.token);
  formData.append("signature", auth.authenticationParameters.signature);
  formData.append("expire", auth.authenticationParameters.expire.toString());
  formData.append("publicKey", auth.publicKey);

  // 3) upload
  const res = await axios.post(
    "https://upload.imagekit.io/api/v1/files/upload",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  return res.data;
  */
}