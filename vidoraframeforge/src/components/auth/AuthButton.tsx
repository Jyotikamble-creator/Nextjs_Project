import { Chrome, Facebook } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface SocialAuthButtonsProps {
  onGoogleSignUp: () => void;
  onFacebookSignUp: () => void;
}

export const SocialAuthButtons = ({
  onGoogleSignUp,
  onFacebookSignUp,
}: SocialAuthButtonsProps) => {
  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-[#0f1419] text-gray-400">OR</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="secondary"
          onClick={onGoogleSignUp}
          type="button"
          className="flex items-center justify-center gap-2"
        >
          <Chrome className="w-5 h-5" />
          Google
        </Button>
        <Button
          variant="secondary"
          onClick={onFacebookSignUp}
          type="button"
          className="flex items-center justify-center gap-2"
        >
          <Facebook className="w-5 h-5" />
          Facebook
        </Button>
      </div>
    </div>
  );
};