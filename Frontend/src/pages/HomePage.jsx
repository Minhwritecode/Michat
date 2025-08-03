import { useChatStore } from "../stores/useChatStore";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/chat/ChatContainer";
import StoryFeed from "../components/stories/StoryFeed";

const HomePage = () => {
    const { selectedUser } = useChatStore();

    return (
        <div className="h-screen bg-base-200">
            <div className="flex items-center justify-center pt-20 px-4">
                <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
                    <div className="flex h-full rounded-lg overflow-hidden">
                        <Sidebar />

                        <div className="flex-1 flex flex-col">
                            {/* Story Feed Section */}
                            <div className="p-4 border-b border-base-300">
                                <StoryFeed />
                            </div>

                            {/* Chat Section */}
                            <div className="flex-1">
                                {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default HomePage;
