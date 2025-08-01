import { useRef, useState } from "react";
import { useChatStore } from "../../stores/useChatStore";
import { 
    Image, 
    Send, 
    X, 
    Paperclip, 
    Smile, 
    Video, 
    FileText, 
    Music, 
    Mic, 
    Search, 
    Forward, 
    Edit, 
    AtSign,
    MapPin,
    BarChart3,
    Bot
} from "lucide-react";
import EmojiPicker from "../emoji/EmojiPicker";
import GifPicker from "../emoji/GifPicker";
import VoiceRecorder from "../VoiceRecorder";
import MessageSearch from "../messages/MessageSearch";
import MessageForward from "../messages/MessageForward";
import LocationShare from "../location/LocationShare";
import CreatePollModal from "../polls/CreatePollModal";
import toast from "react-hot-toast";
import BotModal from "../bot/BotModal";
import SmartSuggestions from "../bot/SmartSuggestions";
import IntegrationsMenu from "../integrations/IntegrationsMenu";

const MessageInput = ({ 
    replyTo, 
    editingMessage, 
    onCancelEdit, 
    group = null, 
    privateMessageTo = null,
    onPrivateMessageChange = null 
}) => {
    const [text, setText] = useState(editingMessage?.text || "");
    const [attachments, setAttachments] = useState([]);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showGifPicker, setShowGifPicker] = useState(false);
    const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
    const [showMessageSearch, setShowMessageSearch] = useState(false);
    const [showMessageForward, setShowMessageForward] = useState(false);
    const [showLocationShare, setShowLocationShare] = useState(false);
    const [showCreatePoll, setShowCreatePoll] = useState(false);
    const [forwardMessage, setForwardMessage] = useState(null);
    const fileInputRef = useRef(null);
    const { sendMessage, messages } = useChatStore();
    const [showBotModal, setShowBotModal] = useState(false);

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
                        placeholder={
                            privateMessageTo 
                                ? `Nhắn tin riêng cho ${privateMessageTo.fullName}...`
                                : group 
                                    ? "Nhắn tin trong nhóm..."
                                    : "Type a message..."
                        }
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        disabled={
                            group && 
                            !group.members.find(m => 
                                m.user._id === useChatStore.getState().authUser?._id && 
                                m.isActive
                            )?.canChat
                        }
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

                        {/* Location Share Button */}
                        <button
                            type="button"
                            className="btn btn-circle btn-sm text-zinc-400 hover:text-zinc-200"
                            onClick={() => setShowLocationShare(true)}
                            title="Share location"
                        >
                            <MapPin size={18} />
                        </button>

                        {/* Create Poll Button (only for groups) */}
                        {group && (
                            <button
                                type="button"
                                className="btn btn-circle btn-sm text-zinc-400 hover:text-zinc-200"
                                onClick={() => setShowCreatePoll(true)}
                                title="Create poll"
                            >
                                <BarChart3 size={18} />
                            </button>
                        )}

                        <button
                            type="button"
                            className="btn btn-circle btn-sm text-zinc-400 hover:text-zinc-200"
                            onClick={() => setShowBotModal(true)}
                            title="Trợ lý AI"
                        >
                            <Bot size={18} />
                        </button>

                        <IntegrationsMenu
                            onFilePick={(file) => {
                                // Handle file pick from integrations
                                if (file.name) {
                                    setText(prev => prev + `\n📎 ${file.name}: ${file.url || file.link || file.id}`);
                                }
                            }}
                            onTaskCreate={(task) => {
                                // Handle task creation from integrations
                                setText(prev => prev + `\n📋 Task Trello: ${task.title}`);
                            }}
                        />
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
            <SmartSuggestions text={text} onSelect={s => setText(s)} />

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

            {/* Location Share Modal */}
            <LocationShare
                isOpen={showLocationShare}
                onClose={() => setShowLocationShare(false)}
                receiverId={!group ? privateMessageTo?._id : null}
                groupId={group?._id}
            />

            {/* Create Poll Modal */}
            <CreatePollModal
                isOpen={showCreatePoll}
                onClose={() => setShowCreatePoll(false)}
                groupId={group?._id}
                onPollCreated={(poll) => {
                    // Handle poll creation - you might want to add it to messages
                    console.log("Poll created:", poll);
                }}
            />

            <BotModal isOpen={showBotModal} onClose={() => setShowBotModal(false)} />
        </div>
    );
};
export default MessageInput;
