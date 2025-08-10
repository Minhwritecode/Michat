
import { useState } from "react";
import { X, Phone, Video } from "lucide-react";
import { useAuthStore } from "../../stores/useAuthStore";
import { useChatStore } from "../../stores/useChatStore";
import UserInfoSidebar from "../UserInfoSidebar";
import toast from "react-hot-toast";
import axiosInstance from "../../libs/axios";

// Thêm keyframes animation vào stylesheet (có thể đặt trong file CSS global hoặc dùng styled-components)
const styles = `
  @keyframes ring {
    0% { transform: rotate(0deg) scale(1); }
    25% { transform: rotate(5deg) scale(1.1); }
    50% { transform: rotate(-5deg) scale(1.1); }
    75% { transform: rotate(5deg) scale(1.1); }
    100% { transform: rotate(0deg) scale(1); }
  }
  .btn-ring:hover {
    animation: ring 0.5s ease-in-out infinite;
  }
`;

const ChatHeader = ({ startCall }) => {
  const { selectedUser, setSelectedUser, messages, isUserMuted, setMuteForUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [showInfo, setShowInfo] = useState(false);
  const [nickname, setNickname] = useState(selectedUser.nickname || "");

  const userMessages = messages.filter(m =>
    m.senderId === selectedUser._id || m.receiverId === selectedUser._id
  );

  const chatInfo = {
    startedAt: userMessages.length > 0 ? userMessages[0].createdAt : null,
    totalMessages: userMessages.length,
  };

  const handleUpdateNickname = async (newNickname) => {
    try {
      await axiosInstance.put("/api/auth/nickname", { nickname: newNickname });
      setNickname(newNickname);
      toast.success("Đã cập nhật biệt danh!");
    } catch {
      toast.error("Cập nhật biệt danh thất bại!");
    }
  };

  return (
    <>
      {/* Thêm style động */}
      <style>{styles}</style>
      
      <div className="p-2.5 border-b border-base-300 relative">
        <div className="flex items-center justify-between">
          {/* Phần thông tin người dùng (giữ nguyên) */}
          <div className="flex items-center gap-3">
            <div className="avatar">
              <div className="size-10 rounded-full relative cursor-pointer" onClick={() => setShowInfo(true)}>
                <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
              </div>
            </div>
            <div>
              <h3 className="font-medium">{selectedUser.fullName}</h3>
              <p className="text-sm text-base-content/70">
                {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
              </p>
            </div>
          </div>

          {/* Nút close (giữ nguyên) */}
          <button 
            onClick={() => setSelectedUser(null)} 
            className="btn btn-circle btn-ghost btn-sm hover:bg-error/20 hover:text-error transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nhóm nút gọi với hiệu ứng đặc biệt */}
        <div className="flex gap-2 absolute top-1/2 -translate-y-1/2 right-16 z-10">
          <button
            className="btn btn-sm btn-circle btn-primary shadow-lg 
                      hover:scale-110 transition-all duration-300 
                      btn-ring hover:bg-green-500 hover:shadow-green-500/50"
            title="Gọi thoại"
            onClick={() => startCall("voice")}
          >
            <Phone size={18} className="hover:animate-pulse" />
          </button>
          <button
            className="btn btn-sm btn-circle btn-primary shadow-lg 
                      hover:scale-110 transition-all duration-300 
                      btn-ring hover:bg-blue-500 hover:shadow-blue-500/50"
            title="Gọi video"
            onClick={() => startCall("video")}
          >
            <Video size={18} className="hover:animate-pulse" />
          </button>
        </div>
      </div>
            
      {/* User Info Sidebar */}
      <UserInfoSidebar
        user={selectedUser}
        messages={userMessages}
        open={showInfo}
        onClose={() => setShowInfo(false)}
        onUpdateNickname={handleUpdateNickname}
        chatInfo={chatInfo}
        nickname={nickname}
        isMuted={isUserMuted(selectedUser._id)}
        onMuteNotifications={async (next) => {
          setMuteForUser(selectedUser._id, next);
        }}
      />
    </>
  );
};

export default ChatHeader;