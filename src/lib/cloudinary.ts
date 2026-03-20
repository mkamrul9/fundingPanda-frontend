export const getViewablePdfUrl = (url?: string | null) => {
    if (!url) return null;

    try {
        const parsed = new URL(url);
        let pathname = parsed.pathname.replace('/image/upload/', '/raw/upload/');

        if (!pathname.toLowerCase().endsWith('.pdf')) {
            pathname = `${pathname}.pdf`;
        }

        parsed.pathname = pathname;
        return parsed.toString();
    } catch {
        // Fallback for malformed URLs from legacy records
        const normalized = url.replace('/image/upload/', '/raw/upload/');
        return normalized.toLowerCase().endsWith('.pdf') ? normalized : `${normalized}.pdf`;
    }
};
