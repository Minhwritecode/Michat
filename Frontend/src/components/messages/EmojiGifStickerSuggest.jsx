import { useState, useEffect, useRef } from "react";
import { Smile, Image, Sticker, Search, X } from "lucide-react";

const TABS = [
  { key: "emoji", label: "Emoji", icon: <Smile size={16} /> },
  { key: "gif", label: "GIF", icon: <Image size={16} /> },
  { key: "sticker", label: "Sticker", icon: <Sticker size={16} /> }
];

// Emoji data (có thể mở rộng)
const EMOJI_CATEGORIES = {
  "😀": ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇"],
  "😍": ["😍", "🥰", "😘", "😗", "😚", "😙", "😋", "😛", "😜", "🤪"],
  "😎": ["😎", "🤓", "🧐", "😏", "😒", "😞", "😔", "😟", "😕", "🙁"],
  "😭": ["😭", "😢", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶"],
  "❤️": ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔"],
  "👍": ["👍", "👎", "👌", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉"]
};

// Sticker data (có thể mở rộng)
const STICKER_CATEGORIES = {
  "cute": ["🐱", "🐶", "🐰", "🐼", "🐨", "🐯", "🦁", "🐸", "🐵", "🐷"],
  "food": ["🍕", "🍔", "🍟", "🌭", "🍿", "🍩", "🍪", "🍦", "🍧", "🍨"],
  "nature": ["🌸", "🌺", "🌻", "🌹", "🌷", "🌼", "🌿", "🍀", "🌱", "🌲"]
};

const EmojiGifStickerSuggest = ({ 
  isOpen, 
  onClose, 
  onSelect, 
  position = { x: 0, y: 0 } 
}) => {
  const [activeTab, setActiveTab] = useState("emoji");
  const [searchTerm, setSearchTerm] = useState("");
  const [gifs, setGifs] = useState([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef();

  // Filter emoji based on search
  const filteredEmojis = Object.values(EMOJI_CATEGORIES)
    .flat()
    .filter(emoji => emoji.includes(searchTerm));

  // Filter stickers based on search
  const filteredStickers = Object.values(STICKER_CATEGORIES)
    .flat()
    .filter(sticker => sticker.includes(searchTerm));

  // Fetch GIFs from Giphy API
  useEffect(() => {
    if (activeTab === "gif" && searchTerm.trim()) {
      setLoading(true);
      // Mock GIF API call (replace with actual Giphy API)
      setTimeout(() => {
        setGifs([
          { id: 1, url: "https://media.giphy.com/media/example1.gif", title: "Happy" },
          { id: 2, url: "https://media.giphy.com/media/example2.gif", title: "Sad" },
          { id: 3, url: "https://media.giphy.com/media/example3.gif", title: "Love" }
        ]);
        setLoading(false);
      }, 500);
    }
  }, [activeTab, searchTerm]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      ref={containerRef}
      className="fixed z-50 bg-base-100 rounded-xl shadow-2xl border border-base-300 animate-modal-slide-in"
      style={{
        left: position.x,
        top: position.y - 300,
        width: 320,
        height: 280
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-base-300">
        <div className="flex gap-1">
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`btn btn-xs ${activeTab === tab.key ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
        <button onClick={onClose} className="btn btn-circle btn-xs btn-ghost">
          <X size={14} />
        </button>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-base-300">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" size={14} />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input input-sm input-bordered w-full pl-8"
            autoFocus
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-3 h-48 overflow-y-auto">
        {activeTab === "emoji" && (
          <div className="grid grid-cols-8 gap-2">
            {filteredEmojis.map((emoji, idx) => (
              <button
                key={idx}
                className="btn btn-circle btn-sm hover:scale-110 transition-transform"
                onClick={() => onSelect(emoji)}
                title={emoji}
              >
                <span className="text-lg">{emoji}</span>
              </button>
            ))}
          </div>
        )}

        {activeTab === "gif" && (
          <div className="space-y-2">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="loading loading-spinner loading-md"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {gifs.map((gif) => (
                  <button
                    key={gif.id}
                    className="relative group overflow-hidden rounded-lg"
                    onClick={() => onSelect({ type: "gif", url: gif.url, title: gif.title })}
                  >
                    <img
                      src={gif.url}
                      alt={gif.title}
                      className="w-full h-20 object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "sticker" && (
          <div className="grid grid-cols-6 gap-2">
            {filteredStickers.map((sticker, idx) => (
              <button
                key={idx}
                className="btn btn-circle btn-sm hover:scale-110 transition-transform"
                onClick={() => onSelect({ type: "sticker", content: sticker })}
                title={sticker}
              >
                <span className="text-lg">{sticker}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmojiGifStickerSuggest; 