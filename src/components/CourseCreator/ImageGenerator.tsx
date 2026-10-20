import React, { useState } from 'react';
import { Sparkles, Loader2, Image as ImageIcon } from 'lucide-react';

interface ImageGeneratorProps {
  onImageGenerated: (imageUrl: string) => void;
}

export const ImageGenerator: React.FC<ImageGeneratorProps> = ({ onImageGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const generateImage = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      if (!response.ok) throw new Error('Generation failed');
      const data = await response.json();
      setImageUrl(data.imageUrl);
      onImageGenerated(data.imageUrl);
    } catch (err) {
      console.error('Error generating image:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-4">
      <h4 className="text-sm font-bold text-slate-900">Generate Syllabus Header Image</h4>
      <div className="space-y-2">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your syllabus header (e.g., 'A professional, minimalist header with an academic theme, blue and gold color palette')"
          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          rows={2}
        />
        <button
          onClick={generateImage}
          disabled={loading || !prompt.trim()}
          className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-sm transition"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>{loading ? 'Generating...' : 'Generate Image'}</span>
        </button>
      </div>
      {imageUrl && (
        <img src={imageUrl} alt="Generated Header" className="w-full h-auto rounded-lg border border-slate-200" referrerPolicy="no-referrer" />
      )}
    </div>
  );
};
