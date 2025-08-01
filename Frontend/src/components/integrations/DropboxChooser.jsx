import { useEffect } from "react";
import { SiDropbox } from "react-icons/si";
import { X, FileText, Image, Video, Music } from "lucide-react";

const DROPBOX_APP_KEY = "rpbboqvx38917ce";

const DropboxChooser = ({ isOpen, onClose, onPick }) => {
  useEffect(() => {
    if (!isOpen) return;
    
    if (!window.Dropbox) {
      const script = document.createElement("script");
      script.src = "https://www.dropbox.com/static/api/2/dropins.js";
      script.id = "dropboxjs";
      script.type = "text/javascript";
      script.setAttribute("data-app-key", DROPBOX_APP_KEY);
      document.body.appendChild(script);
      
      return () => {
        const existingScript = document.getElementById("dropboxjs");
        if (existingScript) {
          document.body.removeChild(existingScript);
        }
      };
    }
  }, [isOpen]);

  const openChooser = () => {
    if (!window.Dropbox) {
      console.error("Dropbox API not loaded");
      return;
    }

    window.Dropbox.choose({
      success: files => {
        if (files && files.length > 0) {
          onPick(files[0]);
        }
        onClose();
      },
      cancel: () => {
        onClose();
      },
      linkType: "preview",
      multiselect: false,
      extensions: ['.pdf', '.doc', '.docx', '.txt', '.png', '.jpg', '.jpeg', '.gif', '.mp4', '.avi', '.mov', '.mp3', '.wav', '.zip', '.rar']
    });
  };

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) return <Image size={16} />;
    if (['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(ext)) return <Video size={16} />;
    if (['mp3', 'wav', 'aac', 'ogg'].includes(ext)) return <Music size={16} />;
    return <FileText size={16} />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-base-100 rounded-xl shadow-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 btn btn-sm btn-circle"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <SiDropbox className="w-8 h-8 text-primary" />
          <div>
            <div className="font-bold text-lg">Chọn file từ Dropbox</div>
            <div className="text-sm text-base-content/70">Chọn file để chia sẻ</div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-base-200 rounded-lg p-4">
            <div className="text-sm text-base-content/70 mb-2">
              Các loại file được hỗ trợ:
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="badge badge-outline gap-1">
                <FileText size={10} />
                Documents
              </span>
              <span className="badge badge-outline gap-1">
                <Image size={10} />
                Images
              </span>
              <span className="badge badge-outline gap-1">
                <Video size={10} />
                Videos
              </span>
              <span className="badge badge-outline gap-1">
                <Music size={10} />
                Audio
              </span>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={openChooser}
              className="btn btn-primary btn-lg gap-2"
            >
              <SiDropbox size={20} />
              Chọn file từ Dropbox
            </button>
          </div>

          <div className="text-xs text-base-content/50 text-center">
            Bạn sẽ được chuyển đến Dropbox để chọn file
          </div>
        </div>
      </div>
    </div>
  );
};

export default DropboxChooser; 