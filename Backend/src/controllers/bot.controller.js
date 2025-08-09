// controllers/bot.controller.js
export const generateSuggestions = async (req, res) => {
    try {
        const { text } = req.body;
        
        if (!text) {
            return res.status(400).json({
                success: false,
                message: 'Text is required'
            });
        }

        // Logic tạo suggestions
        const suggestions = await analyzeTextAndGenerateSuggestions(text);

        res.status(200).json({
            success: true,
            suggestions
        });
    } catch (error) {
        console.error('Error generating suggestions:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Helper function
async function analyzeTextAndGenerateSuggestions(text) {
    const lowerText = text.toLowerCase();
    
    // Database mẫu - bạn có thể thay bằng database thật
    const suggestionsMap = {
        "chào": ["Xin chào!", "Chào bạn!", "Hi there!"],
        "hello": ["Hello!", "Xin chào!", "Chào bạn đây!"],
        "khỏe": ["Bạn khỏe không?", "How can I help you?", "Bạn cần giúp gì?"],
        "cảm ơn": ["Không có gì!", "You're welcome!", "Rất vui được giúp bạn"],
        "help": ["Tôi có thể giúp gì cho bạn?", "Bạn cần hỗ trợ gì?", "Help is on the way!"]
    };

    // Tìm suggestions phù hợp
    const foundSuggestions = Object.entries(suggestionsMap)
        .filter(([keyword]) => lowerText.includes(keyword))
        .flatMap(([_, suggestions]) => suggestions);

    // Nếu không tìm thấy, trả về suggestions mặc định
    return foundSuggestions.length > 0 
        ? foundSuggestions 
        : [
            "Bạn có thể nói rõ hơn không?",
            "Tôi chưa hiểu ý bạn",
            "Bạn muốn biết thêm về điều gì?"
        ];
}