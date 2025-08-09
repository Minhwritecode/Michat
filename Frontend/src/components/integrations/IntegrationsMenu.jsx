import React, { useState, useEffect } from "react";
import { X, ExternalLink } from "lucide-react";
import { SiGoogle, SiTrello, SiDropbox } from "react-icons/si";
import GoogleDrivePicker from "./GoogleDrivePicker";
import TrelloTaskModal from "./TrelloTaskModal";
import DropboxChooser from "./DropboxChooser";

const IntegrationsMenu = ({
  onFilePick,
  onTaskCreate,
  noTrigger = false,
  isOpen = false,
  onClose = () => { },
  compact = false,
  // external quick open flags
  openGoogleDrive = false,
  openTrello = false,
  openDropbox = false,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const showMenu = noTrigger ? isOpen : internalOpen;
  const setShowMenu = noTrigger ? (v) => (v ? null : onClose()) : setInternalOpen;
  const [showGoogleDrive, setShowGoogleDrive] = useState(false);
  const [showTrello, setShowTrello] = useState(false);
  const [showDropbox, setShowDropbox] = useState(false);

  // Open modals from external triggers
  useEffect(() => {
    if (openGoogleDrive) setShowGoogleDrive(true);
  }, [openGoogleDrive]);
  useEffect(() => {
    if (openTrello) setShowTrello(true);
  }, [openTrello]);
  useEffect(() => {
    if (openDropbox) setShowDropbox(true);
  }, [openDropbox]);

  const integrations = [
    {
      id: "google-drive",
      name: "Google Drive",
      icon: SiGoogle,
      description: "Chọn file từ Google Drive",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      onClick: () => setShowGoogleDrive(true)
    },
    {
      id: "trello",
      name: "Trello",
      icon: SiTrello,
      description: "Tạo task trên Trello",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      onClick: () => setShowTrello(true)
    },
    {
      id: "dropbox",
      name: "Dropbox",
      icon: SiDropbox,
      description: "Chọn file từ Dropbox",
      color: "text-blue-700",
      bgColor: "bg-blue-50",
      onClick: () => setShowDropbox(true)
    }
  ];

  const handleFilePick = (file) => {
    onFilePick(file);
    setShowMenu(false);
  };

  const handleTaskCreate = (task) => {
    onTaskCreate(task);
    setShowMenu(false);
  };

  return (
    <>
      <div className="relative">
        {showMenu && (
          <div className={`absolute ${compact ? 'bottom-12 right-0' : 'bottom-full right-0 mb-2'} ${compact ? 'w-64' : 'w-80'} bg-base-100 rounded-xl shadow-lg border border-base-300 p-4 z-50`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Tích hợp bên thứ ba</h3>
              <button
                onClick={() => setShowMenu(false)}
                className="btn btn-sm btn-circle"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2">
              {integrations.map((integration) => {
                const IconComponent = integration.icon;
                return (
                  <button
                    key={integration.id}
                    onClick={integration.onClick}
                    className="w-full p-3 rounded-lg hover:bg-base-200 transition-colors flex items-center gap-3 group"
                  >
                    <div className={`p-2 rounded-lg ${integration.bgColor}`}>
                      <IconComponent className={`w-5 h-5 ${integration.color}`} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium">{integration.name}</div>
                      <div className="text-sm text-base-content/70">
                        {integration.description}
                      </div>
                    </div>
                    <ExternalLink
                      size={16}
                      className="text-base-content/30 group-hover:text-base-content/60 transition-colors"
                    />
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-base-300">
              <div className="text-xs text-base-content/50">
                Tích hợp với các dịch vụ bên ngoài để chia sẻ file và tạo task
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Google Drive Picker */}
      <GoogleDrivePicker
        isOpen={showGoogleDrive}
        onClose={() => setShowGoogleDrive(false)}
        onPick={handleFilePick}
      />

      {/* Trello Task Modal */}
      <TrelloTaskModal
        isOpen={showTrello}
        onClose={() => setShowTrello(false)}
        onCreate={handleTaskCreate}
      />

      {/* Dropbox Chooser */}
      <DropboxChooser
        isOpen={showDropbox}
        onClose={() => setShowDropbox(false)}
        onPick={handleFilePick}
      />
    </>
  );
};

export default IntegrationsMenu; 