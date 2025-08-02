import React from "react";

export default function Modal({ children, onClose }) {
    // Đóng modal khi click ra ngoài
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            onClick={handleBackdropClick}
        >
            <div className="bg-white dark:bg-base-100 rounded-xl shadow-lg p-6 relative w-full max-w-md mx-2">
                <button
                    className="absolute top-2 left-2 btn btn-sm btn-ghost"
                    onClick={onClose}
                >
                    ← Quay lại
                </button>
                {children}
            </div>
        </div>
    );
}