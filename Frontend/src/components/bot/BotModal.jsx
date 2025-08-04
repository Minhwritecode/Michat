import { useState } from "react";
import { X, Bot } from "lucide-react";
import axios from "../../libs/axios";

const BotModal = ({ isOpen, onClose }) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setAnswer("");
    try {
              const res = await axios.post("/api/bot/ask", { message: question });
      setAnswer(res.data.answer);
    } catch {
      setAnswer("Xin lỗi, bot hiện không trả lời được.");
    }
    setLoading(false);
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-base-100 rounded-xl shadow-lg p-6 w-full max-w-md relative">
        <button className="absolute top-2 right-2 btn btn-sm btn-circle" onClick={onClose}>
          <X />
        </button>
        <div className="flex items-center gap-2 mb-4">
          <Bot className="text-primary" />
          <h2 className="font-bold text-lg">Trợ lý AI</h2>
        </div>
        <textarea
          className="textarea textarea-bordered w-full mb-2"
          rows={3}
          placeholder="Nhập câu hỏi cho bot..."
          value={question}
          onChange={e => setQuestion(e.target.value)}
        />
        <button className="btn btn-primary w-full mb-2" onClick={handleAsk} disabled={loading}>
          {loading ? "Đang trả lời..." : "Gửi"}
        </button>
        {answer && (
          <div className="bg-base-200 rounded-lg p-3 mt-2">
            <div className="font-semibold mb-1">Bot:</div>
            <div>{answer}</div>
          </div>
        )}
      </div>
    </div>
  );
};
export default BotModal;