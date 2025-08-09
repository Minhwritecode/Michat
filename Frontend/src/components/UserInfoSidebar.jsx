import { useState } from "react";
import {
  Pencil,
  Save,
  X,
  Image,
  FileText,
  Video,
  Link2,
  Bell,
  BellOff,
  Shield,
  ShieldOff,
  Trash2,
  Phone,
  Video as VideoIcon,
  MessageSquare,
  Calendar,
  Clock,
  VolumeX
} from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../libs/axios";
import { useChatStore } from "../stores/useChatStore";
import React from "react";

const TABS = [
  { key: "images", label: "Ảnh", icon: <Image size={16} /> },
  { key: "videos", label: "Video", icon: <Video size={16} /> },
  { key: "files", label: "File", icon: <FileText size={16} /> },
  { key: "links", label: "Link", icon: <Link2 size={16} /> },
];

const ACTIONS = [
  {
    key: "call",
    label: "Gọi thoại",
    icon: <Phone size={18} />,
    color: "text-green-600",
    bgColor: "bg-green-50 hover:bg-green-100"
  },
  {
    key: "video",
    label: "Gọi video",
    icon: <VideoIcon size={18} />,
    color: "text-blue-600",
    bgColor: "bg-blue-50 hover:bg-blue-100"
  },
  {
    key: "message",
    label: "Nhắn tin",
    icon: <MessageSquare size={18} />,
    color: "text-primary",
    bgColor: "bg-primary/10 hover:bg-primary/20"
  }
];

const SETTINGS = [
  {
    key: "mute",
    label: "Tắt thông báo",
    icon: <BellOff size={18} />,
    activeIcon: <Bell size={18} />,
    color: "text-orange-600",
    bgColor: "bg-orange-50 hover:bg-orange-100"
  },
  {
    key: "block",
    label: "Chặn người dùng",
    icon: <Shield size={18} />,
    activeIcon: <ShieldOff size={18} />,
    color: "text-red-600",
    bgColor: "bg-red-50 hover:bg-red-100"
  },
  {
    key: "delete",
    label: "Xóa cuộc trò chuyện",
    icon: <Trash2 size={18} />,
    color: "text-red-600",
    bgColor: "bg-red-50 hover:bg-red-100"
  }
];

