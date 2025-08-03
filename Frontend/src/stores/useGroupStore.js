import { create } from "zustand";
import { devtools } from "zustand/middleware";
import axiosInstance from "../libs/axios";

const useGroupStore = create(
    devtools(
        (set, get) => ({
            // State
            groups: [],
            selectedGroup: null,
            groupMembers: [],
            loading: false,
            error: null,
            pagination: {
                currentPage: 1,
                totalPages: 1,
                totalGroups: 0,
                hasNext: false,
                hasPrev: false
            },

            // Actions
            setLoading: (loading) => set({ loading }),
            setError: (error) => set({ error }),
            clearError: () => set({ error: null }),

            // Fetch user's groups
            fetchGroups: async (page = 1, limit = 10, search = "") => {
                try {
                    set({ loading: true, error: null });
                    const response = await axiosInstance.get("/groups/my-groups", {
                        params: { page, limit, search }
                    });

                    const { groups, pagination } = response.data.data;
                    set({
                        groups: page === 1 ? groups : [...get().groups, ...groups],
                        pagination,
                        loading: false
                    });
                } catch (error) {
                    set({
                        error: error.response?.data?.message || "Lỗi khi tải danh sách nhóm",
                        loading: false
                    });
                }
            },

            // Create new group
            createGroup: async (groupData) => {
                try {
                    set({ loading: true, error: null });
                    const response = await axiosInstance.post("/groups", groupData);
                    
                    const newGroup = response.data.data;
                    set(state => ({
                        groups: [newGroup, ...state.groups],
                        loading: false
                    }));

                    return newGroup;
                } catch (error) {
                    set({
                        error: error.response?.data?.message || "Lỗi khi tạo nhóm",
                        loading: false
                    });
                    throw error;
                }
            },

            // Get group details
            fetchGroupDetails: async (groupId) => {
                try {
                    set({ loading: true, error: null });
                    const response = await axiosInstance.get(`/groups/${groupId}`);
                    
                    const group = response.data.data;
                    set({ selectedGroup: group, loading: false });
                    return group;
                } catch (error) {
                    set({
                        error: error.response?.data?.message || "Lỗi khi tải thông tin nhóm",
                        loading: false
                    });
                    throw error;
                }
            },

            // Update group
            updateGroup: async (groupId, updateData) => {
                try {
                    set({ loading: true, error: null });
                    const response = await axiosInstance.put(`/groups/${groupId}`, updateData);
                    
                    const updatedGroup = response.data.data;
                    set(state => ({
                        selectedGroup: state.selectedGroup?._id === groupId ? updatedGroup : state.selectedGroup,
                        groups: state.groups.map(group => 
                            group._id === groupId ? updatedGroup : group
                        ),
                        loading: false
                    }));

                    return updatedGroup;
                } catch (error) {
                    set({
                        error: error.response?.data?.message || "Lỗi khi cập nhật nhóm",
                        loading: false
                    });
                    throw error;
                }
            },

            // Add members to group
            addMembers: async (groupId, userIds) => {
                try {
                    set({ loading: true, error: null });
                    const response = await axiosInstance.post(`/groups/${groupId}/members`, { userIds });
                    
                    const updatedGroup = response.data.data;
                    set(state => ({
                        selectedGroup: state.selectedGroup?._id === groupId ? updatedGroup : state.selectedGroup,
                        groups: state.groups.map(group => 
                            group._id === groupId ? updatedGroup : group
                        ),
                        loading: false
                    }));

                    return updatedGroup;
                } catch (error) {
                    set({
                        error: error.response?.data?.message || "Lỗi khi thêm thành viên",
                        loading: false
                    });
                    throw error;
                }
            },

            // Remove member from group
            removeMember: async (groupId, memberId) => {
                try {
                    set({ loading: true, error: null });
                    const response = await axiosInstance.delete(`/groups/${groupId}/members/${memberId}`);
                    
                    const updatedGroup = response.data.data;
                    set(state => ({
                        selectedGroup: state.selectedGroup?._id === groupId ? updatedGroup : state.selectedGroup,
                        groups: state.groups.map(group => 
                            group._id === groupId ? updatedGroup : group
                        ),
                        loading: false
                    }));

                    return updatedGroup;
                } catch (error) {
                    set({
                        error: error.response?.data?.message || "Lỗi khi xóa thành viên",
                        loading: false
                    });
                    throw error;
                }
            },

            // Update member role
            updateMemberRole: async (groupId, memberId, role) => {
                try {
                    set({ loading: true, error: null });
                    const response = await axiosInstance.put(`/groups/${groupId}/members/${memberId}/role`, { role });
                    
                    const updatedGroup = response.data.data;
                    set(state => ({
                        selectedGroup: state.selectedGroup?._id === groupId ? updatedGroup : state.selectedGroup,
                        groups: state.groups.map(group => 
                            group._id === groupId ? updatedGroup : group
                        ),
                        loading: false
                    }));

                    return updatedGroup;
                } catch (error) {
                    set({
                        error: error.response?.data?.message || "Lỗi khi cập nhật vai trò",
                        loading: false
                    });
                    throw error;
                }
            },

            // Toggle member chat permission
            toggleMemberChat: async (groupId, memberId) => {
                try {
                    set({ loading: true, error: null });
                    const response = await axiosInstance.put(`/groups/${groupId}/members/${memberId}/chat`);
                    
                    const updatedGroup = response.data.data;
                    set(state => ({
                        selectedGroup: state.selectedGroup?._id === groupId ? updatedGroup : state.selectedGroup,
                        groups: state.groups.map(group => 
                            group._id === groupId ? updatedGroup : group
                        ),
                        loading: false
                    }));

                    return updatedGroup;
                } catch (error) {
                    set({
                        error: error.response?.data?.message || "Lỗi khi thay đổi quyền chat",
                        loading: false
                    });
                    throw error;
                }
            },

            // Join group by invite code
            joinGroup: async (inviteCode) => {
                try {
                    set({ loading: true, error: null });
                    const response = await axiosInstance.post("/groups/join", { inviteCode });
                    
                    const newGroup = response.data.data;
                    set(state => ({
                        groups: [newGroup, ...state.groups],
                        loading: false
                    }));

                    return newGroup;
                } catch (error) {
                    set({
                        error: error.response?.data?.message || "Lỗi khi tham gia nhóm",
                        loading: false
                    });
                    throw error;
                }
            },

            // Generate invite code
            generateInviteCode: async (groupId) => {
                try {
                    set({ loading: true, error: null });
                    const response = await axiosInstance.post(`/groups/${groupId}/invite-code`);
                    
                    set({ loading: false });
                    return response.data.data.inviteCode;
                } catch (error) {
                    set({
                        error: error.response?.data?.message || "Lỗi khi tạo mã mời",
                        loading: false
                    });
                    throw error;
                }
            },

            // Leave group
            leaveGroup: async (groupId) => {
                try {
                    set({ loading: true, error: null });
                    await axiosInstance.post(`/groups/${groupId}/leave`);
                    
                    set(state => ({
                        groups: state.groups.filter(group => group._id !== groupId),
                        selectedGroup: state.selectedGroup?._id === groupId ? null : state.selectedGroup,
                        loading: false
                    }));
                } catch (error) {
                    set({
                        error: error.response?.data?.message || "Lỗi khi rời nhóm",
                        loading: false
                    });
                    throw error;
                }
            },

            // Delete group
            deleteGroup: async (groupId) => {
                try {
                    set({ loading: true, error: null });
                    await axiosInstance.delete(`/groups/${groupId}`);
                    
                    set(state => ({
                        groups: state.groups.filter(group => group._id !== groupId),
                        selectedGroup: state.selectedGroup?._id === groupId ? null : state.selectedGroup,
                        loading: false
                    }));
                } catch (error) {
                    set({
                        error: error.response?.data?.message || "Lỗi khi xóa nhóm",
                        loading: false
                    });
                    throw error;
                }
            },

            // Get group members
            fetchGroupMembers: async (groupId) => {
                try {
                    set({ loading: true, error: null });
                    const response = await axiosInstance.get(`/groups/${groupId}/members`);
                    
                    const { members } = response.data.data;
                    set({ groupMembers: members, loading: false });
                    return members;
                } catch (error) {
                    set({
                        error: error.response?.data?.message || "Lỗi khi tải danh sách thành viên",
                        loading: false
                    });
                    throw error;
                }
            },

            // Set selected group
            setSelectedGroup: (group) => set({ selectedGroup: group }),
            clearSelectedGroup: () => set({ selectedGroup: null }),

            // Clear all data
            clearGroups: () => set({
                groups: [],
                selectedGroup: null,
                groupMembers: [],
                pagination: {
                    currentPage: 1,
                    totalPages: 1,
                    totalGroups: 0,
                    hasNext: false,
                    hasPrev: false
                }
            }),

            // Utility functions
            getGroupById: (groupId) => {
                const state = get();
                return state.groups.find(group => group._id === groupId) || state.selectedGroup;
            },

            isGroupMember: (groupId, userId) => {
                const group = get().getGroupById(groupId);
                return group?.members?.some(member => 
                    member.user._id === userId && member.isActive
                ) || false;
            },

            isGroupAdmin: (groupId, userId) => {
                const group = get().getGroupById(groupId);
                if (!group) return false;
                
                return group.owner._id === userId || 
                       group.admins?.some(admin => admin._id === userId) ||
                       group.members?.some(member => 
                           member.user._id === userId && 
                           member.role === "admin" && 
                           member.isActive
                       );
            },

            isGroupOwner: (groupId, userId) => {
                const group = get().getGroupById(groupId);
                return group?.owner._id === userId || false;
            }
        }),
        {
            name: "group-store"
        }
    )
);

export default useGroupStore;
