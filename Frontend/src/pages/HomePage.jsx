import { useChatStore } from "../stores/useChatStore";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/chat/ChatContainer";
import StoryFeed from "../components/stories/StoryFeed";

const HomePage = () => {
    const { selectedUser } = useChatStore();

    return (
        <div className="h-screen bg-base-200 flex flex-col pt-20">
            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar - Fixed width */}
                <div className="w-20 lg:w-72 border-r border-base-300 bg-base-100">
                    <Sidebar />
                </div>

                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col bg-base-100 rounded-r-lg shadow-cl overflow-hidden">
                    {/* Story Feed Section */}
                    <div className="p-4 border-b border-base-300">
                        <StoryFeed />
                    </div>

                    {/* Chat Content */}
                    <div className="flex-1 overflow-hidden">
                        {!selectedUser ? (
                            <NoChatSelected />
                        ) : (
                            <ChatContainer />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;