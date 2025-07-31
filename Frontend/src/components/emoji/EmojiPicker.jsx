import { useState } from "react";
import EmojiPickerReact from "emoji-picker-react";

const EmojiPicker = ({ onEmojiClick, onClose }) => {
    const [searchTerm, setSearchTerm] = useState("");

    const handleEmojiClick = (emojiObject) => {
        onEmojiClick(emojiObject.emoji);
        onClose();
    };

    return (
        <div className="absolute bottom-full left-0 mb-2 z-50">
            <div className="bg-base-300 rounded-lg shadow-lg border border-base-200">
                <EmojiPickerReact
                    onEmojiClick={handleEmojiClick}
                    searchPlaceholder="Search emoji..."
                    searchDisabled={false}
                    skinTonesDisabled={false}
                    width={300}
                    height={400}
                    previewConfig={{
                        showPreview: false
                    }}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                />
            </div>
        </div>
    );
};

export default EmojiPicker; 