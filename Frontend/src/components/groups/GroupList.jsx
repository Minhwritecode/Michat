import React, { useState, useEffect } from "react";
import { Search, Plus, Users, Filter, Loader2 } from "lucide-react";
import useGroupStore from "../../stores/useGroupStore";
import { useAuthStore } from "../../stores/useAuthStore";
import GroupCard from "./GroupCard";
import CreateGroupModal from "./CreateGroupModal";

const GroupList = () => {
    const { 
        groups, 
        loading, 
        error, 
        pagination, 
        fetchGroups, 
        setSelectedGroup,
        clearError 
    } = useGroupStore();

    const [searchTerm, setSearchTerm] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [filter, setFilter] = useState("all"); // all, admin, member

    useEffect(() => {
        fetchGroups(1, 10, searchTerm);
    }, [searchTerm]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchGroups(1, 10, searchTerm);
    };

    const handleLoadMore = () => {
        if (pagination.hasNext) {
            fetchGroups(pagination.currentPage + 1, 10, searchTerm);
        }
    };

    const handleGroupClick = (group) => {
        setSelectedGroup(group);
    };

    const handleOptionsClick = (group) => {
        // TODO: Show group options modal
        console.log("Group options:", group);
    };

    const { authUser } = useAuthStore();
    
    const filteredGroups = groups.filter(group => {
        if (filter === "admin") {
            return group.members.some(member => 
                member.user._id === authUser?._id && 
                (member.role === "admin" || group.owner._id === authUser?._id)
            );
        }
        return true;
    });

    if (loading && groups.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-base-content/70">Đang tải danh sách nhóm...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Nhóm của tôi</h2>
                    <p className="text-base-content/70">
                        {pagination.totalGroups} nhóm • {filteredGroups.length} hiển thị
                    </p>
                </div>
                
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn btn-primary btn-sm"
                >
                    <Plus size={16} />
                    Tạo nhóm
                </button>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
                <form onSubmit={handleSearch} className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm nhóm..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input input-bordered w-full pl-10 pr-4"
                        />
                    </div>
                </form>

                <div className="flex gap-2">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="select select-bordered select-sm"
                    >
                        <option value="all">Tất cả</option>
                        <option value="admin">Quản trị viên</option>
                        <option value="member">Thành viên</option>
                    </select>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="alert alert-error">
                    <div className="flex items-center gap-2">
                        <span>⚠️</span>
                        <span>{error}</span>
                        <button 
                            onClick={clearError}
                            className="btn btn-sm btn-ghost ml-auto"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {/* Groups Grid */}
            {filteredGroups.length === 0 ? (
                <div className="text-center py-12">
                    <Users className="w-16 h-16 mx-auto mb-4 text-base-content/30" />
                    <h3 className="text-lg font-semibold mb-2">Chưa có nhóm nào</h3>
                    <p className="text-base-content/70 mb-6">
                        {searchTerm 
                            ? "Không tìm thấy nhóm phù hợp với từ khóa tìm kiếm"
                            : "Bạn chưa tham gia nhóm nào. Hãy tạo nhóm mới hoặc tham gia nhóm bằng mã mời!"
                        }
                    </p>
                    {!searchTerm && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="btn btn-primary"
                        >
                            <Plus size={16} />
                            Tạo nhóm đầu tiên
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredGroups.map((group) => (
                        <GroupCard
                            key={group._id}
                            group={group}
                            onClick={() => handleGroupClick(group)}
                            onOptionsClick={handleOptionsClick}
                        />
                    ))}
                </div>
            )}

            {/* Load More Button */}
            {pagination.hasNext && (
                <div className="text-center pt-6">
                    <button
                        onClick={handleLoadMore}
                        disabled={loading}
                        className="btn btn-outline btn-primary"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Đang tải...
                            </>
                        ) : (
                            "Tải thêm nhóm"
                        )}
                    </button>
                </div>
            )}

            {/* Create Group Modal */}
            <CreateGroupModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
            />
        </div>
    );
};

export default GroupList;
