import ogs from 'open-graph-scraper';

export async function getLinkPreview(url) {
    try {
        const { result } = await ogs({ url });
        return {
            title: result.ogTitle || '',
            description: result.ogDescription || '',
            image: result.ogImage?.url || '',
            url: result.requestUrl || url
        };
    } catch (error) {
        return null;
    }
} 