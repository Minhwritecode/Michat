import { Monitor, StopCircle } from "lucide-react";

const ScreenShareButton = ({ onStart, onStop, isSharing }) => {
  return (
    <button
      className={`btn btn-sm ${isSharing ? "btn-error" : "btn-outline"} flex gap-2 items-center`}
      onClick={isSharing ? onStop : onStart}
      title={isSharing ? "Dừng chia sẻ màn hình" : "Chia sẻ màn hình"}
    >
      {isSharing ? <StopCircle size={18} /> : <Monitor size={18} />}
      {isSharing ? "Dừng chia sẻ" : "Chia sẻ màn hình"}
    </button>
  );
};

export default ScreenShareButton;