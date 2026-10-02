import React, { useState } from 'react';
import {
  Folder,
  FolderPlus,
  FolderOpen,
  FolderCheck,
  Plus,
  Trash2,
  Edit2,
  X,
  Sparkles,
  Layers,
  ArrowRight,
  UploadCloud,
} from 'lucide-react';
import { ModuleFolder, ResourceItem } from '../../types';

interface ModuleFoldersBarProps {
  folders: ModuleFolder[];
  resources: ResourceItem[];
  selectedFolderId: string; // 'ALL' | 'unassigned' | folderId
  onSelectFolder: (folderId: string) => void;
  onDropResourceToFolder: (resourceId: string, folderId?: string, folderName?: string) => void;
  onDropFilesToFolder: (files: FileList, folderId?: string, folderName?: string) => void;
  onCreateFolder: (folder: Omit<ModuleFolder, 'id'>) => void;
  onDeleteFolder: (folderId: string) => void;
  onUpdateFolder: (folderId: string, updates: Partial<ModuleFolder>) => void;
  isDraggingAnyItem: boolean;
}

const COLOR_THEMES: { id: string; label: string; bg: string; border: string; text: string; ring: string }[] = [
  { id: 'blue', label: 'Blue', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', ring: 'ring-blue-500' },
  { id: 'indigo', label: 'Indigo', bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', ring: 'ring-indigo-500' },
  { id: 'emerald', label: 'Emerald', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', ring: 'ring-emerald-500' },
  { id: 'purple', label: 'Purple', bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', ring: 'ring-purple-500' },
  { id: 'amber', label: 'Amber', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', ring: 'ring-amber-500' },
  { id: 'rose', label: 'Rose', bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', ring: 'ring-rose-500' },
];

export const ModuleFoldersBar: React.FC<ModuleFoldersBarProps> = ({
  folders,
  resources,
  selectedFolderId,
  onSelectFolder,
  onDropResourceToFolder,
  onDropFilesToFolder,
  onCreateFolder,
  onDeleteFolder,
  onUpdateFolder,
  isDraggingAnyItem,
}) => {
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDesc, setNewFolderDesc] = useState('');
  const [newFolderNumber, setNewFolderNumber] = useState<number>(folders.length + 1);
  const [newFolderTheme, setNewFolderTheme] = useState('indigo');

  // Editing state
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editFolderName, setEditFolderName] = useState('');
  const [editFolderDesc, setEditFolderDesc] = useState('');

  // Counts
  const totalCount = resources.length;
  const unassignedCount = resources.filter((r) => !r.moduleId).length;
  const getFolderCount = (folderId: string) => resources.filter((r) => r.moduleId === folderId).length;

  const handleDragOver = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverFolderId !== folderId) {
      setDragOverFolderId(folderId);
    }
  };

  const handleDragLeave = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    if (dragOverFolderId === folderId) {
      setDragOverFolderId(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetFolderId: string, folderName?: string) => {
    e.preventDefault();
    setDragOverFolderId(null);

    // 1. Check if external desktop files were dropped
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onDropFilesToFolder(
        e.dataTransfer.files,
        targetFolderId === 'unassigned' ? undefined : targetFolderId,
        folderName
      );
      return;
    }

    // 2. Check if internal resource item was dropped
    let resourceId = e.dataTransfer.getData('text/plain');
    if (!resourceId) {
      try {
        const jsonData = e.dataTransfer.getData('application/json');
        if (jsonData) {
          const parsed = JSON.parse(jsonData);
          resourceId = parsed.id;
        }
      } catch {
        // ignore
      }
    }

    if (resourceId) {
      onDropResourceToFolder(
        resourceId,
        targetFolderId === 'unassigned' ? undefined : targetFolderId,
        folderName
      );
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    onCreateFolder({
      name: newFolderName.trim(),
      description: newFolderDesc.trim() || undefined,
      moduleNumber: Number(newFolderNumber) || undefined,
      colorTheme: newFolderTheme,
    });

    setNewFolderName('');
    setNewFolderDesc('');
    setNewFolderNumber(folders.length + 2);
    setIsCreateModalOpen(false);
  };

  const handleStartEdit = (folder: ModuleFolder, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingFolderId(folder.id);
    setEditFolderName(folder.name);
    setEditFolderDesc(folder.description || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFolderId || !editFolderName.trim()) return;
    onUpdateFolder(editingFolderId, {
      name: editFolderName.trim(),
      description: editFolderDesc.trim() || undefined,
    });
    setEditingFolderId(null);
  };

  const selectedFolderObj = folders.find((f) => f.id === selectedFolderId);

  return (
    <div className="space-y-3">
      {/* Drag & Drop Instruction Hint (when dragging) */}
      {isDraggingAnyItem && (
        <div className="animate-pulse bg-indigo-600 text-white px-4 py-2.5 rounded-xl shadow-md flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center space-x-2">
            <UploadCloud className="w-4 h-4 animate-bounce" />
            <span>Drop file on any folder below to organize it directly into that Module!</span>
          </div>
          <span className="text-[11px] bg-indigo-500 px-2 py-0.5 rounded-md font-bold">
            Drop Target Active
          </span>
        </div>
      )}

      {/* Main Folder Navigation & Drop Shelf */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
              <Folder className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <span>Course Module Folders</span>
                <span className="text-[11px] font-normal text-slate-500">
                  (Drag & drop to move files between folders or reorder)
                </span>
              </h3>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition cursor-pointer"
              title="Create a new module folder"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>+ New Module Folder</span>
            </button>
          </div>
        </div>

        {/* Folder Drop Cards List */}
        <div className="pt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {/* 1. All Resources Option */}
          <button
            type="button"
            onClick={() => onSelectFolder('ALL')}
            className={`p-3 rounded-xl text-left border transition relative flex flex-col justify-between cursor-pointer ${
              selectedFolderId === 'ALL'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <Layers className={`w-4 h-4 ${selectedFolderId === 'ALL' ? 'text-indigo-400' : 'text-slate-500'}`} />
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  selectedFolderId === 'ALL' ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {totalCount}
              </span>
            </div>
            <div>
              <p className="text-xs font-bold line-clamp-1">All Resources</p>
              <p className={`text-[10px] line-clamp-1 ${selectedFolderId === 'ALL' ? 'text-slate-400' : 'text-slate-500'}`}>
                Entire library view
              </p>
            </div>
          </button>

          {/* 2. Unassigned (Root) Folder Drop Target */}
          <div
            onClick={() => onSelectFolder('unassigned')}
            onDragOver={(e) => handleDragOver(e, 'unassigned')}
            onDragLeave={(e) => handleDragLeave(e, 'unassigned')}
            onDrop={(e) => handleDrop(e, 'unassigned', undefined)}
            className={`p-3 rounded-xl text-left border transition relative flex flex-col justify-between cursor-pointer group ${
              dragOverFolderId === 'unassigned'
                ? 'bg-indigo-100 border-indigo-500 ring-2 ring-indigo-500 scale-102 shadow-md'
                : selectedFolderId === 'unassigned'
                ? 'bg-slate-800 text-white border-slate-800 shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <FolderOpen
                className={`w-4 h-4 ${
                  dragOverFolderId === 'unassigned'
                    ? 'text-indigo-600 animate-bounce'
                    : selectedFolderId === 'unassigned'
                    ? 'text-indigo-400'
                    : 'text-slate-500'
                }`}
              />
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  selectedFolderId === 'unassigned' ? 'bg-slate-700 text-slate-200' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {unassignedCount}
              </span>
            </div>
            <div>
              <p className="text-xs font-bold line-clamp-1">
                {dragOverFolderId === 'unassigned' ? 'Drop here to Unassign' : 'Root / Unassigned'}
              </p>
              <p className={`text-[10px] line-clamp-1 ${selectedFolderId === 'unassigned' ? 'text-slate-400' : 'text-slate-500'}`}>
                General files
              </p>
            </div>
          </div>

          {/* 3. Specific Module Folders as Interactive Drop Targets */}
          {folders.map((folder) => {
            const isSelected = selectedFolderId === folder.id;
            const isDropActive = dragOverFolderId === folder.id;
            const count = getFolderCount(folder.id);

            return (
              <div
                key={folder.id}
                onClick={() => onSelectFolder(folder.id)}
                onDragOver={(e) => handleDragOver(e, folder.id)}
                onDragLeave={(e) => handleDragLeave(e, folder.id)}
                onDrop={(e) => handleDrop(e, folder.id, folder.name)}
                className={`p-3 rounded-xl text-left border transition relative flex flex-col justify-between cursor-pointer group ${
                  isDropActive
                    ? 'bg-indigo-100 border-indigo-600 ring-2 ring-indigo-500 scale-102 shadow-md'
                    : isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-50 hover:bg-indigo-50/50 border-slate-200 hover:border-indigo-200 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-1.5">
                    <Folder
                      className={`w-4 h-4 ${
                        isDropActive
                          ? 'text-indigo-700 animate-bounce'
                          : isSelected
                          ? 'text-white'
                          : 'text-indigo-600'
                      }`}
                    />
                    {folder.moduleNumber && (
                      <span
                        className={`text-[9px] font-black uppercase px-1 rounded ${
                          isSelected ? 'bg-indigo-700 text-white' : 'bg-indigo-100 text-indigo-700'
                        }`}
                      >
                        M{folder.moduleNumber}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        isSelected ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {count}
                    </span>
                    {/* Quick folder options on hover */}
                    <button
                      type="button"
                      onClick={(e) => handleStartEdit(folder, e)}
                      className={`opacity-0 group-hover:opacity-100 p-0.5 rounded transition ${
                        isSelected ? 'hover:bg-indigo-700 text-white' : 'hover:bg-slate-200 text-slate-400'
                      }`}
                      title="Rename Folder"
                    >
                      <Edit2 className="w-2.5 h-2.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Delete folder "${folder.name}"? Resources will be moved to Root Library.`)) {
                          onDeleteFolder(folder.id);
                        }
                      }}
                      className={`opacity-0 group-hover:opacity-100 p-0.5 rounded transition ${
                        isSelected ? 'hover:bg-indigo-700 text-white' : 'hover:bg-slate-200 text-rose-500'
                      }`}
                      title="Delete Folder"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold line-clamp-1">
                    {isDropActive ? 'Drop file here!' : folder.name}
                  </p>
                  <p
                    className={`text-[10px] line-clamp-1 ${
                      isSelected ? 'text-indigo-200' : 'text-slate-500'
                    }`}
                  >
                    {isDropActive
                      ? 'Releases into this module'
                      : folder.description || `${count} ${count === 1 ? 'file' : 'files'}`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Folder Breadcrumb Banner */}
        {selectedFolderId !== 'ALL' && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center space-x-1.5 text-slate-600">
              <span className="font-semibold text-slate-400">Library:</span>
              <button
                type="button"
                onClick={() => onSelectFolder('ALL')}
                className="font-medium hover:text-indigo-600 hover:underline cursor-pointer"
              >
                All Resources
              </button>
              <span className="text-slate-400">/</span>
              <span className="font-bold text-indigo-700 flex items-center space-x-1 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                <Folder className="w-3.5 h-3.5" />
                <span>{selectedFolderObj?.name || (selectedFolderId === 'unassigned' ? 'Root / Unassigned' : 'Selected Folder')}</span>
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                ({selectedFolderId === 'unassigned' ? unassignedCount : getFolderCount(selectedFolderId)} files)
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => onSelectFolder('ALL')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-bold transition flex items-center space-x-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Show All Resources</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Module Folder Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
                <FolderPlus className="w-4 h-4 text-indigo-600" />
                <span>Create New Module Folder</span>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
                  Module Number & Title *
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min={1}
                    max={24}
                    value={newFolderNumber}
                    onChange={(e) => setNewFolderNumber(Number(e.target.value))}
                    className="w-16 px-3 py-2 rounded-xl border border-slate-300 font-mono text-center font-bold text-slate-800"
                    placeholder="1"
                  />
                  <input
                    type="text"
                    required
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="e.g. Module 5: Empirical Field Testing"
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
                  Folder Description / Learning Purpose
                </label>
                <textarea
                  rows={2}
                  value={newFolderDesc}
                  onChange={(e) => setNewFolderDesc(e.target.value)}
                  placeholder="e.g. Field observations, test benches, and empirical lab protocols."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
                  Color Theme
                </label>
                <div className="flex items-center space-x-2">
                  {COLOR_THEMES.map((th) => (
                    <button
                      key={th.id}
                      type="button"
                      onClick={() => setNewFolderTheme(th.id)}
                      className={`px-2.5 py-1 rounded-lg border text-xs font-bold transition cursor-pointer ${
                        th.bg
                      } ${th.border} ${th.text} ${
                        newFolderTheme === th.id ? 'ring-2 ring-offset-1 ' + th.ring : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      {th.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition shadow-xs"
                >
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Module Folder Modal */}
      {editingFolderId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
                <Edit2 className="w-4 h-4 text-indigo-600" />
                <span>Rename Module Folder</span>
              </div>
              <button
                type="button"
                onClick={() => setEditingFolderId(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
                  Folder Name *
                </label>
                <input
                  type="text"
                  required
                  value={editFolderName}
                  onChange={(e) => setEditFolderName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editFolderDesc}
                  onChange={(e) => setEditFolderDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingFolderId(null)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
