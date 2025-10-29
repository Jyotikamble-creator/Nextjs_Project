export const LoadingState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-4">
      <div className="w-full max-w-md space-y-3">
        <div className="space-y-2">
          <div className="text-white font-medium">Loading your videos...</div>
          <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full animate-pulse w-3/4"></div>
          </div>
          <div className="text-gray-400 text-sm">Please wait</div>
        </div>
      </div>
    </div>
  );
};
