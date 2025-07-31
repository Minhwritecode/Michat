import { useState, useEffect } from "react";
import { Search, X, Loader2 } from "lucide-react";

const GifPicker = ({ onGifSelect, onClose }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [gifs, setGifs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [trending, setTrending] = useState([]);

    const GIPHY_API_KEY = "GlVGYHkr3WSBnllca54iNt0yFbjz7L65"; // Free API key
    const GIPHY_API_URL = "https://api.giphy.com/v1/gifs";

    useEffect(() => {
        loadTrendingGifs();
    }, []);

    const loadTrendingGifs = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `${GIPHY_API_URL}/trending?api_key=${GIPHY_API_KEY}&limit=20&rating=g`
            );
            const data = await response.json();
            setTrending(data.data);
        } catch (error) {
            console.error("Failed to load trending GIFs:", error);
        } finally {
            setLoading(false);
        }
    };

    const searchGifs = async (query) => {
        if (!query.trim()) {
            setGifs([]);
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(
                `${GIPHY_API_URL}/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=20&rating=g`
            );
            const data = await response.json();
            setGifs(data.data);
        } catch (error) {
            console.error("Failed to search GIFs:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        searchGifs(searchTerm);
    };

    const handleGifClick = (gif) => {
        onGifSelect({
            type: 'gif',
            url: gif.images.original.url,
            filename: `${gif.title}.gif`,
            size: 0,
            gifData: gif
        });
        onClose();
    };

    return (
        <div className="absolute bottom-full left-0 mb-2 z-50 w-80">
            <div className="bg-base-300 rounded-lg shadow-lg border border-base-200 p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">GIF Picker</h3>
                    <button
                        onClick={onClose}
                        className="btn btn-circle btn-xs"
                    >
                        <X size={14} />
                    </button>
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className="mb-4">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Search GIFs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input input-sm input-bordered flex-1"
                        />
                        <button
                            type="submit"
                            className="btn btn-sm btn-primary"
                            disabled={loading}
                        >
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                        </button>
                    </div>
                </form>

                {/* GIF Grid */}
                <div className="max-h-64 overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 size={24} className="animate-spin" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-2">
                            {(searchTerm ? gifs : trending).map((gif) => (
                                <div
                                    key={gif.id}
                                    className="cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => handleGifClick(gif)}
                                >
                                    <img
                                        src={gif.images.fixed_height_small.url}
                                        alt={gif.title}
                                        className="w-full h-20 object-cover rounded"
                                        loading="lazy"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GifPicker; 