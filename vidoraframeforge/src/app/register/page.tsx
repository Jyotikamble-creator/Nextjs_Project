"use client"

import Link from "next/link"
import RegisterForm from "@/components/auth/RegisterForm"

export const dynamic = 'force-dynamic';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#0f1419] flex">
      {/* Left Side - Form Section */}
      <div className="w-full lg:w-1/2 flex flex-col p-8 lg:p-12">
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white">VidoraFrameForge</h2>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Create Account
              </h1>
              <p className="text-gray-400 text-lg">
                Join VidoraFrameForge to start sharing your videos
              </p>
            </div>

            <RegisterForm />

            <p className="text-center text-gray-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Image Section */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        {/* Concert Image */}
        <div className="absolute inset-0 bg-linear-to-br from-orange-600/20 via-yellow-600/20 to-orange-800/20">
          <div className="w-full h-full relative">
            <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent z-10" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxyYWRpYWxHcmFkaWVudCBpZD0iZ3JhZCI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6cmdiKDI1NSwyMjAsMTAwKTtzdG9wLW9wYWNpdHk6MC44IiAvPjxzdG9wIG9mZnNldD0iNTAlIiBzdHlsZT0ic3RvcC1jb2xvcjpyZ2IoMjU1LDE4MCw2MCk7c3RvcC1vcGFjaXR5OjAuNiIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOnJnYigxMDAsMzAsMCk7c3RvcC1vcGFjaXR5OjAuOSIgLz48L3JhZGlhbEdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyYWQpIiAvPjwvc3ZnPg==')] bg-cover" />

            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-yellow-400/40 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-orange-500/30 rounded-full blur-[100px] animate-pulse delay-100" />
            <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-orange-500/30 rounded-full blur-[100px] animate-pulse delay-200" />

            <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-linear-to-t from-black/90 via-black/50 to-transparent">
              <div className="absolute bottom-0 left-0 right-0 h-48 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0wLDEwMCBMMCw2MCBRMjAsNDAgNDAsNTUgVDgwLDQ1IFQxMjAsNjAgVDE2MCw0MCBUMJAWLDNS1MCBUITU2MCw0NSBUMzIwLDU1IFQzNjAsNDUgVDQwMCw2MCBMNDA1LDEwMCBaIiBmaWxsPSJyZ2JhKDAsMCwwLDAuOSkiLz48L3N2Zz4=')] bg-repeat-x bg-bottom opacity-80" />
            </div>

            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-full bg-linear-to-b from-yellow-200/60 via-yellow-400/20 to-transparent transform -skew-x-12 blur-sm" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-full bg-linear-to-b from-yellow-200/60 via-yellow-400/20 to-transparent transform skew-x-12 blur-sm" />
          </div>
        </div>
      </div>
    </div>
  );
}