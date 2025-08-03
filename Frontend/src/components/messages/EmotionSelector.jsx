import { useState, useRef, useEffect } from "react";
import { Heart, Smile, Frown, Angry, Meh, Zap, Star } from "lucide-react";

const EMOTIONS = [
  { key: "happy", label: "Vui vẻ", icon: <Smile size={16} />, color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  { key: "love", label: "Yêu thích", icon: <Heart size={16} />, color: "bg-pink-100 text-pink-800 border-pink-200" },
  { key: "sad", label: "Buồn", icon: <Frown size={16} />, color: "bg-blue-100 text-blue-800 border-blue-200" },
  { key: "angry", label: "Tức giận", icon: <Angry size={16} />, color: "bg-red-100 text-red-800 border-red-200" },
  { key: "neutral", label: "Bình thường", icon: <Meh size={16} />, color: "bg-gray-100 text-gray-800 border-gray-200" },
  { key: "excited", label: "Hào hứng", icon: <Zap size={16} />, color: "bg-orange-100 text-orange-800 border-orange-200" },
  { key: "special", label: "Đặc biệt", icon: <Star size={16} />, color: "bg-purple-100 text-purple-800 border-purple-200" }
];

const EmotionSelector = ({ selectedEmotion, onEmotionChange, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef();

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const selectedEmotionData = EMOTIONS.find(e => e.key === selectedEmotion) || EMOTIONS[4]; // default to neutral

  return (
    <div ref={containerRef} className="relative">
      {/* Selected emotion button */}
      <button
        type="button"
        className={`btn btn-circle btn-sm transition-all duration-200 ${
          selectedEmotion 
            ? selectedEmotionData.color 
            : "btn-ghost hover:bg-base-200"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        title={selectedEmotion ? `Chủ đề: ${selectedEmotionData.label}` : "Chọn chủ đề cảm xúc"}
      >
        {selectedEmotionData.icon}
      </button>

      {/* Emotion picker popup */}
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 bg-base-100 rounded-xl shadow-2xl border border-base-300 p-2 animate-modal-slide-in z-50">
          <div className="grid grid-cols-4 gap-1">
            {EMOTIONS.map((emotion) => (
              <button
                key={emotion.key}
                className={`btn btn-sm rounded-lg flex flex-col items-center gap-1 p-2 transition-all duration-200 ${
                  selectedEmotion === emotion.key
                    ? emotion.color
                    : "btn-ghost hover:bg-base-200"
                }`}
                onClick={() => {
                  onEmotionChange(emotion.key);
                  setIsOpen(false);
                }}
                title={emotion.label}
              >
                {emotion.icon}
                <span className="text-xs">{emotion.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmotionSelector; 