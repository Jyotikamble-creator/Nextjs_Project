import axios from "axios";

export async function uploadToImageKit(file: File) {
  console.log("File:", file, "size:", file.size, "type:", file.type);

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
}