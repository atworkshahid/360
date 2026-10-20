import React, { useState } from 'react';
import { Search, Loader2, Link as LinkIcon } from 'lucide-react';

interface Resource {
  title: string;
  type: 'Video' | 'Article' | 'Open Textbook';
  url: string;
}

interface ResourceSuggesterProps {
  mluItem: any;
  onResourcesSuggested: (resources: Resource[]) => void;
}

export const ResourceSuggester: React.FC<ResourceSuggesterProps> = ({ mluItem, onResourcesSuggested }) => {
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestedResources, setSuggestedResources] = useState<Resource[]>([]);

  const handleSuggest = async () => {
    setIsSuggesting(true);
    try {
      const response = await fetch('/api/suggest-resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mluItem }),
      });
      const data = await response.json();
      setSuggestedResources(data.resources);
      onResourcesSuggested(data.resources);
    } catch (error) {
      console.error('Failed to suggest resources:', error);
    } finally {
      setIsSuggesting(false);
    }
  };

  return (
    <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-lg space-y-2">
      <button 
        onClick={handleSuggest}
        disabled={isSuggesting}
        className="text-xs font-bold text-blue-700 flex items-center gap-1 hover:underline"
      >
        {isSuggesting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
        Suggest Academic Resources
      </button>
      {suggestedResources.length > 0 && (
        <ul className="space-y-1">
          {suggestedResources.map((res, i) => (
            <li key={i} className="text-[10px] text-slate-700 flex items-center gap-1">
              <LinkIcon className="w-3 h-3 text-blue-500" />
              <a href={res.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{res.title}</a>
              <span className="text-slate-400">({res.type})</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
