import { useRef, useState } from "react";
import toast from "react-hot-toast";

const CreateStory = ({ onCreated }) => {
    const [text, setText] = useState("");
    const [media, setMedia] = useState(null);
    const [preview, setPreview] = useState(null);
    const fileInputRef = useRef();
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setMedia(reader.result);
            setPreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const res = await fetch("/story", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ text, media })
        });
        setLoading(false);
        if (res.ok) {
            toast.success("Đã tạo story!");
            setText("");
            setMedia(null);
            setPreview(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            onCreated && onCreated();
        } else {
            toast.error("Tạo story thất bại!");
        }
    };

    return (
        <form className="bg-base-100 rounded-xl shadow p-4 mb-6 max-w-xs mx-auto flex flex-col gap-3" onSubmit={handleSubmit}>
            <textarea
                className="textarea textarea-bordered"
                placeholder="Bạn đang nghĩ gì?"
                value={text}
                onChange={e => setText(e.target.value)}
                rows={2}
            />
            {preview && (
                <img src={preview} alt="preview" className="w-full rounded-lg max-h-40 object-cover" />
            )}
            <div className="flex gap-2">
                <input
                    type="file"
                    accept="image/*,video/*"
                    className="file-input file-input-bordered file-input-sm"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                />
                <button className="btn btn-primary btn-sm flex-1" type="submit" disabled={loading}>
                    {loading ? "Đang đăng..." : "Đăng story"}
                </button>
            </div>
        </form>
    );
};

export default CreateStory;