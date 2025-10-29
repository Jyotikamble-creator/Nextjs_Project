"use client"

interface VideoUploadErrorProps {
  error: string
  onRetry?: () => void
  onCancel?: () => void
}

export default function VideoUploadError({ error, onRetry, onCancel }: VideoUploadErrorProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <div className="text-red-600 text-4xl mb-4">❌</div>
      <h3 className="text-lg font-semibold text-red-800 mb-2">Upload Failed</h3>
      <p className="text-red-600 mb-4">{error}</p>
      <div className="flex gap-3 justify-center">
        {onRetry && (
          <button onClick={onRetry} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
            Try Again
          </button>
        )}
        {onCancel && (
          <button onClick={onCancel} className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}
