import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useDraftStore = create(
  persist(
    (set, get) => ({
      drafts: {}, // { userId: { text: "", attachments: [], timestamp: Date } }
      
      // Lưu draft cho user
      saveDraft: (userId, draft) => {
        set((state) => ({
          drafts: {
            ...state.drafts,
            [userId]: {
              ...draft,
              timestamp: new Date().toISOString()
            }
          }
        }));
      },
      
      // Lấy draft của user
      getDraft: (userId) => {
        const state = get();
        return state.drafts[userId] || null;
      },
      
      // Xóa draft của user
      clearDraft: (userId) => {
        set((state) => {
          const newDrafts = { ...state.drafts };
          delete newDrafts[userId];
          return { drafts: newDrafts };
        });
      },
      
      // Xóa tất cả drafts cũ (quá 24h)
      clearOldDrafts: () => {
        const state = get();
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        
        const newDrafts = {};
        Object.entries(state.drafts).forEach(([userId, draft]) => {
          const draftTime = new Date(draft.timestamp);
          if (draftTime > oneDayAgo) {
            newDrafts[userId] = draft;
          }
        });
        
        set({ drafts: newDrafts });
      },
      
      // Kiểm tra có draft hay không
      hasDraft: (userId) => {
        const state = get();
        return !!state.drafts[userId];
      },
      
      // Lấy preview text của draft
      getDraftPreview: (userId) => {
        const draft = get().drafts[userId];
        if (!draft) return null;
        
        if (draft.attachments && draft.attachments.length > 0) {
          return `📎 ${draft.attachments.length} file(s)`;
        }
        return draft.text || "";
      }
    }),
    {
      name: 'michat-drafts', // localStorage key
      partialize: (state) => ({ drafts: state.drafts }), // Chỉ lưu drafts
    }
  )
);

export default useDraftStore; 