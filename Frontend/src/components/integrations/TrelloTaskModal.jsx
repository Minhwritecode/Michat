import { useState } from "react";
import { SiTrello } from "react-icons/si";
import { X, Plus, Calendar, Tag } from "lucide-react";
import toast from "react-hot-toast";

const TRELLO_API_KEY = "deee5b70e3eeaa8efc1d25aad105f5b1";

const TrelloTaskModal = ({ isOpen, onClose, onCreate }) => {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error("Vui lòng nhập tiêu đề task");
      return;
    }

    setLoading(true);
    try {
      // Gọi API backend để tạo task trên Trello
              const response = await fetch("/trello/create-task", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title: title.trim(),
          desc: desc.trim(),
          dueDate,
          labels
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create Trello task");
      }

      const task = await response.json();
      onCreate(task);
      toast.success("Tạo task Trello thành công!");
      onClose();
      setTitle("");
      setDesc("");
      setDueDate("");
      setLabels([]);
    } catch (error) {
      console.error("Trello task creation error:", error);
      toast.error("Không thể tạo task Trello");
    } finally {
      setLoading(false);
    }
  };

  const addLabel = () => {
    const newLabel = prompt("Nhập tên label:");
    if (newLabel && newLabel.trim()) {
      setLabels([...labels, newLabel.trim()]);
    }
  };

  const removeLabel = (index) => {
    setLabels(labels.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-base-100 rounded-xl shadow-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 btn btn-sm btn-circle"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <SiTrello className="w-8 h-8 text-primary" />
          <div>
            <div className="font-bold text-lg">Tạo task Trello</div>
            <div className="text-sm text-base-content/70">Tạo task mới trên Trello</div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label">
              <span className="label-text font-medium">Tiêu đề *</span>
            </label>
            <input
              className="input input-bordered w-full"
              placeholder="Nhập tiêu đề task..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text font-medium">Mô tả</span>
            </label>
            <textarea
              className="textarea textarea-bordered w-full"
              placeholder="Nhập mô tả task..."
              rows={3}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text font-medium">Ngày hết hạn</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/50" />
              <input
                type="date"
                className="input input-bordered w-full pl-10"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="label">
              <span className="label-text font-medium">Labels</span>
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {labels.map((label, index) => (
                <span
                  key={index}
                  className="badge badge-primary gap-1"
                >
                  {label}
                  <button
                    onClick={() => removeLabel(index)}
                    className="btn btn-xs btn-circle"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
            <button
              onClick={addLabel}
              className="btn btn-outline btn-sm gap-2"
            >
              <Plus size={14} />
              Thêm label
            </button>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            className="btn btn-outline flex-1"
            onClick={onClose}
            disabled={loading}
          >
            Hủy
          </button>
          <button
            className="btn btn-primary flex-1"
            onClick={handleCreate}
            disabled={loading || !title.trim()}
          >
            {loading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Đang tạo...
              </>
            ) : (
              <>
                <SiTrello size={16} />
                Tạo task
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrelloTaskModal; 