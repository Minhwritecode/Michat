import { useState, useEffect, useCallback } from "react";
import { Search, X, Loader2 } from "lucide-react";
import PropTypes from 'prop-types';

const GifPicker = ({ onGifSelect, onClose }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [gifs, setGifs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [trending, setTrending] = useState([]);
    const [searchTimeout, setSearchTimeout] = useState(null);

    const GIPHY_API_KEY = (import.meta.env && import.meta.env.VITE_GIPHY_API_KEY) || "GlVGYHkr3WSBnllca54iNt0yFbjz7L65";
    const GIPHY_API_URL = "https://api.giphy.com/v1/gifs";

    const fetchGifs = useCallback(async (url) => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }
            
            const { data } = await response.json();
            return data;
        } catch (err) {
            setError(err.message);
            console.error("GIF API error:", err);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const loadTrendingGifs = useCallback(async () => {
        const data = await fetchGifs(
            `${GIPHY_API_URL}/trending?api_key=${GIPHY_API_KEY}&limit=20&rating=g`
        );
        setTrending(data);
    }, [fetchGifs, GIPHY_API_KEY]);

    const searchGifs = useCallback(async (query) => {
        if (!query.trim()) {
            setGifs([]);
            return;
        }

        const data = await fetchGifs(
            `${GIPHY_API_URL}/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=20&rating=g`
        );
        setGifs(data);
    }, [fetchGifs, GIPHY_API_KEY]);

    useEffect(() => {
        loadTrendingGifs();
    }, [loadTrendingGifs]);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        
        // Debounce search
        if (searchTimeout) clearTimeout(searchTimeout);
        
        setSearchTimeout(setTimeout(() => {
            searchGifs(value);
        }, 500));
    };

    const handleGifClick = (gif) => {
        onGifSelect({
            type: 'gif',
            url: gif.images.original.url,
            filename: `${gif.title || 'gif'}.gif`,
            size: 0,
            gifData: gif,
            preview: gif.images.fixed_height_small.url
        });
        onClose();
    };

    const renderGifGrid = () => {
        const data = searchTerm ? gifs : trending;
        
        if (loading && data.length === 0) {
            return (
                <div className="grid grid-cols-2 gap-2">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-20 bg-base-200 rounded animate-pulse" />
                    ))}
                </div>
            );
        }

        if (error) {
            return <div className="text-error text-center py-4">{error}</div>;
        }

        if (!loading && data.length === 0) {
            return <div className="text-center py-4">No GIFs found</div>;
        }

        return (
            <div className="grid grid-cols-2 gap-2">
                {data.map((gif) => (
                    <button
                        key={gif.id}
                        className="hover:opacity-80 transition-opacity focus:outline-none"
                        onClick={() => handleGifClick(gif)}
                        aria-label={`Select GIF: ${gif.title || 'untitled'}`}
                    >
                        <img
                            src={gif.images.fixed_height_small.url}
                            alt={gif.title || 'GIF'}
                            className="w-full h-20 object-cover rounded"
                            loading="lazy"
                        />
                    </button>
                ))}
            </div>
        );
    };

    return (
        <div className="fixed bottom-20 left-4 sm:left-8 z-50 w-80">
            <div className="bg-base-300 rounded-lg shadow-lg border border-base-200 p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">GIF Picker</h3>
                    <button
                        onClick={onClose}
                        className="btn btn-circle btn-xs"
                        aria-label="Close GIF picker"
                    >
                        <X size={14} />
                    </button>
                </div>

                <form onSubmit={(e) => e.preventDefault()} className="mb-4">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Search GIFs..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="input input-sm input-bordered flex-1"
                            aria-label="Search GIFs"
                        />
                        <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            disabled={loading}
                            onClick={() => searchGifs(searchTerm)}
                        >
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                        </button>
                    </div>
                </form>

                <div className="max-h-64 overflow-y-auto">
                    {renderGifGrid()}
                </div>
            </div>
        </div>
    );
};

GifPicker.propTypes = {
    onGifSelect: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default GifPicker;