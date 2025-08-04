import { useState } from "react";
import { Pencil, Save, X, Image, FileText, Video, Link2 } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../libs/axios";
import React from "react"; // Added missing import

const TABS = [
  { key: "images", label: "Ảnh", icon: <Image size={16} /> },
  { key: "videos", label: "Video", icon: <Video size={16} /> },
  { key: "files", label: "File", icon: <FileText size={16} /> },
  { key: "links", label: "Link", icon: <Link2 size={16} /> },
];

export default function UserInfoSidebar({
  user,
  messages,
  open,
  onClose,
  onUpdateNickname,
  chatInfo, // { startedAt, totalMessages }
  nickname: initialNickname = "",
  loading: externalLoading = false,
  highlight: externalHighlight = false,
}) {
  // Hooks luôn ở đầu component
  const [tab, setTab] = useState("images");
  const [nickname, setNickname] = useState(initialNickname);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlight, setHighlight] = useState(false);

  // Nếu nhận props loading/highlight từ ngoài thì ưu tiên dùng
  const effectiveLoading = typeof externalLoading === "boolean" ? externalLoading : loading;
  const effectiveHighlight = typeof externalHighlight === "boolean" ? externalHighlight : highlight;

  // Lọc dữ liệu từ messages
  const images = messages.filter(m =>
    m.attachments?.some(att => att.type === "image")
  ).flatMap(m => m.attachments.filter(att => att.type === "image"));

  const videos = messages.filter(m =>
    m.attachments?.some(att => att.type === "video")
  ).flatMap(m => m.attachments.filter(att => att.type === "video"));

  const files = messages.filter(m =>
    m.attachments?.some(att => att.type === "document")
  ).flatMap(m => m.attachments.filter(att => att.type === "document"));

  const links = messages.filter(m =>
    m.text && m.text.match(/https?:\/\/[^ \s]+/g)
  ).flatMap(m => m.text.match(/https?:\/\/[^ \s]+/g) || []);

  // Khi nhận nickname props thay đổi, đồng bộ lại state
  React.useEffect(() => {
    setNickname(initialNickname);
  }, [initialNickname]);

  // Lưu biệt danh về backend
  const handleSaveNickname = async () => {
    if (nickname.trim().length > 30) {
      toast.error("Biệt danh tối đa 30 ký tự");
      return;
    }
    setLoading(true);
    try {
      const res = await axiosInstance.put("/api/auth/nickname", { nickname });
      setEditing(false);
      setHighlight(true);
      setTimeout(() => setHighlight(false), 1200);
      toast.success("Đã cập nhật biệt danh!");
      onUpdateNickname?.(nickname);
    } catch (err) {
      toast.error("Cập nhật biệt danh thất bại!");
    } finally {
      setLoading(false);
    }
  };

  // Đặt return null ở đây, sau khi đã gọi hooks
  if (!open) return null;

  return (
    <div className={`fixed top-0 right-0 w-full max-w-sm h-full bg-base-100 shadow-2xl z-50 flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`} style={{borderTopLeftRadius: 24, borderBottomLeftRadius: 24}}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-base-300 bg-base-100/80 backdrop-blur-md">
        <h2 className="font-bold text-lg">Thông tin người dùng</h2>
        <button onClick={onClose} className="btn btn-circle btn-sm btn-ghost">
          <X size={20} />
        </button>
      </div>

      {/* Avatar + Tên + Biệt danh */}
      <div className="flex flex-col items-center p-6 border-b border-base-200">
        <img
          src={user.profilePic || "/avatar.png"}
          alt={user.fullName}
          className="w-24 h-24 rounded-full object-cover border-4 border-primary mb-2 shadow-lg hover:scale-105 transition-transform duration-300"
        />
        <h3 className="font-bold text-xl mb-1">{user.fullName}</h3>
        <div className="flex items-center gap-2 mt-2">
          {editing ? (
            <>
              <input
                className="input input-sm"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                maxLength={30}
                autoFocus
                style={{ minWidth: 120 }}
              />
              <button
                className="btn btn-sm btn-primary"
                onClick={async () => {
                  if (onUpdateNickname) {
                    await onUpdateNickname(nickname);
                    setEditing(false);
                  } else {
                    // fallback: tự lưu biệt danh cá nhân
                    await handleSaveNickname();
                  }
                }}
                disabled={effectiveLoading}
              >
                {effectiveLoading ? <span className="loading loading-spinner loading-xs"></span> : <Save size={16} />}
              </button>
              <button className="btn btn-sm btn-ghost" onClick={() => setEditing(false)} disabled={effectiveLoading}>
                <X size={14} />
              </button>
            </>
          ) : (
            <>
              <span className={`text-base-content/70 italic transition-colors duration-300 ${effectiveHighlight ? 'bg-green-100 px-2 rounded text-green-700' : ''}`}>{nickname || "Chưa đặt biệt danh"}</span>
              {onUpdateNickname && (
                <button className="btn btn-xs btn-ghost" onClick={() => setEditing(true)}>
                  <Pencil size={14} />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-base-200 bg-base-100/90">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`flex-1 py-2 text-sm font-medium flex items-center justify-center gap-1 transition-colors duration-200 ${tab === t.key ? "border-b-2 border-primary text-primary bg-base-200" : "text-base-content/70 hover:bg-base-200"}`}
            onClick={() => setTab(t.key)}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4 bg-base-100">
        {tab === "images" && (
          <div className="grid grid-cols-3 gap-2">
            {images.length === 0 && <div className="col-span-3 text-center text-base-content/50">Chưa có ảnh</div>}
            {images.map((img, idx) => (
              <img key={idx} src={img.url} alt="img" className="w-full h-24 object-cover rounded shadow hover:scale-105 transition-transform duration-200 cursor-pointer" />
            ))}
          </div>
        )}
        {tab === "videos" && (
          <div className="space-y-2">
            {videos.length === 0 && <div className="text-center text-base-content/50">Chưa có video</div>}
            {videos.map((vid, idx) => (
              <video key={idx} src={vid.url} controls className="w-full rounded shadow" />
            ))}
          </div>
        )}
        {tab === "files" && (
          <div className="space-y-2">
            {files.length === 0 && <div className="text-center text-base-content/50">Chưa có file</div>}
            {files.map((file, idx) => (
              <a key={idx} href={file.url} target="_blank" rel="noopener noreferrer" className="block p-2 bg-base-200 rounded hover:bg-base-300 transition-colors">
                <FileText size={16} className="inline mr-2" />
                {file.filename}
              </a>
            ))}
          </div>
        )}
        {tab === "links" && (
          <div className="space-y-2">
            {links.length === 0 && <div className="text-center text-base-content/50">Chưa có link</div>}
            {links.map((link, idx) => (
              <a key={idx} href={link} target="_blank" rel="noopener noreferrer" className="block text-primary hover:underline transition-colors">
                {link}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Thông tin cuộc trò chuyện */}
      <div className="p-4 border-t border-base-200 text-sm text-base-content/70 bg-base-100/90">
        <div>Ngày bắt đầu: <b>{chatInfo?.startedAt ? new Date(chatInfo.startedAt).toLocaleDateString() : "-"}</b></div>
        <div>Tổng số tin nhắn: <b>{chatInfo?.totalMessages ?? "-"}</b></div>
      </div>
    </div>
  );
}