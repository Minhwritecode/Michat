import { useRef, useState } from "react";
import ScreenShareButton from "./ScreenShareButton";

const VideoCall = ({ peerConnection }) => {
  const [isSharing, setIsSharing] = useState(false);
  const screenStreamRef = useRef(null);

  const handleStartScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      screenStreamRef.current = screenStream;
      // Gửi screenStream qua peer connection (WebRTC)
      // peerConnection.addTrack(screenStream.getVideoTracks()[0], screenStream);
      setIsSharing(true);
      // Khi user dừng chia sẻ từ trình duyệt
      screenStream.getVideoTracks()[0].onended = () => {
        handleStopScreenShare();
      };
    } catch (err) {
      // User từ chối hoặc lỗi
    }
  };

  const handleStopScreenShare = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }
    // Gửi tín hiệu dừng chia sẻ qua peer connection nếu cần
    setIsSharing(false);
  };

  return (
    <div className="flex gap-2 items-center">
      {/* ... các nút khác ... */}
      <ScreenShareButton
        onStart={handleStartScreenShare}
        onStop={handleStopScreenShare}
        isSharing={isSharing}
      />
      {isSharing && (
        <span className="ml-2 text-xs text-error font-semibold animate-pulse">
          Bạn đang chia sẻ màn hình!
        </span>
      )}
    </div>
  );
};

export default VideoCall;