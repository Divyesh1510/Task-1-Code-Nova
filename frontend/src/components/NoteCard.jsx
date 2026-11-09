import React, { useState } from 'react';
import { Pencil, Trash2, Calendar, Clock, Check, X, Loader2 } from 'lucide-react';

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export default function NoteCard({ note, onUpdateNote, onDeleteNote, onOpenEditModal }) {
  const [isInlineEditing, setIsInlineEditing] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSaveInline = async () => {
    setLocalError('');
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle || !trimmedContent) {
      setLocalError('Both title and content are required.');
      return;
    }

    try {
      setIsSaving(true);
      await onUpdateNote(note.id, { title: trimmedTitle, content: trimmedContent });
      setIsInlineEditing(false);
    } catch (err) {
      setLocalError(err.message || 'Failed to update note');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelInline = () => {
    setTitle(note.title);
    setContent(note.content);
    setLocalError('');
    setIsInlineEditing(false);
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDeleteNote(note.id);
    } catch (err) {
      setIsDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  return (
    <div className="group relative bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      {/* Top Header / Actions */}
      <div>
        {isInlineEditing ? (
          <div className="space-y-3 mb-3">
            {localError && (
              <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2 rounded-lg">
                {localError}
              </p>
            )}
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSaving}
              className="w-full text-base font-semibold text-slate-800 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              placeholder="Note title"
            />
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isSaving}
              className="w-full text-sm text-slate-600 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-y"
              placeholder="Note content"
            />
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={handleCancelInline}
                disabled={isSaving}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
              <button
                onClick={handleSaveInline}
                disabled={isSaving}
                className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer disabled:opacity-60"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Save
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="font-semibold text-slate-900 text-base leading-snug break-words flex-1">
                {note.title}
              </h3>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onOpenEditModal(note)}
                  title="Edit in Modal"
                  className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowConfirmDelete(true)}
                  title="Delete Note"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap break-words mb-4 line-clamp-6">
              {note.content}
            </p>
          </>
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span className="inline-flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {formatDate(note.updated_at)}
        </span>
        {!isInlineEditing && (
          <button
            onClick={() => setIsInlineEditing(true)}
            className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline text-[11px] cursor-pointer"
          >
            Inline Edit
          </button>
        )}
      </div>

      {/* Delete Confirmation Overlay / Dialog */}
      {showConfirmDelete && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-xs rounded-2xl p-5 flex flex-col justify-center items-center text-center z-10 transition-all border border-rose-200">
          <Trash2 className="w-8 h-8 text-rose-500 mb-2" />
          <h4 className="font-semibold text-slate-800 text-sm mb-1">Delete this note?</h4>
          <p className="text-xs text-slate-500 mb-4 px-2">This action cannot be undone.</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowConfirmDelete(false)}
              disabled={isDeleting}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer disabled:opacity-60"
            >
              {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              Confirm Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

