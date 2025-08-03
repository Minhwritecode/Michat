import { useChatStore } from "../../stores/useChatStore";
import { useEffect, useRef, useState, useCallback } from "react";
import ChatHeader from "../chat/ChatHeader";
import MessageInput from "../messages/MessageInput";
import MessageSkeleton from "../skeletons/MessageSkeleton";
import Message from "../messages/Message";
import { useAuthStore } from "../../stores/useAuthStore";
import { Phone, Video, ChevronDown } from "lucide-react";
import CallModal from "../CallModal";
import { createPeerConnection, getUserMedia, stopStream } from "../../libs/webrtc";
import toast from "react-hot-toast";

const ChatContainer = () => {
    const {
        messages,
        getMessages,
        isMessagesLoading,
        selectedUser,
        subscribeToMessages,
        unsubscribeFromMessages,
    } = useChatStore();
    const { authUser, socket } = useAuthStore();
    const messageEndRef = useRef(null);
    const messageListRef = useRef(null);
    const [replyToMessage, setReplyToMessage] = useState(null);
    const [editingMessage, setEditingMessage] = useState(null);
    const [callOpen, setCallOpen] = useState(false);
    const [callType, setCallType] = useState("voice");
    const [isRinging, setIsRinging] = useState(false);
    const [isIncoming, setIsIncoming] = useState(false);
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [showScrollToBottom, setShowScrollToBottom] = useState(false);
    const [isScrolling, setIsScrolling] = useState(false);
    const pcRef = useRef(null);
    const remoteUserRef = useRef(null);

    useEffect(() => {
        getMessages(selectedUser._id);
        subscribeToMessages();
        return () => unsubscribeFromMessages();
    }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

    // Smooth scroll to bottom with animation
    const scrollToBottom = useCallback((behavior = "smooth") => {
        if (messageEndRef.current) {
            messageEndRef.current.scrollIntoView({ 
                behavior, 
                block: "end" 
            });
        }
    }, []);

    // Auto scroll to bottom when new messages arrive
    useEffect(() => {
        if (messages && messages.length > 0) {
            const messageList = messageListRef.current;
            if (messageList) {
                const isNearBottom = messageList.scrollHeight - messageList.scrollTop - messageList.clientHeight < 100;
                if (isNearBottom) {
                    scrollToBottom();
                }
            }
        }
    }, [messages, scrollToBottom]);

    // Handle scroll events
    const handleScroll = useCallback(() => {
        if (!messageListRef.current) return;
        
        const messageList = messageListRef.current;
        const isNearBottom = messageList.scrollHeight - messageList.scrollTop - messageList.clientHeight < 100;
        setShowScrollToBottom(!isNearBottom);
        
        // Debounce scroll indicator
        setIsScrolling(true);
        clearTimeout(scrollTimeout.current);
        scrollTimeout.current = setTimeout(() => setIsScrolling(false), 150);
    }, []);

    const scrollTimeout = useRef(null);

    // Message handlers - moved up to avoid ReferenceError
    const handleReply = (message) => {
        setReplyToMessage(message);
        setEditingMessage(null);
    };

    const handleEdit = (message) => {
        setEditingMessage(message);
        setReplyToMessage(null);
    };

    const handleForward = () => {
        // This will be handled by MessageInput component
    };

    const handleCancelReply = () => {
        setReplyToMessage(null);
    };

    const handleCancelEdit = () => {
        setEditingMessage(null);
    };

    // WebRTC Call handlers (giữ nguyên)
    useEffect(() => {
        if (!socket) return;

        // Nhận cuộc gọi đến
        const handleIncomingCall = async ({ from, offer, callType }) => {
            try {
                remoteUserRef.current = from;
                setCallType(callType);
                setCallOpen(true);
                setIsIncoming(true);
                setIsRinging(true);

                const stream = await getUserMedia({
                    audio: true,
                    video: callType === "video"
                });
                setLocalStream(stream);

                const pc = createPeerConnection({
                    onTrack: (event) => {
                        setRemoteStream(event.streams[0]);
                        setIsRinging(false);
                    },
                    onIceCandidate: (candidate) => {
                        socket.emit("call:ice-candidate", { to: from, candidate });
                    }
                });

                stream.getTracks().forEach(track => pc.addTrack(track, stream));
                pcRef.current = pc;

                await pc.setRemoteDescription(new RTCSessionDescription(offer));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);

                socket.emit("call:answer", { to: from, answer });
            } catch (error) {
                console.error("Error handling incoming call:", error);
                toast.error("Không thể truy cập camera/mic");
                handleEndCall();
            }
        };

        // Nhận answer
        const handleCallAnswer = async ({ answer }) => {
            try {
                await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
                setIsRinging(false);
            } catch (error) {
                console.error("Error setting remote description:", error);
            }
        };

        // Nhận ICE candidate
        const handleIceCandidate = async ({ candidate }) => {
            try {
                if (candidate && pcRef.current) {
                    await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
                }
            } catch (error) {
                console.error("Error adding ICE candidate:", error);
            }
        };

        // Kết thúc cuộc gọi
        const handleCallEnd = () => {
            handleEndCall();
        };

        socket.on("call:incoming", handleIncomingCall);
        socket.on("call:answer", handleCallAnswer);
        socket.on("call:ice-candidate", handleIceCandidate);
        socket.on("call:end", handleCallEnd);

        return () => {
            socket.off("call:incoming", handleIncomingCall);
            socket.off("call:answer", handleCallAnswer);
            socket.off("call:ice-candidate", handleIceCandidate);
            socket.off("call:end", handleCallEnd);
        };
    }, [socket]);

    const handleEndCall = () => {
        if (pcRef.current) {
            pcRef.current.close();
            pcRef.current = null;
        }
        stopStream(localStream);
        stopStream(remoteStream);
        setCallOpen(false);
        setLocalStream(null);
        setRemoteStream(null);
        setIsRinging(false);
        setIsIncoming(false);
        remoteUserRef.current = null;
    };

    const startCall = async (type) => {
        try {
            setCallType(type);
            setCallOpen(true);
            setIsRinging(true);
            setIsIncoming(false);
            remoteUserRef.current = selectedUser._id;

            const stream = await getUserMedia({
                audio: true,
                video: type === "video"
            });
            setLocalStream(stream);

            const pc = createPeerConnection({
                onTrack: (event) => {
                    setRemoteStream(event.streams[0]);
                    setIsRinging(false);
                },
                onIceCandidate: (candidate) => {
                    socket.emit("call:ice-candidate", { to: selectedUser._id, candidate });
                }
            });

            stream.getTracks().forEach(track => pc.addTrack(track, stream));
            pcRef.current = pc;

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            socket.emit("call:user", {
                to: selectedUser._id,
                offer,
                callType: type,
                from: authUser._id
            });
        } catch (error) {
            console.error("Error starting call:", error);
            toast.error("Không thể truy cập camera/mic");
            handleEndCall();
        }
    };

    const handleAcceptCall = () => {
        setIsRinging(false);
    };

    const handleRejectCall = () => {
        if (remoteUserRef.current) {
            socket.emit("call:end", { to: remoteUserRef.current });
        }
        handleEndCall();
    };

    const handleToggleVideo = () => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setVideoEnabled(videoTrack.enabled);
            }
        }
    };

    const handleToggleAudio = () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setAudioEnabled(audioTrack.enabled);
            }
        }
    };

    if (isMessagesLoading) {
        return (
            <div className="flex-1 flex flex-col overflow-hidden">
                <ChatHeader />
                <div className="flex-1 overflow-y-auto">
                    <MessageSkeleton />
                </div>
                <MessageInput
                    replyTo={replyToMessage}
                    editingMessage={editingMessage}
                    onCancelReply={handleCancelReply}
                    onCancelEdit={handleCancelEdit}
                />
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col overflow-hidden relative">
            <ChatHeader />

            {/* Reply/Edit Preview with smooth animation */}
            {(replyToMessage || editingMessage) && (
                <div className="bg-base-200 border-b border-base-300 p-3 animate-slide-down">
                    <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-primary">
                                {replyToMessage ? "Replying to:" : "Editing message:"}
                            </div>
                            <div className="text-sm opacity-70 truncate">
                                {replyToMessage?.text || editingMessage?.text}
                            </div>
                        </div>
                        <button 
                            onClick={replyToMessage ? handleCancelReply : handleCancelEdit}
                            className="btn btn-circle btn-xs btn-ghost ml-2 flex-shrink-0"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

            {/* Message List with optimized scroll */}
            <div 
                ref={messageListRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
                onScroll={handleScroll}
                style={{ scrollBehavior: 'smooth' }}
            >
                {messages.map((message, index) => (
                    <div
                        key={message._id}
                        className={`animate-fade-in-up`}
                        style={{ 
                            animationDelay: `${Math.min(index * 50, 500)}ms`,
                            animationFillMode: 'both'
                        }}
                    >
                        <Message
                            message={message}
                            onReply={handleReply}
                            onEdit={handleEdit}
                            onForward={handleForward}
                        />
                    </div>
                ))}
                <div ref={messageEndRef} />
            </div>

            {/* Scroll to bottom button */}
            {showScrollToBottom && (
                <button
                    onClick={() => scrollToBottom()}
                    className={`fixed bottom-20 right-4 btn btn-circle btn-primary shadow-lg transition-all duration-300 z-20 ${
                        isScrolling ? 'scale-110' : 'scale-100'
                    }`}
                    title="Scroll to bottom"
                >
                    <ChevronDown size={20} />
                </button>
            )}

            {/* Message Input */}
            <div className="border-t border-base-300 bg-base-100">
                <MessageInput
                    replyTo={replyToMessage}
                    editingMessage={editingMessage}
                    onCancelReply={handleCancelReply}
                    onCancelEdit={handleCancelEdit}
                />
            </div>

            {/* Call buttons - responsive */}
            <div className="flex gap-2 absolute top-2 right-2 z-10">
                <button
                    className="btn btn-sm btn-circle btn-primary shadow-lg hover:scale-105 transition-transform duration-200"
                    title="Gọi thoại"
                    onClick={() => startCall("voice")}
                >
                    <Phone size={18} />
                </button>
                <button
                    className="btn btn-sm btn-circle btn-primary shadow-lg hover:scale-105 transition-transform duration-200"
                    title="Gọi video"
                    onClick={() => startCall("video")}
                >
                    <Video size={18} />
                </button>
            </div>

            <CallModal
                isOpen={callOpen}
                onClose={handleEndCall}
                callType={callType}
                remoteUser={selectedUser}
                onAccept={handleAcceptCall}
                onReject={handleRejectCall}
                onEnd={handleEndCall}
                isIncoming={isIncoming}
                isRinging={isRinging}
                localStream={localStream}
                remoteStream={remoteStream}
                onToggleVideo={handleToggleVideo}
                onToggleAudio={handleToggleAudio}
                videoEnabled={videoEnabled}
                audioEnabled={audioEnabled}
            />
        </div>
    );
};

export default ChatContainer;
