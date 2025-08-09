import { useState } from "react";
import CreateStoryModal from "./CreateStoryModal";

const CreateStory = ({ onCreated }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className="w-full flex justify-center mb-6">
            <button className="btn btn-primary" onClick={() => setOpen(true)}>
                Tạo story
            </button>
            <CreateStoryModal
                isOpen={open}
                onClose={() => setOpen(false)}
                onCreated={onCreated}
            />
        </div>
    );
};

export default CreateStory;