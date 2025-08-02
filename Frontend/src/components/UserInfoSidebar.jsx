import { useState } from "react";
import { Pencil, Save, X, Image, FileText, Video, Link2 } from "lucide-react";

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
}) {
  const [tab, setTab] = useState("images");
  const [nickname, setNickname] = useState(initialNickname);
  const [editing, setEditing] = useState(false);

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

  if (!open) return null;

  return (
    <div className="fixed top-0 right-0 w-full max-w-sm h-full bg-base-100 shadow-2xl z-50 flex flex-col animate-slide-in">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-base-300">
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
          className="w-24 h-24 rounded-full object-cover border-4 border-primary mb-2"
        />
        <h3 className="font-bold text-xl">{user.fullName}</h3>
        <div className="flex items-center gap-2 mt-2">
          {editing ? (
            <>
              <input
                className="input input-sm"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                maxLength={30}
              />
              <button
                className="btn btn-sm btn-primary"
                onClick={() => {
                  setEditing(false);
                  onUpdateNickname?.(nickname);
                }}
              >
                <Save size={16} />
              </button>
            </>
          ) : (
            <>
              <span className="text-base-content/70 italic">{nickname || "Chưa đặt biệt danh"}</span>
              <button className="btn btn-xs btn-ghost" onClick={() => setEditing(true)}>
                <Pencil size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-base-200">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`flex-1 py-2 text-sm font-medium flex items-center justify-center gap-1 ${tab === t.key ? "border-b-2 border-primary text-primary" : "text-base-content/70"}`}
            onClick={() => setTab(t.key)}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4">
        {tab === "images" && (
          <div className="grid grid-cols-3 gap-2">
            {images.length === 0 && <div className="col-span-3 text-center text-base-content/50">Chưa có ảnh</div>}
            {images.map((img, idx) => (
              <img key={idx} src={img.url} alt="img" className="w-full h-24 object-cover rounded" />
            ))}
          </div>
        )}
        {tab === "videos" && (
          <div className="space-y-2">
            {videos.length === 0 && <div className="text-center text-base-content/50">Chưa có video</div>}
            {videos.map((vid, idx) => (
              <video key={idx} src={vid.url} controls className="w-full rounded" />
            ))}
          </div>
        )}
        {tab === "files" && (
          <div className="space-y-2">
            {files.length === 0 && <div className="text-center text-base-content/50">Chưa có file</div>}
            {files.map((file, idx) => (
              <a key={idx} href={file.url} target="_blank" rel="noopener noreferrer" className="block p-2 bg-base-200 rounded hover:bg-base-300">
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
              <a key={idx} href={link} target="_blank" rel="noopener noreferrer" className="block text-primary hover:underline">
                {link}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Thông tin cuộc trò chuyện */}
      <div className="p-4 border-t border-base-200 text-sm text-base-content/70">
        <div>Ngày bắt đầu: <b>{chatInfo?.startedAt ? new Date(chatInfo.startedAt).toLocaleDateString() : "-"}</b></div>
        <div>Tổng số tin nhắn: <b>{chatInfo?.totalMessages ?? "-"}</b></div>
      </div>
    </div>
  );
}