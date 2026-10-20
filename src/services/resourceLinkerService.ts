export const suggestResources = async (statement: string, courseTitle: string) => {
    try {
        const response = await fetch('/api/ai/suggest-resources', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ statement, courseTitle })
        });
        if (!response.ok) {
            throw new Error('Failed to fetch resources');
        }
        const data = await response.json();
        return data.resources || [];
    } catch (err) {
        console.error('Resource linker service error:', err);
        return [];
    }
}
