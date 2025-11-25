export const SocialLoginButtons = ({ onGoogleLogin, onAppleLogin }: { onGoogleLogin: () => void; onAppleLogin: () => void }) => {
  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-600" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-gray-800 text-gray-400">Or continue with</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onGoogleLogin}
          className="w-full inline-flex justify-center py-2 px-4 border border-gray-600 rounded-lg shadow-sm bg-gray-700 text-sm font-medium text-gray-300 hover:bg-gray-600 transition-colors"
        >
          Google
        </button>
        <button
          onClick={onAppleLogin}
          className="w-full inline-flex justify-center py-2 px-4 border border-gray-600 rounded-lg shadow-sm bg-gray-700 text-sm font-medium text-gray-300 hover:bg-gray-600 transition-colors"
        >
          Apple
        </button>
      </div>
    </div>
  );
};