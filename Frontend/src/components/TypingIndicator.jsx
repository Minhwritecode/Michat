const TypingDots = () => (
  <span className="typing-dots">
    <span className="dot" />
    <span className="dot" />
    <span className="dot" />
  </span>
);

const TypingIndicator = ({ username = null, avatar = null }) => (
  <div className="flex items-center gap-2 text-xs text-primary mt-2">
    {avatar && (
      <img src={avatar} alt={username || 'typing'} className="w-4 h-4 rounded-full object-cover" />
    )}
    {username && <span className="font-medium">{username}</span>}
    <TypingDots />
  </div>
);

export default TypingIndicator;