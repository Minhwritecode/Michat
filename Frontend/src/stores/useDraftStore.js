import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useDraftStore = create(
  persist(
    (set, get) => ({
      drafts: {}, // { userId: { text: string, attachments: array, timestamp: string } }

      // Lưu draft cho user
      saveDraft: (userId, draft) => {
        if (!userId || typeof userId !== 'string') {
          console.error('Invalid userId:', userId);
          return;
        }
        if (!draft || typeof draft !== 'object') {
          console.error('Invalid draft data:', draft);
          return;
        }

        set((state) => ({
          drafts: {
            ...state.drafts,
            [userId]: {
              text: draft.text || '',
              attachments: draft.attachments || [],
              timestamp: new Date().toISOString(),
            },
          },
        }));
      },

      // Lấy draft của user
      getDraft: (userId) => {
        if (!userId) return null;
        return get().drafts[userId] || null;
      },

      // Xóa draft của user
      clearDraft: (userId) => {
        if (!userId) return;
        set((state) => {
          const newDrafts = { ...state.drafts };
          delete newDrafts[userId];
          return { drafts: newDrafts };
        });
      },

      // Xóa tất cả drafts cũ (quá 24h)
      clearOldDrafts: () => {
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        set((state) => {
          const newDrafts = {};
          Object.entries(state.drafts).forEach(([userId, draft]) => {
            const draftTime = new Date(draft.timestamp);
            if (draftTime > oneDayAgo) {
              newDrafts[userId] = draft;
            }
          });
          return { drafts: newDrafts };
        });
      },

      // Kiểm tra có draft hay không
      hasDraft: (userId) => {
        if (!userId) return false;
        return !!get().drafts[userId];
      },

      // Lấy preview text của draft
      getDraftPreview: (userId) => {
        if (!userId) return null;
        const draft = get().drafts[userId];
        if (!draft) return null;

        if (draft.attachments?.length > 0) {
          return `📎 ${draft.attachments.length} tệp đính kèm`;
        }
        return draft.text?.substring(0, 50) || ''; // Giới hạn độ dài preview
      },
    }),
    {
      name: 'michat-drafts', // localStorage key
      partialize: (state) => ({ drafts: state.drafts }), // Chỉ lưu drafts
      onRehydrateStorage: () => (state) => {
        // Gọi clearOldDrafts khi store được khôi phục
        if (state) {
          state.clearOldDrafts();
        }
      },
      storage: {
        // Xử lý lỗi khi lưu vào localStorage
        getItem: (name) => {
          try {
            return JSON.parse(localStorage.getItem(name));
          } catch (error) {
            console.error('Lỗi khi lấy dữ liệu từ localStorage:', error);
            return null;
          }
        },
        setItem: (name, value) => {
          try {
            localStorage.setItem(name, JSON.stringify(value));
          } catch (error) {
            console.error('Lỗi khi lưu vào localStorage:', error);
          }
        },
        removeItem: (name) => {
          try {
            localStorage.removeItem(name);
          } catch (error) {
            console.error('Lỗi khi xóa từ localStorage:', error);
          }
        },
      },
    }
  )
);

export default useDraftStore;