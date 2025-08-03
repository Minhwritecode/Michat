import { Link } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";
import { LogOut, MessageSquare, Settings, User, Users, Plus } from "lucide-react";
import { useState } from "react";
import CreateStoryModal from "./stories/CreateStoryModal";

const Navbar = () => {
    const { logout, authUser } = useAuthStore();
    const [showCreateStory, setShowCreateStory] = useState(false);
    
    return (
        <header
            className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 
    backdrop-blur-lg bg-base-100/80"
        >
            <div className="container mx-auto px-4 h-16">
                <div className="flex items-center justify-between h-full">
                    <div className="flex items-center gap-8">
                        <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-all">
                            <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                                <MessageSquare className="w-5 h-5 text-primary" />
                            </div>
                            <h1 className="text-lg font-bold">Michat</h1>
                        </Link>
                    </div>

                    <div className="flex items-center gap-2">
                        {authUser && (
                            <>
                                <button
                                    className="btn btn-sm btn-primary font-semibold gap-2 hover:scale-105 transition-transform"
                                    onClick={() => setShowCreateStory(true)}
                                >
                                    <Plus className="w-4 h-4" />
                                    Tạo Story
                                </button>
                                <Link
                                    to={"/groups"}
                                    className={`btn btn-sm gap-2 transition-colors hover:bg-base-200`}>
                                    <Users className="w-4 h-4" />
                                    <span className="hidden sm:inline">Nhóm</span>
                                </Link>
                            </>
                        )}
                        <Link
                            to={"/settings"}
                            className={`btn btn-sm gap-2 transition-colors hover:bg-base-200`}>
                            <Settings className="w-4 h-4" />
                            <span className="hidden sm:inline">Settings</span>
                        </Link>
                        {authUser && (
                            <>
                                <Link to={"/profile"} className={`btn btn-sm gap-2 hover:bg-base-200`}>
                                    <User className="size-5" />
                                    <span className="hidden sm:inline">Profile</span>
                                </Link>
                                <button 
                                    className="flex gap-2 items-center btn btn-sm btn-ghost hover:bg-base-200" 
                                    onClick={logout}
                                >
                                    <LogOut className="size-5" />
                                    <span className="hidden sm:inline">Logout</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Create Story Modal */}
            <CreateStoryModal
                isOpen={showCreateStory}
                onClose={() => setShowCreateStory(false)}
                onCreated={() => setShowCreateStory(false)}
            />
        </header>
    );
};

export default Navbar;
