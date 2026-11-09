import React, { useState } from 'react';
import { PlusCircle, Loader2 } from 'lucide-react';

export default function NoteForm({ onAddNote }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle) {
      setValidationError('Please provide a title for the note.');
      return;
    }
    if (!trimmedContent) {
      setValidationError('Note content cannot be empty.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onAddNote({ title: trimmedTitle, content: trimmedContent });
      setTitle('');
      setContent('');
    } catch (err) {
      // Error is also handled by parent, but we keep the form content so user doesn't lose work
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 transition-all hover:shadow-md">
      <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <PlusCircle className="w-5 h-5 text-emerald-600" />
        Create New Note
      </h2>

      {validationError && (
        <div className="mb-4 text-xs font-medium text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-2.5">
          {validationError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Title
          </label>
          <input
            id="title"
            type="text"
            placeholder="e.g. System Design Brainstorming"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white transition-all disabled:opacity-50"
            maxLength={255}
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Content
          </label>
          <textarea
            id="content"
            rows={4}
            placeholder="Write your note markdown or thoughts here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isSubmitting}
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white transition-all resize-y disabled:opacity-50"
          />
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-60 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving Note...
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                Add Note
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

