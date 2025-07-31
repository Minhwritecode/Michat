import { useEffect, useState } from "react";

const LinkPreview = ({ url }) => {
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        const fetchPreview = async () => {
            try {
                const res = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`);
                const data = await res.json();
                setPreview(data);
            } catch {
                setPreview(null);
            }
        };
        fetchPreview();
    }, [url]);

    if (!preview) return null;

    return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="block border rounded-lg p-2 my-2 hover:bg-base-200">
            {preview.image && (
                <img src={preview.image} alt={preview.title} className="w-full h-32 object-cover rounded mb-2" />
            )}
            <div className="font-bold">{preview.title}</div>
            <div className="text-sm text-gray-500">{preview.description}</div>
            <div className="text-xs text-blue-500 mt-1">{url}</div>
        </a>
    );
};

export default LinkPreview;