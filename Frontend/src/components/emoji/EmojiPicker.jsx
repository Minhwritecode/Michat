import { useState, useEffect } from "react";
import EmojiPickerReact from "emoji-picker-react";

const EmojiPicker = ({ onEmojiClick, onClose }) => {
    const [searchTerm, setSearchTerm] = useState("");

    const handleClickOutside = (e) => {
        if (e.target.closest('.emoji-picker-react')) return;
        onClose();
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleEmojiSelect = (emojiObject) => {
        onEmojiClick(emojiObject.emoji);
        onClose();
    };

    return (
        <div className="fixed bottom-20 left-4 sm:left-8 md:left-16 z-50">
            <div className="bg-base-300 rounded-lg shadow-lg border border-base-200">
                <EmojiPickerReact
                    onEmojiClick={handleEmojiSelect}
                    searchPlaceholder="Tìm kiếm emoji..."
                    width={300}
                    height={350}
                    previewConfig={{ showPreview: false }}
                    skinTonesDisabled={false}
                    searchDisabled={false}
                    lazyLoadEmojis={true}
                    suggestedEmojisMode="frequent"
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    className="emoji-picker-react"
                />
            </div>
        </div>
    );
};

export default EmojiPicker;