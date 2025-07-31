import React, { useState } from "react";
import { useGroupStore } from "../stores/useGroupStore";
import { useAuthStore } from "../stores/useAuthStore";
import { Users, Plus, ArrowLeft, MessageSquare } from "lucide-react";
import GroupList from "../components/groups/GroupList";
import GroupChat from "../components/groups/GroupChat";
import CreateGroupModal from "../components/groups/CreateGroupModal";

const GroupsPage = () => {
    const { selectedGroup, clearSelectedGroup } = useGroupStore();
    const { authUser } = useAuthStore();
    const [showCreateModal, setShowCreateModal] = useState(false);

    const handleBackToList = () => {
        clearSelectedGroup();
    };

    if (selectedGroup) {
        return (
            <div className="h-screen pt-20 bg-base-200">
                <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="bg-base-100 border-b border-base-300 p-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleBackToList}
                                className="btn btn-circle btn-sm btn-ghost"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <div className="flex items-center gap-3">
                                <img
                                    src={selectedGroup.avatar || "/avatar.png"}
                                    alt={selectedGroup.name}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                                <div>
                                    <h1 className="font-bold text-lg">{selectedGroup.name}</h1>
                                    <p className="text-sm text-base-content/70">
                                        {selectedGroup.members.filter(m => m.isActive).length} thành viên
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1">
                        <GroupChat group={selectedGroup} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen pt-20 bg-base-200">
            <div className="max-w-7xl mx-auto p-6">
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary text-primary-content p-3 rounded-full">
                                <Users size={24} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">Nhóm trò chuyện</h1>
                                <p className="text-base-content/70">
                                    Tạo và quản lý các nhóm trò chuyện của bạn
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="btn btn-primary btn-lg"
                        >
                            <Plus size={20} />
                            Tạo nhóm mới
                        </button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-base-100 p-6 rounded-xl shadow-lg border border-base-300">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-500 text-white p-3 rounded-full">
                                    <Users size={20} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold">0</h3>
                                    <p className="text-base-content/70">Tổng số nhóm</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-base-100 p-6 rounded-xl shadow-lg border border-base-300">
                            <div className="flex items-center gap-3">
                                <div className="bg-green-500 text-white p-3 rounded-full">
                                    <MessageSquare size={20} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold">0</h3>
                                    <p className="text-base-content/70">Tin nhắn hôm nay</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-base-100 p-6 rounded-xl shadow-lg border border-base-300">
                            <div className="flex items-center gap-3">
                                <div className="bg-purple-500 text-white p-3 rounded-full">
                                    <Users size={20} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold">0</h3>
                                    <p className="text-base-content/70">Thành viên hoạt động</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Groups List */}
                    <div className="bg-base-100 rounded-xl shadow-lg border border-base-300">
                        <GroupList />
                    </div>
                </div>

                {/* Create Group Modal */}
                <CreateGroupModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                />
            </div>
        </div>
    );
};

export default GroupsPage; 