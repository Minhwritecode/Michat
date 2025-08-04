import { useRef, useState, useEffect } from "react";
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
    Bot,
    Plus
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
import clsx from "clsx";
import EmojiGifStickerSuggest from "./EmojiGifStickerSuggest";
import EmotionSelector from "./EmotionSelector";
import useDraftStore from "../../stores/useDraftStore";

const ACTIONS = [
  {
    icon: <Paperclip size={18} />, title: "Đính kèm file", onClick: (fileInputRef, setShowActions) => {fileInputRef.current?.click(); setShowActions(false);}
  },
  {
    icon: <Smile size={18} />, title: "Emoji", onClick: (setShowEmojiPicker, setShowActions) => {setShowEmojiPicker(v => !v); setShowActions(false);}
  },
  {
    icon: <Image size={18} />, title: "GIF", onClick: (setShowGifPicker, setShowActions) => {setShowGifPicker(v => !v); setShowActions(false);}
  },
  {
    icon: <Mic size={18} />, title: "Ghi âm", onClick: (setShowVoiceRecorder, setShowActions) => {setShowVoiceRecorder(v => !v); setShowActions(false);}
  },
  {
    icon: <Search size={18} />, title: "Tìm kiếm tin nhắn", onClick: (setShowMessageSearch, setShowActions) => {setShowMessageSearch(true); setShowActions(false);}
  },
  {
    icon: <MapPin size={18} />, title: "Chia sẻ vị trí", onClick: (setShowLocationShare, setShowActions) => {setShowLocationShare(true); setShowActions(false);}
  },
  {
    icon: <BarChart3 size={18} />, title: "Tạo poll", onClick: (setShowCreatePoll, setShowActions, group) => {if(group) setShowCreatePoll(true); setShowActions(false);}, groupOnly: true
  },
  {
    icon: <Bot size={18} />, title: "Trợ lý AI", onClick: (setShowBotModal, setShowActions) => {setShowBotModal(true); setShowActions(false);}
  }
];

