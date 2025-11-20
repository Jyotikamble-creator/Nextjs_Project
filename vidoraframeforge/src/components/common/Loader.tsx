"use client"

interface LoaderProps {
  message?: string
  fullscreen?: boolean
}

export default function Loader({ message = "Loading...", fullscreen = false }: LoaderProps) {
  const content = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="text-gray-600">{message}</p>
    </div>
  )

  if (fullscreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
        {content}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center py-8">
      {content}
    </div>
  )
}