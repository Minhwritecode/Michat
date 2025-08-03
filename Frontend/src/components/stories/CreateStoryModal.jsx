import { useRef, useState } from "react";
import { X, Image, Video, FileText, Upload, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

const CreateStoryModal = ({ isOpen, onClose, onCreated }) => {
    const [text, setText] = useState("");
    const [media, setMedia] = useState(null);
    const [preview, setPreview] = useState(null);
    const [mediaType, setMediaType] = useState(null);
    const fileInputRef = useRef();
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Kiểm tra kích thước file (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast.error("File quá lớn! Tối đa 10MB");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setMedia(reader.result);
            setPreview(reader.result);
            
            // Xác định loại media
            if (file.type.startsWith('image/')) {
                setMediaType('image');
            } else if (file.type.startsWith('video/')) {
                setMediaType('video');
            }
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!text.trim() && !media) {
            toast.error("Vui lòng nhập nội dung hoặc chọn ảnh/video!");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/story", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ text: text.trim(), media })
            });
            
            if (res.ok) {
                toast.success("Đã tạo story thành công! ✨");
                resetForm();
                onCreated && onCreated();
            } else {
                const error = await res.json();
                toast.error(error.message || "Tạo story thất bại!");
            }
        } catch (error) {
            toast.error("Lỗi kết nối! Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setText("");
        setMedia(null);
        setPreview(null);
        setMediaType(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleClose = () => {
        if (text.trim() || media) {
            if (confirm("Bạn có chắc muốn hủy? Nội dung sẽ bị mất.")) {
                resetForm();
                onClose();
            }
        } else {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-backdrop-fade-in">
            <div className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-modal-slide-in">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-base-300">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                            <Sparkles className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Tạo Story mới</h2>
                            <p className="text-sm text-base-content/70">Chia sẻ khoảnh khắc của bạn</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="btn btn-circle btn-sm btn-ghost hover:bg-base-200 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Text Input */}
                        <div>
                            <label className="label">
                                <span className="label-text font-medium">Nội dung story</span>
                            </label>
                            <textarea
                                className="textarea textarea-bordered w-full min-h-[120px] resize-none focus:border-primary transition-colors"
                                placeholder="Bạn đang nghĩ gì? Chia sẻ khoảnh khắc đặc biệt..."
                                value={text}
                                onChange={e => setText(e.target.value)}
                                maxLength={500}
                            />
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-xs text-base-content/50">
                                    {text.length}/500 ký tự
                                </span>
                            </div>
                        </div>

                        {/* Media Preview */}
                        {preview && (
                            <div className="relative animate-fade-in">
                                <label className="label">
                                    <span className="label-text font-medium">Media</span>
                                </label>
                                <div className="relative rounded-xl overflow-hidden border border-base-300">
                                    {mediaType === 'image' ? (
                                        <img 
                                            src={preview} 
                                            alt="Preview" 
                                            className="w-full max-h-80 object-cover"
                                        />
                                    ) : mediaType === 'video' ? (
                                        <video 
                                            src={preview} 
                                            controls 
                                            className="w-full max-h-80 object-cover"
                                        />
                                    ) : null}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMedia(null);
                                            setPreview(null);
                                            setMediaType(null);
                                            if (fileInputRef.current) fileInputRef.current.value = "";
                                        }}
                                        className="absolute top-2 right-2 btn btn-circle btn-sm bg-base-300/80 hover:bg-base-300 transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* File Upload */}
                        {!preview && (
                            <div className="animate-fade-in">
                                <label className="label">
                                    <span className="label-text font-medium">Thêm ảnh/video</span>
                                </label>
                                <div className="border-2 border-dashed border-base-300 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="bg-primary/10 p-4 rounded-full">
                                            <Upload className="w-8 h-8 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-medium mb-2">Kéo thả hoặc click để chọn file</p>
                                            <p className="text-sm text-base-content/70">
                                                Hỗ trợ: JPG, PNG, GIF, MP4 (tối đa 10MB)
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            className="btn btn-primary btn-sm"
                                        >
                                            <Image className="w-4 h-4 mr-2" />
                                            Chọn file
                                        </button>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*,video/*"
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Quick Upload Buttons */}
                        {!preview && (
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex-1 btn btn-outline btn-sm gap-2 hover:bg-base-200 transition-colors"
                                >
                                    <Image className="w-4 h-4" />
                                    Ảnh
                                </button>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex-1 btn btn-outline btn-sm gap-2 hover:bg-base-200 transition-colors"
                                >
                                    <Video className="w-4 h-4" />
                                    Video
                                </button>
                            </div>
                        )}
                    </form>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-base-300 bg-base-50">
                    <div className="flex gap-3">
                        <button
                            onClick={handleClose}
                            className="btn btn-ghost flex-1 transition-colors"
                            disabled={loading}
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="btn btn-primary flex-1 hover:scale-105 transition-transform"
                            disabled={loading || (!text.trim() && !media)}
                        >
                            {loading ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    Đang đăng...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Đăng Story
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateStoryModal; 