export default function UserInfoSidebar({
  user,
  messages,
  open,
  onClose,
  onUpdateNickname,
  chatInfo,
  nickname: initialNickname = "",
  loading: externalLoading = false,
  highlight: externalHighlight = false,
  onBlockUser,
  onDeleteConversation,
  onMuteNotifications,
  isBlocked = false,
  isMuted = false
}) {
  const { getUsers, selectedUser, setSelectedUser } = useChatStore();
  const [tab, setTab] = useState("images");
  const [nickname, setNickname] = useState(initialNickname);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlight, setHighlight] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);

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

  React.useEffect(() => {
    setNickname(initialNickname);
  }, [initialNickname]);

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

  // Update relationship label for friends
  const LABEL_OPTIONS = [
    { key: "family", label: "Gia đình" },
    { key: "bestie", label: "Bạn thân" },
    { key: "coworker", label: "Đồng nghiệp" },
    { key: "friend", label: "Bạn bè" },
  ];

  const handleUpdateLabel = async (labelKey) => {
    try {
      await axiosInstance.put(`/api/auth/label/${user._id}`, { label: labelKey });
      toast.success("Đã cập nhật nhóm quan hệ");
      // Cập nhật ngay trong UI
      if (selectedUser?._id === user._id) {
        setSelectedUser({ ...selectedUser, label: labelKey, relation: 'friend' });
      }
      // Refresh Sidebar list để filter hoạt động
      await getUsers();
      // Thông báo toàn app (Sidebar, FriendsList) để tự refresh
      window.dispatchEvent(new CustomEvent('label-updated', { detail: { userId: user._id, label: labelKey } }));
    } catch {
      toast.error("Cập nhật thất bại");
    }
  };

  const handleAction = (action) => {
    switch (action) {
      case "call":
        toast.success("Đang kết nối cuộc gọi...");
        break;
      case "video":
        toast.success("Đang kết nối video call...");
        break;
      case "message":
        onClose();
        break;
    }
  };

  const handleSetting = async (setting) => {
    switch (setting) {
      case "mute":
        try {
          await onMuteNotifications?.(!isMuted);
          toast.success(isMuted ? "Đã bật thông báo" : "Đã tắt thông báo");
        } catch (error) {
          toast.error("Thao tác thất bại");
        }
        break;
      case "block":
        setShowBlockConfirm(true);
        break;
      case "delete":
        setShowDeleteConfirm(true);
        break;
    }
  };

  const handleBlockUser = async () => {
    try {
      await onBlockUser?.(!isBlocked);
      toast.success(isBlocked ? "Đã bỏ chặn người dùng" : "Đã chặn người dùng");
      setShowBlockConfirm(false);
    } catch (error) {
      toast.error("Thao tác thất bại");
    }
  };

  const handleDeleteConversation = async () => {
    try {
      await onDeleteConversation?.();
      toast.success("Đã xóa cuộc trò chuyện");
      setShowDeleteConfirm(false);
      onClose();
    } catch (error) {
      toast.error("Xóa cuộc trò chuyện thất bại");
    }
  };

  if (!open) return null;

  return (
    <>
      <div className={`fixed top-0 right-0 w-full max-w-sm h-full bg-base-100 shadow-2xl z-50 flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`} style={{ borderTopLeftRadius: 24, borderBottomLeftRadius: 24 }}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-base-300 bg-base-100/80 backdrop-blur-md">
          <h2 className="font-bold text-lg">Thông tin người dùng</h2>
          <button onClick={onClose} className="btn btn-circle btn-sm btn-ghost hover:bg-base-200">
            <X size={20} />
          </button>
        </div>

        {/* Avatar + Tên + Biệt danh */}
        <div className="flex flex-col items-center p-6 border-b border-base-200 bg-gradient-to-b from-base-100 to-base-50">
          <div className="relative">
            <img
              src={user.profilePic || "/avatar.png"}
              alt={user.fullName}
              className="w-24 h-24 rounded-full object-cover border-4 border-primary mb-2 shadow-lg hover:scale-105 transition-transform duration-300"
            />
            {isBlocked && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <Shield size={12} className="text-white" />
              </div>
            )}
          </div>
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

        {/* Quick Actions */}
        <div className="p-4 border-b border-base-200 bg-base-50">
          <h4 className="text-sm font-semibold mb-3 text-base-content/70">Hành động nhanh</h4>
          <div className="grid grid-cols-3 gap-2">
            {ACTIONS.map(action => (
              <button
                key={action.key}
                onClick={() => handleAction(action.key)}
                className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all duration-200 ${action.bgColor}`}
              >
                <div className={action.color}>{action.icon}</div>
                <span className="text-xs font-medium">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div className="p-4 border-b border-base-200 bg-base-50">
          <h4 className="text-sm font-semibold mb-3 text-base-content/70">Cài đặt</h4>
          <div className="space-y-2">
            {SETTINGS.map(setting => (
              <button
                key={setting.key}
                onClick={() => handleSetting(setting.key)}
                className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all duration-200 ${setting.bgColor}`}
              >
                <div className={setting.color}>
                  {setting.key === "mute" && isMuted ? setting.activeIcon : setting.icon}
                </div>
                <span className="text-sm font-medium flex-1 text-left">
                  {setting.key === "mute" && isMuted ? "Bật thông báo" : setting.label}
                </span>
                {setting.key === "mute" && isMuted && (
                  <VolumeX size={16} className="text-orange-600" />
                )}
              </button>
            ))}
          </div>
          {/* Relationship label (visible only when friend) */}
          {(user.relation === 'friend' || selectedUser?.relation === 'friend') && (
            <div className="mt-4">
              <div className="text-sm font-semibold mb-2 text-base-content/70">Nhóm quan hệ</div>
              <div className="flex flex-wrap gap-2">
                {LABEL_OPTIONS.map(opt => (
                  <button key={opt.key} className={`btn btn-xs ${(user.label || selectedUser?.label) === opt.key ? 'btn-primary' : 'btn-outline'}`} onClick={() => handleUpdateLabel(opt.key)}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}
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
              {images.length === 0 && <div className="col-span-3 text-center text-base-content/50 py-8">Chưa có ảnh</div>}
              {images.map((img, idx) => (
                <img key={idx} src={img.url} alt="img" className="w-full h-24 object-cover rounded shadow hover:scale-105 transition-transform duration-200 cursor-pointer" />
              ))}
            </div>
          )}
          {tab === "videos" && (
            <div className="space-y-2">
              {videos.length === 0 && <div className="text-center text-base-content/50 py-8">Chưa có video</div>}
              {videos.map((vid, idx) => (
                <video key={idx} src={vid.url} controls className="w-full rounded shadow" />
              ))}
            </div>
          )}
          {tab === "files" && (
            <div className="space-y-2">
              {files.length === 0 && <div className="text-center text-base-content/50 py-8">Chưa có file</div>}
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
              {links.length === 0 && <div className="text-center text-base-content/50 py-8">Chưa có link</div>}
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
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar size={14} />
              <span>Ngày bắt đầu: <b>{chatInfo?.startedAt ? new Date(chatInfo.startedAt).toLocaleDateString() : "-"}</b></span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare size={14} />
              <span>Tổng số tin nhắn: <b>{chatInfo?.totalMessages ?? "-"}</b></span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14} />
              <span>Hoạt động lần cuối: <b>{user.lastSeen ? new Date(user.lastSeen).toLocaleString() : "-"}</b></span>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-60">
          <div className="bg-base-100 rounded-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Xóa cuộc trò chuyện</h3>
                <p className="text-base-content/70 text-sm">Hành động này không thể hoàn tác</p>
              </div>
            </div>
            <p className="text-base-content/80 mb-6">
              Bạn có chắc chắn muốn xóa toàn bộ cuộc trò chuyện với <b>{user.fullName}</b>? Tất cả tin nhắn sẽ bị mất vĩnh viễn.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn btn-ghost flex-1"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteConversation}
                className="btn btn-error flex-1"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Block Confirmation Modal */}
      {showBlockConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-60">
          <div className="bg-base-100 rounded-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Shield size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg">
                  {isBlocked ? "Bỏ chặn người dùng" : "Chặn người dùng"}
                </h3>
                <p className="text-base-content/70 text-sm">
                  {isBlocked ? "Người dùng sẽ có thể nhắn tin với bạn" : "Người dùng sẽ không thể nhắn tin với bạn"}
                </p>
              </div>
            </div>
            <p className="text-base-content/80 mb-6">
              {isBlocked
                ? `Bạn có chắc chắn muốn bỏ chặn ${user.fullName}?`
                : `Bạn có chắc chắn muốn chặn ${user.fullName}? Họ sẽ không thể nhắn tin hoặc gọi cho bạn.`
              }
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowBlockConfirm(false)}
                className="btn btn-ghost flex-1"
              >
                Hủy
              </button>
              <button
                onClick={handleBlockUser}
                className={`btn flex-1 ${isBlocked ? 'btn-success' : 'btn-error'}`}
              >
                {isBlocked ? 'Bỏ chặn' : 'Chặn'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}