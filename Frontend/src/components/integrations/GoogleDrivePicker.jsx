import { useEffect } from "react";
import { Loader2 } from "lucide-react";

const GOOGLE_CLIENT_ID = "180701485288-5qsb0tdlk7p81jkcjn7u27eqnldeuhf3.apps.googleusercontent.com";
const GOOGLE_API_KEY = "AIzaSyDhZEf5a3dyl_jGj1VzpltW8dKCtMnHZr4";
const SCOPE = "https://www.googleapis.com/auth/drive.readonly";
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];

const GoogleDrivePicker = ({ isOpen, onClose, onPick }) => {
  useEffect(() => {
    if (!isOpen) return;
    
    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/api.js";
    script.onload = () => {
      if (window.gapi) {
        window.gapi.load("client:picker", initPicker);
      }
    };
    document.body.appendChild(script);
    
    return () => {
      const existingScript = document.getElementById("google-api-script");
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, [isOpen]);

  const initPicker = () => {
    window.gapi.client.init({
      apiKey: GOOGLE_API_KEY,
      clientId: GOOGLE_CLIENT_ID,
      scope: SCOPE,
      discoveryDocs: DISCOVERY_DOCS,
    }).then(() => {
      window.gapi.auth2.getAuthInstance().signIn().then(() => {
        const view = new window.google.picker.DocsView()
          .setIncludeFolders(true)
          .setSelectFolderEnabled(false);
        
        const picker = new window.google.picker.PickerBuilder()
          .addView(view)
          .setOAuthToken(window.gapi.auth.getToken().access_token)
          .setDeveloperKey(GOOGLE_API_KEY)
          .setCallback(data => {
            if (data.action === window.google.picker.Action.PICKED) {
              onPick(data.docs[0]);
              onClose();
            }
            if (data.action === window.google.picker.Action.CANCEL) {
              onClose();
            }
          })
          .build();
        picker.setVisible(true);
      });
    }).catch(error => {
      console.error("Google Picker error:", error);
      onClose();
    });
  };

  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-base-100 rounded-xl shadow-lg p-6 w-full max-w-md relative flex flex-col items-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
        <div className="font-bold text-lg mb-2">Chọn file từ Google Drive</div>
        <div className="text-base-content/70 mb-4">Đang tải Google Picker...</div>
        <button className="btn btn-outline" onClick={onClose}>Hủy</button>
      </div>
    </div>
  );
};

export default GoogleDrivePicker; 