import Link from "next/link";

interface TermsCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
}

export const TermsCheckbox = ({ checked, onChange, error }: TermsCheckboxProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id="terms"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 text-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-offset-0"
        />
        <label htmlFor="terms" className="text-sm text-gray-300 cursor-pointer">
          I agree to the{" "}
          <Link
            href="/terms"
            className="text-purple-400 hover:text-purple-300 underline"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="text-purple-400 hover:text-purple-300 underline"
          >
            Privacy Policy
          </Link>
        </label>
      </div>
      {error && <p className="text-sm text-red-400 ml-7">{error}</p>}
    </div>
  );
};