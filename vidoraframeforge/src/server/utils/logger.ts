export const logInfo = (message: string, data?: unknown) => {
  console.log(`[INFO] ${message}`, data || "");
};

export const logError = (message: string, error?: unknown) => {
  console.error(`[ERROR] ${message}`, error || "");
};

export const logSuccess = (message: string) => {
  console.log(`[SUCCESS] ${message}`);
};
