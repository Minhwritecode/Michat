import { useEffect, useState, useRef } from "react";
import axios from "../../libs/axios";
import { Smile, Image, Sticker } from "lucide-react";

const getType = (s) => {
  if (typeof s === "object" && s.type) return s.type;
  if (typeof s === "string") {
    if (/^https?:\/\/.*\.(gif|jpg|png|webp)$/i.test(s)) return "gif";
    if (/^[\p{Emoji}]+$/u.test(s)) return "emoji";
    return "text";
  }
  return "text";
};

const getIcon = (type) => {
  if (type === "emoji") return <Smile className="w-4 h-4 text-yellow-400" />;
  if (type === "gif") return <Image className="w-4 h-4 text-pink-400" />;
  if (type === "sticker") return <Sticker className="w-4 h-4 text-green-400" />;
  return null;
};

const SmartSuggestions = ({ text, onSelect }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [selected, setSelected] = useState(0);
  const containerRef = useRef();

  useEffect(() => {
    if (!text.trim()) return setSuggestions([]);
    let ignore = false;
    axios.post("/api/bot/suggest", { text }).then(res => {
      if (!ignore) setSuggestions(res.data.suggestions || []);
    });
    return () => { ignore = true; };
  }, [text]);

  useEffect(() => { setSelected(0); }, [suggestions]);

  // Keyboard navigation
  useEffect(() => {
    if (!suggestions.length) return;
    const handleKey = (e) => {
      if (e.key === "ArrowRight") setSelected(s => (s + 1) % suggestions.length);
      if (e.key === "ArrowLeft") setSelected(s => (s - 1 + suggestions.length) % suggestions.length);
      if (e.key === "Enter") {
        if (suggestions[selected]) onSelect(suggestions[selected]);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [suggestions, selected, onSelect]);

  if (!suggestions.length) return null;
  return (
    <div ref={containerRef} className="flex gap-2 mt-2 animate-fade-in">
      {suggestions.map((s, i) => {
        const type = getType(s);
        return (
          <button
            key={i}
            className={`btn btn-xs rounded-full px-3 flex items-center gap-1 transition shadow-md ${selected === i
                ? "bg-primary text-primary-content scale-105"
                : "btn-outline hover:bg-primary/10"
              } animate-bounce-in`}
            style={{ animationDelay: `${i * 40}ms` }}
            onClick={() => onSelect(s)}
            tabIndex={-1}
          >
            {getIcon(type)}
            {type === "gif" ? (
              <img src={typeof s === "string" ? s : s.url} alt="gif" className="w-8 h-8 rounded object-cover" />
            ) : (
              <span>{typeof s === "string" ? s : s.text}</span>
            )}
          </button>
        );
      })}
    </div>
  );
};
export default SmartSuggestions;