import { useRef, useState } from "react";
import { useChatStore } from "../../stores/useChatStore";
import { Image, Send, X, Paperclip, Smile, Video, FileText, Music, Mic, Search, Forward } from "lucide-react";
import EmojiPicker from "../emoji/EmojiPicker";
import GifPicker from "../emoji/GifPicker";
import VoiceRecorder from "../VoiceRecorder";
import MessageSearch from "../messages/MessageSearch";
import MessageForward from "../messages/MessageForward";
import toast from "react-hot-toast";

const MessageInput = ({ replyTo, editingMessage, onCancelEdit }) => {
    const [text, setText] = useState(editingMessage?.text || "");
    const [attachments, setAttachments] = useState([]);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showGifPicker, setShowGifPicker] = useState(false);
    const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
    const [showMessageSearch, setShowMessageSearch] = useState(false);
    const [showMessageForward, setShowMessageForward] = useState(false);
    const [forwardMessage, setForwardMessage] = useState(null);
    const fileInputRef = useRef(null);
    const { sendMessage, messages } = useChatStore();

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const maxSize = 10 * 1024 * 1024; // 10MB

        files.forEach(file => {
            if (file.size > maxSize) {
                toast.error(`${file.name} is too large. Max size is 10MB`);
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const fileType = getFileType(file.type);
                setAttachments(prev => [...prev, {
                    file: reader.result,
                    type: fileType,
                    filename: file.name,
                    size: file.size,
                    preview: fileType === 'image' ? reader.result : null
                }]);
            };
            reader.readAsDataURL(file);
        });
    };

    const getFileType = (mimeType) => {
        if (mimeType.startsWith('image/')) return 'image';
        if (mimeType.startsWith('video/')) return 'video';
        if (mimeType.startsWith('audio/')) return 'audio';
        return 'document';
    };

    const removeAttachment = (index) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleEmojiClick = (emoji) => {
        setText(prev => prev + emoji);
    };

    const handleGifSelect = (gif) => {
        setAttachments(prev => [...prev, gif]);
    };

    const handleVoiceMessage = (voiceData) => {
        setAttachments(prev => [...prev, voiceData]);
    };

    const handleMessageSearch = (message) => {
        // Scroll to message in chat
        const messageElement = document.querySelector(`[data-message-id="${message._id}"]`);
        if (messageElement) {
            messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            messageElement.classList.add('highlight');
            setTimeout(() => messageElement.classList.remove('highlight'), 2000);
        }
        setShowMessageSearch(false);
    };

    const handleForwardMessage = async (message, targetUserId) => {
        try {
            await sendMessage({
                text: `Forwarded: ${message.text || ''}`,
                attachments: message.attachments || [],
                replyTo: null,
                forwardFrom: message._id
            }, targetUserId);
        } catch (error) {
            console.error("Failed to forward message:", error);
            toast.error("Failed to forward message");
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!text.trim() && attachments.length === 0) return;

        try {
            if (editingMessage) {
                // Handle edit message
                const response = await fetch(`/api/messages/edit/${editingMessage._id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ text: text.trim() }),
                    credentials: 'include'
                });

                if (!response.ok) throw new Error('Failed to edit message');

                onCancelEdit();
            } else {
                // Handle new message
                await sendMessage({
                    text: text.trim(),
                    attachments: attachments.map(att => ({
                        file: att.file,
                        type: att.type,
                        filename: att.filename,
                        size: att.size
                    })),
                    replyTo: replyTo?._id
                });
            }

            // Clear form
            setText("");
            setAttachments([]);
            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (error) {
            console.error("Failed to send message:", error);
            toast.error("Failed to send message");
        }
    };

    return (
        <div className="p-4 w-full">
            {/* Attachments Preview */}
            {attachments.length > 0 && (
                <div className="mb-3 flex items-center gap-2 flex-wrap">
                    {attachments.map((attachment, index) => (
                        <div key={index} className="relative">
                            {attachment.preview ? (
                                <img
                                    src={attachment.preview}
                                    alt="Preview"
                                    className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
                                />
                            ) : (
                                <div className="w-20 h-20 bg-base-200 rounded-lg border border-zinc-700 flex items-center justify-center">
                                    {attachment.type === 'video' && <Video className="w-6 h-6" />}
                                    {attachment.type === 'audio' && <Music className="w-6 h-6" />}
                                    {attachment.type === 'document' && <FileText className="w-6 h-6" />}
                                </div>
                            )}
                            <button
                                onClick={() => removeAttachment(index)}
                                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
                        flex items-center justify-center hover:bg-base-100"
                                type="button"
                            >
                                <X className="size-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <div className="flex-1 flex gap-2">
                    <input
                        type="text"
                        className="w-full input input-bordered rounded-lg input-sm sm:input-md"
                        placeholder="Type a message..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />

                    {/* File Upload */}
                    <input
                        type="file"
                        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                        multiple
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />

                    {/* Action Buttons */}
                    <div className="flex gap-1">
                        <button
                            type="button"
                            className={`btn btn-circle btn-sm ${attachments.length > 0 ? "text-emerald-500" : "text-zinc-400"}`}
                            onClick={() => fileInputRef.current?.click()}
                            title="Attach files"
                        >
                            <Paperclip size={18} />
                        </button>

                        <button
                            type="button"
                            className="btn btn-circle btn-sm text-zinc-400 hover:text-zinc-200 relative"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            title="Emoji"
                        >
                            <Smile size={18} />
                            {showEmojiPicker && (
                                <EmojiPicker
                                    onEmojiClick={handleEmojiClick}
                                    onClose={() => setShowEmojiPicker(false)}
                                />
                            )}
                        </button>

                        <button
                            type="button"
                            className="btn btn-circle btn-sm text-zinc-400 hover:text-zinc-200 relative"
                            onClick={() => setShowGifPicker(!showGifPicker)}
                            title="GIF"
                        >
                            <Image size={18} />
                            {showGifPicker && (
                                <GifPicker
                                    onGifSelect={handleGifSelect}
                                    onClose={() => setShowGifPicker(false)}
                                />
                            )}
                        </button>

                        <button
                            type="button"
                            className="btn btn-circle btn-sm text-zinc-400 hover:text-zinc-200"
                            onClick={() => setShowVoiceRecorder(!showVoiceRecorder)}
                            title="Voice message"
                        >
                            <Mic size={18} />
                        </button>

                        <button
                            type="button"
                            className="btn btn-circle btn-sm text-zinc-400 hover:text-zinc-200"
                            onClick={() => setShowMessageSearch(true)}
                            title="Search messages"
                        >
                            <Search size={18} />
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    className="btn btn-sm btn-circle"
                    disabled={!text.trim() && attachments.length === 0}
                >
                    {editingMessage ? <Edit size={22} /> : <Send size={22} />}
                </button>
            </form>

            {/* Voice Recorder */}
            {showVoiceRecorder && (
                <VoiceRecorder
                    onVoiceMessage={handleVoiceMessage}
                />
            )}

            {/* Message Search Modal */}
            {showMessageSearch && (
                <MessageSearch
                    messages={messages}
                    onMessageClick={handleMessageSearch}
                    onClose={() => setShowMessageSearch(false)}
                />
            )}

            {/* Message Forward Modal */}
            {showMessageForward && forwardMessage && (
                <MessageForward
                    message={forwardMessage}
                    onClose={() => {
                        setShowMessageForward(false);
                        setForwardMessage(null);
                    }}
                    onForward={handleForwardMessage}
                />
            )}
        </div>
    );
};
export default MessageInput;