const MessageInput = ({ 
    replyTo, 
    editingMessage, 
    onCancelEdit, 
    group = null, 
    privateMessageTo = null
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
    const [showActions, setShowActions] = useState(false);
    const [showSuggestPopup, setShowSuggestPopup] = useState(false);
    const [suggestPosition, setSuggestPosition] = useState({ x: 0, y: 0 });
    const [suggestTrigger, setSuggestTrigger] = useState("");
    const inputRef = useRef(null);
    const [selectedEmotion, setSelectedEmotion] = useState("neutral");
    const { saveDraft, getDraft, clearDraft } = useDraftStore();
    const currentUserId = privateMessageTo?._id || group?._id;

    // Load draft khi component mount hoặc user thay đổi
    useEffect(() => {
        if (currentUserId && !editingMessage) {
            const draft = getDraft(currentUserId);
            if (draft) {
                setText(draft.text || "");
                setAttachments(draft.attachments || []);
            }
        }
    }, [currentUserId, getDraft, editingMessage]);

    // Auto-save draft khi text hoặc attachments thay đổi
    useEffect(() => {
        if (currentUserId && !editingMessage) {
            const draftData = {
                text: text,
                attachments: attachments
            };
            
            // Debounce để tránh lưu quá nhiều
            const timeoutId = setTimeout(() => {
                if (text.trim() || attachments.length > 0) {
                    saveDraft(currentUserId, draftData);
                } else {
                    clearDraft(currentUserId);
                }
            }, 1000);

            return () => clearTimeout(timeoutId);
        }
    }, [text, attachments, currentUserId, editingMessage, saveDraft, clearDraft]);

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
                    replyTo: replyTo?._id,
                    emotion: selectedEmotion
                });
            }

            // Clear form and draft
            setText("");
            setAttachments([]);
            setSelectedEmotion("neutral");
            if (currentUserId) {
                clearDraft(currentUserId);
            }
            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (error) {
            console.error("Failed to send message:", error);
            toast.error("Failed to send message");
        }
    };

    // Handle input change for suggestions
    const handleInputChange = (e) => {
        const value = e.target.value;
        setText(value);
        
        // Check for trigger characters
        const triggers = [":", "@", "#"];
        const lastChar = value.slice(-1);
        const secondLastChar = value.slice(-2, -1);
        
        if (triggers.includes(lastChar) || 
            (lastChar === " " && triggers.includes(secondLastChar))) {
            const rect = inputRef.current?.getBoundingClientRect();
            if (rect) {
                setSuggestPosition({
                    x: rect.left,
                    y: rect.bottom
                });
                setSuggestTrigger(value.slice(-1));
                setShowSuggestPopup(true);
            }
        } else if (showSuggestPopup) {
            setShowSuggestPopup(false);
        }
    };

    // Handle suggestion selection
    const handleSuggestionSelect = (suggestion) => {
        if (typeof suggestion === "string") {
            // Emoji or text
            setText(prev => prev.slice(0, -1) + suggestion);
        } else if (suggestion.type === "gif") {
            // GIF
            setAttachments(prev => [...prev, {
                file: suggestion.url,
                type: "gif",
                filename: suggestion.title,
                size: 0,
                preview: suggestion.url
            }]);
        } else if (suggestion.type === "sticker") {
            // Sticker
            setText(prev => prev.slice(0, -1) + suggestion.content);
        }
        setShowSuggestPopup(false);
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

            <form onSubmit={handleSendMessage} className="flex items-center gap-2 relative">
                <div className="flex-1 flex gap-2">
                    <input
                        ref={inputRef}
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
                        onChange={handleInputChange}
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
                </div>

                {/* Emotion Selector */}
                <EmotionSelector
                    selectedEmotion={selectedEmotion}
                    onEmotionChange={setSelectedEmotion}
                    disabled={
                        group && 
                        !group.members.find(m => 
                            m.user._id === useChatStore.getState().authUser?._id && 
                            m.isActive
                        )?.canChat
                    }
                />

                {/* Nút + để mở tiện ích */}
                <div className="relative z-30">
                    <button
                        type="button"
                        className="btn btn-circle btn-sm text-zinc-400 hover:text-zinc-200"
                        onClick={() => setShowActions(v => !v)}
                        tabIndex={-1}
                        aria-label="Tiện ích"
                    >
                        <Plus size={22} />
                    </button>
                    {/* Circle menu tiện ích */}
                    <div className={clsx(
                        "fixed left-0 top-0 w-full h-full flex items-end justify-center z-50 pointer-events-none",
                        showActions && "pointer-events-auto"
                    )}>
                        <div className={clsx(
                            "absolute bottom-20 right-8 sm:right-16 md:right-32 lg:right-64 flex items-center justify-center",
                            "transition-all duration-300",
                            showActions ? "opacity-100 scale-100" : "opacity-0 scale-90"
                        )} style={{width: 180, height: 180}}>
                            {/* Circle icons */}
                            {ACTIONS.filter(a => !a.groupOnly || group).map((action, idx, arr) => {
                                const angle = (360 / arr.length) * idx - 90; // -90 để bắt đầu từ trên
                                const radius = showActions ? 70 : 0;
                                const x = radius * Math.cos((angle * Math.PI) / 180);
                                const y = radius * Math.sin((angle * Math.PI) / 180);
                                return (
                                    <button
                                        key={action.title}
                                        type="button"
                                        title={action.title}
                                        className={clsx(
                                            "btn btn-circle btn-md absolute bg-base-100 shadow-lg border border-base-200 transition-all duration-500",
                                            showActions
                                                ? "opacity-100 scale-100 animate-circle-pop"
                                                : "opacity-0 scale-50"
                                        )}
                                        style={{
                                            left: 80 + x,
                                            top: 80 + y,
                                            transitionDelay: showActions ? `${idx * 40}ms` : `${(arr.length-idx) * 30}ms`,
                                            transform: showActions
                                                ? `translate(-50%, -50%) rotate(360deg)`
                                                : `translate(-50%, -50%) rotate(0deg)`
                                        }}
                                        onClick={() => {
                                            if (action.title === "Đính kèm file") action.onClick(fileInputRef, setShowActions);
                                            else if (action.title === "Emoji") action.onClick(setShowEmojiPicker, setShowActions);
                                            else if (action.title === "GIF") action.onClick(setShowGifPicker, setShowActions);
                                            else if (action.title === "Ghi âm") action.onClick(setShowVoiceRecorder, setShowActions);
                                            else if (action.title === "Tìm kiếm tin nhắn") action.onClick(setShowMessageSearch, setShowActions);
                                            else if (action.title === "Chia sẻ vị trí") action.onClick(setShowLocationShare, setShowActions);
                                            else if (action.title === "Tạo poll") action.onClick(setShowCreatePoll, setShowActions, group);
                                            else if (action.title === "Trợ lý AI") action.onClick(setShowBotModal, setShowActions);
                                        }}
                                    >
                                        {action.icon}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Nút gửi luôn hiển thị */}
                <button
                    type="submit"
                    className="btn btn-sm btn-circle"
                    disabled={!text.trim() && attachments.length === 0}
                >
                    {editingMessage ? <Edit size={22} /> : <Send size={22} />}
                </button>
            </form>
            <SmartSuggestions text={text} onSelect={s => setText(s)} />

            {/* Emoji/GIF/Sticker Suggestion Popup */}
            <EmojiGifStickerSuggest
                isOpen={showSuggestPopup}
                onClose={() => setShowSuggestPopup(false)}
                onSelect={handleSuggestionSelect}
                triggerText={suggestTrigger}
                position={suggestPosition}
            />

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
