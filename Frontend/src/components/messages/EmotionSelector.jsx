import { useState } from "react";
import { Smile, Heart, Frown, Angry, Zap, Star } from "lucide-react";

const EMOTIONS = [
    { key: "neutral", label: "Bình thường", icon: <Smile size={16} /> },
    { key: "happy", label: "Vui vẻ", icon: <Smile size={16} />, emoji: "😊" },
    { key: "love", label: "Yêu thích", icon: <Heart size={16} />, emoji: "❤️" },
    { key: "sad", label: "Buồn", icon: <Frown size={16} />, emoji: "😢" },
    { key: "angry", label: "Giận", icon: <Angry size={16} />, emoji: "😠" },
    { key: "excited", label: "Hào hứng", icon: <Zap size={16} />, emoji: "⚡" },
    { key: "special", label: "Đặc biệt", icon: <Star size={16} />, emoji: "⭐" }
];

const EmotionSelector = ({ selectedEmotion, onEmotionChange, disabled = false }) => {
    const [isOpen, setIsOpen] = useState(false);

    const selectedEmotionData = EMOTIONS.find(e => e.key === selectedEmotion) || EMOTIONS[0];

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`btn btn-circle btn-sm transition-all duration-200 ${
                    selectedEmotion === "neutral" 
                        ? "bg-base-200 hover:bg-base-300" 
                        : "bg-primary/10 hover:bg-primary/20 text-primary"
                } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                title="Chọn cảm xúc"
            >
                {selectedEmotionData.emoji || selectedEmotionData.icon}
            </button>

            {/* Emotion Picker Dropdown */}
            {isOpen && !disabled && (
                <div className="absolute bottom-full left-0 mb-2 bg-base-100/95 backdrop-blur-md rounded-xl shadow-2xl border border-base-300 p-2 z-50 min-w-48 animate-modal-slide-in">
                    <div className="text-xs font-medium text-base-content/70 mb-2 px-2">
                        Chọn cảm xúc
                    </div>
                    <div className="space-y-1">
                        {EMOTIONS.map((emotion) => (
                            <button
                                key={emotion.key}
                                onClick={() => {
                                    onEmotionChange(emotion.key);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-150 ${
                                    selectedEmotion === emotion.key
                                        ? "bg-primary/10 text-primary"
                                        : "hover:bg-base-200"
                                }`}
                            >
                                <span className="text-lg">{emotion.emoji || emotion.icon}</span>
                                <span className="text-sm">{emotion.label}</span>
                                {selectedEmotion === emotion.key && (
                                    <div className="ml-auto w-2 h-2 bg-primary rounded-full"></div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Backdrop to close dropdown */}
            {isOpen && (
                <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
};

export default EmotionSelector; 