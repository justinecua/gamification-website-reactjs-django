// src/components/DialogBox.jsx
import React, { useEffect } from "react";

export default function DialogBox({ show, message, type, onClose }) {
  // Auto-close after 3 seconds
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => onClose(), 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div
        className={`bg-white rounded-lg shadow-lg p-6 w-[90%] max-w-sm border-t-4 ${
          type === "success" ? "border-emerald-500" : "border-red-500"
        }`}
      >
        <h2
          className={`text-lg font-semibold mb-2 ${
            type === "success" ? "text-emerald-600" : "text-red-600"
          }`}
        >
          {type === "success" ? "Success" : "Error"}
        </h2>
        <p className="text-gray-700 mb-4">{message}</p>
        <div className="text-right">
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded-md text-sm font-medium"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
