import User from "../models/User";

export const findUserByEmail = async (email: string) => {
  return await User.findOne({ email });
};

export const findUserById = async (userId: string) => {
  return await User.findById(userId).select("-password");
};

export const updateUser = async (userId: string, updates: object) => {
  return await User.findByIdAndUpdate(userId, updates, { new: true }).select("-password");
};
