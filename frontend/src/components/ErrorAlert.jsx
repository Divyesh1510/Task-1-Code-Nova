import React from 'react';
import { AlertCircle, XCircle } from 'lucide-react';

export default function ErrorAlert({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-2xl flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2 duration-150">
      <div className="flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
        <span className="text-sm font-medium">{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-rose-500 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer"
          aria-label="Dismiss alert"
        >
          <XCircle className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

