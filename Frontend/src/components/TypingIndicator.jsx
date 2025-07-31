const TypingIndicator = ({ username }) => (
    <div className="flex items-center gap-2 text-xs text-blue-500 mt-2">
        <span className="animate-bounce">...</span>
        <span>{username} đang soạn tin nhắn</span>
    </div>
);

export default TypingIndicator;