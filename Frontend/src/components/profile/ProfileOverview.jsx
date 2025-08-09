import { Camera, Mail, User } from "lucide-react";
import { useState } from "react";

const ProfileOverview = ({ user, onUpdateAvatar }) => {
    const [uploading, setUploading] = useState(false);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            try {
                setUploading(true);
                await onUpdateAvatar(reader.result);
            } finally {
                setUploading(false);
            }
        };
    };

    return (
        <div className="bg-base-100 rounded-xl p-6 shadow-lg border border-base-300">
            <div className="flex items-center gap-6">
                <div className="relative">
                    <img
                        src={user.profilePic || "/avatar.png"}
                        alt={user.fullName}
                        className="w-24 h-24 rounded-full object-cover border-4 border-primary shadow"
                    />
                    <label className="absolute -bottom-2 -right-2 btn btn-xs btn-primary rounded-full cursor-pointer">
                        <Camera size={14} />
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                </div>
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-lg font-bold">
                        <User size={16} /> {user.fullName}
                    </div>
                    <div className="flex items-center gap-2 text-base-content/70">
                        <Mail size={16} /> {user.email}
                    </div>
                    {uploading && <div className="text-xs text-base-content/60">Đang cập nhật ảnh...</div>}
                </div>
            </div>
        </div>
    );
};

export default ProfileOverview;


