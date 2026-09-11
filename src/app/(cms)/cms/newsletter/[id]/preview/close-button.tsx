'use client';

export function CloseButton() {
  return (
    <button onClick={() => window.close()} className="text-sm text-gray-600 hover:text-gray-900">
      Close
    </button>
  );
}
