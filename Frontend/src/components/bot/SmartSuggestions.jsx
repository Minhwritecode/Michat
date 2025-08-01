import { useEffect, useState } from "react";
import axios from "../../libs/axios";

const SmartSuggestions = ({ text, onSelect }) => {
  const [suggestions, setSuggestions] = useState([]);
  useEffect(() => {
    if (!text.trim()) return setSuggestions([]);
    let ignore = false;
    axios.post("/api/bot/suggest", { message: text }).then(res => {
      if (!ignore) setSuggestions(res.data.suggestions || []);
    });
    return () => { ignore = true; };
  }, [text]);
  if (!suggestions.length) return null;
  return (
    <div className="flex gap-2 mt-2 animate-fade-in">
      {suggestions.map((s, i) => (
        <button
          key={i}
          className="btn btn-xs btn-outline rounded-full px-3 hover:bg-primary/10 transition"
          onClick={() => onSelect(s)}
        >
          {s}
        </button>
      ))}
    </div>
  );
};
export default SmartSuggestions;