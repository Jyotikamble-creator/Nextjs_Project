import { LoginForm } from "@/components/auth/LoginForm";

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center h-screen">
      <LoginForm />
    </div>
  );
}