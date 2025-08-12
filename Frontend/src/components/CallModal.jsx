import { useEffect, useRef } from "react";
import { Phone, Video, PhoneOff, VideoOff, Mic, MicOff } from "lucide-react";

const CallModal = ({ isOpen, onClose, callType, remoteUser, onAccept, onReject, onEnd, isIncoming, isRinging, localStream, remoteStream, onToggleVideo, onToggleAudio, videoEnabled, audioEnabled }) => {
    const localVideoRef = useRef();
    const remoteVideoRef = useRef();

    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [localStream, remoteStream]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
            <div className="bg-base-100 rounded-xl shadow-lg p-6 relative w-full max-w-md mx-auto flex flex-col items-center">
                <button className="absolute top-2 right-2 btn btn-sm btn-circle" onClick={onClose}>
                    <span className="text-lg">×</span>
                </button>
                <div className="flex flex-col items-center gap-2 mb-4">
                    <img src={remoteUser?.profilePic || "/avatar.png"} alt="avatar" className="w-16 h-16 rounded-full object-cover" />
                    <div className="font-semibold text-lg">{remoteUser?.fullName || "Đang kết nối..."}</div>
                    <div className="text-xs text-zinc-400">{callType === "video" ? "Video call" : "Voice call"}</div>
                </div>
                {callType === "video" && (
                    <div className="flex gap-2 mb-4">
                        <video ref={localVideoRef} autoPlay muted className="w-32 h-32 bg-black rounded-lg border" />
                        <video ref={remoteVideoRef} autoPlay className="w-32 h-32 bg-black rounded-lg border" />
                    </div>
                )}
                <div className="flex gap-4 mt-4">
                    {isIncoming && isRinging ? (
                        <>
                            <button className="btn btn-success btn-circle" onClick={onAccept} title="Chấp nhận">
                                {callType === "video" ? <Video size={28} /> : <Phone size={28} />}
                            </button>
                            <button className="btn btn-error btn-circle" onClick={onReject} title="Từ chối">
                                <PhoneOff size={28} />
                            </button>
                        </>
                    ) : (
                        <button className="btn btn-error btn-circle" onClick={onEnd} title="Kết thúc cuộc gọi">
                            {callType === "video" ? <VideoOff size={28} /> : <PhoneOff size={28} />}
                        </button>
                    )}
                    <button className={`btn btn-circle ${videoEnabled ? "btn-primary" : "btn-outline"}`} onClick={onToggleVideo} title="Bật/tắt video">
                        {videoEnabled ? <Video size={22} /> : <VideoOff size={22} />}
                    </button>
                    <button className={`btn btn-circle ${audioEnabled ? "btn-primary" : "btn-outline"}`} onClick={onToggleAudio} title="Bật/tắt mic">
                        {audioEnabled ? <Mic size={22} /> : <MicOff size={22} />}
                    </button>
                </div>
                <div className="mt-4 text-xs text-zinc-400">{isRinging ? (isIncoming ? "Cuộc gọi đến..." : "Đang đổ chuông...") : "Đang kết nối..."}</div>
            </div>
        </div>
    );
};

export default CallModal;