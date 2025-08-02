import { useState } from "react";
import { X } from "lucide-react";
import { useAuthStore } from "../../stores/useAuthStore";
import { useChatStore } from "../../stores/useChatStore";
import UserInfoSidebar from "../UserInfoSidebar";
import toast from "react-hot-toast";
import axiosInstance from "../../libs/axios";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, messages } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [showInfo, setShowInfo] = useState(false);
  const [nickname, setNickname] = useState(selectedUser.nickname || "");

  // Lọc messages của user này (nếu cần truyền riêng)
  const userMessages = messages.filter(m =>
    m.senderId === selectedUser._id || m.receiverId === selectedUser._id
  );

  // Thông tin chat (demo, bạn có thể lấy từ backend)
  const chatInfo = {
    startedAt: userMessages.length > 0 ? userMessages[0].createdAt : null,
    totalMessages: userMessages.length,
  };

  // Hàm cập nhật biệt danh
  const handleUpdateNickname = async (newNickname) => {
    try {
      await axiosInstance.put("/auth/nickname", { nickname: newNickname });
      setNickname(newNickname);
      toast.success("Đã cập nhật biệt danh!");
    } catch {
      toast.error("Cập nhật biệt danh thất bại!");
    }
  };

  return (
    <>
      <div className="p-2.5 border-b border-base-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="avatar">
              <div className="size-10 rounded-full relative cursor-pointer" onClick={() => setShowInfo(true)}>
                <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
              </div>
            </div>
            {/* User info */}
            <div>
              <h3 className="font-medium">{selectedUser.fullName}</h3>
              <p className="text-sm text-base-content/70">
                {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
              </p>
            </div>
          </div>
          {/* Close button */}
          <button onClick={() => setSelectedUser(null)}>
            <X />
          </button>
        </div>
      </div>
      <UserInfoSidebar
        user={selectedUser}
        messages={userMessages}
        open={showInfo}
        onClose={() => setShowInfo(false)}
        onUpdateNickname={handleUpdateNickname}
        chatInfo={chatInfo}
        nickname={nickname}
      />
    </>
  );
};
export default ChatHeader;
