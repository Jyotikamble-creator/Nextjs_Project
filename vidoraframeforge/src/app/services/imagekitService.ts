import axios from "axios";

export const getImageKitAuth = async () => {
  const res = await axios.get("/api/imagekit-auth");
  if (!res.data.authenticationParameters) {
    throw new Error("Failed to get ImageKit auth");
  }

  return {
    ...res.data.authenticationParameters,
    publicKey: res.data.publicKey,
  };
};
