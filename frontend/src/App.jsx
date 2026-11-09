import React, { useState, useEffect, useCallback } from 'react';
import { 
  FileText, 
  RotateCw, 
  Search, 
  Sparkles, 
  Server, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

import { notesApi } from './api';
import NoteForm from './components/NoteForm';
import NoteCard from './components/NoteCard';
import EditNoteModal from './components/EditNoteModal';
import ErrorAlert from './components/ErrorAlert';

export default function App() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [editingNote, setEditingNote] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Backend Health check status
  const [backendStatus, setBackendStatus] = useState('checking'); // 'healthy' | 'unreachable' | 'checking'

  // Clear success notification after 4 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const loadNotes = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const [notesData, healthData] = await Promise.allSettled([
        notesApi.getAllNotes(),
        notesApi.checkHealth()
      ]);

      if (healthData.status === 'fulfilled') {
        setBackendStatus('healthy');
      } else {
        setBackendStatus('unreachable');
      }

      if (notesData.status === 'fulfilled') {
        setNotes(notesData.value);
        setErrorMessage('');
      } else {
        throw notesData.reason;
      }
    } catch (err) {
      setErrorMessage(err.message || 'Unable to connect to the backend API. Please make sure FastAPI is running.');
      setBackendStatus('unreachable');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  // Handler: Add Note
  const handleAddNote = async (newNote) => {
    try {
      setErrorMessage('');
      const created = await notesApi.createNote(newNote);
      setNotes((prevNotes) => [created, ...prevNotes]);
      setSuccessMessage('Note created successfully!');
    } catch (err) {
      setErrorMessage(`Failed to create note: ${err.message}`);
      throw err;
    }
  };

  // Handler: Update Note
  const handleUpdateNote = async (id, updatedFields) => {
    try {
      setErrorMessage('');
      const updated = await notesApi.updateNote(id, updatedFields);
      setNotes((prevNotes) =>
        prevNotes.map((n) => (n.id === id ? updated : n)).sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      );
      setSuccessMessage('Note updated successfully!');
    } catch (err) {
      setErrorMessage(`Failed to update note: ${err.message}`);
      throw err;
    }
  };

  // Handler: Delete Note
  const handleDeleteNote = async (id) => {
    try {
      setErrorMessage('');
      await notesApi.deleteNote(id);
      setNotes((prevNotes) => prevNotes.filter((n) => n.id !== id));
      setSuccessMessage('Note deleted successfully!');
    } catch (err) {
      setErrorMessage(`Failed to delete note: ${err.message}`);
      throw err;
    }
  };

  const handleOpenEditModal = (note) => {
    setEditingNote(note);
    setIsModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditingNote(null);
    setIsModalOpen(false);
  };

  // Filter notes based on search query
  const filteredNotes = notes.filter((note) => {
    const q = searchQuery.toLowerCase();
    return note.title.toLowerCase().includes(q) || note.content.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-slate-900 text-lg leading-tight tracking-tight">
                  NotesFlow
                </h1>
                <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  CRUD App
                </span>
              </div>
              <p className="text-xs text-slate-500">FastAPI + React + Tailwind CSS</p>
            </div>
          </div>

          {/* Backend Status indicator & Refresh Button */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 border border-slate-200/80">
              <Server className="w-3.5 h-3.5 text-slate-500" />
              <span>Backend:</span>
              {backendStatus === 'healthy' ? (
                <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Connected
                </span>
              ) : backendStatus === 'unreachable' ? (
                <span className="inline-flex items-center gap-1 text-rose-600 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span> Disconnected
                </span>
              ) : (
                <span className="text-slate-400">Checking...</span>
              )}
            </div>

            <button
              onClick={() => loadNotes(true)}
              disabled={refreshing || loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl shadow-2xs hover:bg-slate-50 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
              title="Refresh notes list"
            >
              <RotateCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-600' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-8 py-8 flex-1 space-y-8">
        {/* Global Notifications */}
        {errorMessage && (
          <ErrorAlert message={errorMessage} onClose={() => setErrorMessage('')} />
        )}

        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="text-sm font-medium">{successMessage}</span>
            </div>
            <button
              onClick={() => setSuccessMessage('')}
              className="text-emerald-600 hover:text-emerald-800 p-1 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer text-xs font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Section 1: Note Creation Form */}
        <section>
          <NoteForm onAddNote={handleAddNote} />
        </section>

        {/* Section 2: Notes Grid & Search */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Your Notes</h2>
              <span className="px-2.5 py-0.5 text-xs font-bold bg-slate-200 text-slate-700 rounded-full">
                {notes.length}
              </span>
            </div>

            {/* Search Input */}
            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Loading Skeleton */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
              {[1, 2, 3].map((idx) => (
                <div key={idx} className="bg-white border border-slate-200/70 rounded-2xl p-5 h-48 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="h-5 bg-slate-200 rounded-md w-3/4"></div>
                    <div className="h-3.5 bg-slate-100 rounded-md w-full"></div>
                    <div className="h-3.5 bg-slate-100 rounded-md w-5/6"></div>
                    <div className="h-3.5 bg-slate-100 rounded-md w-1/2"></div>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-md w-1/3"></div>
                </div>
              ))}
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-12 text-center">
              <div className="w-14 h-14 mx-auto mb-4 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-base font-semibold text-slate-800 mb-1">
                {searchQuery ? 'No notes matched your search' : 'No notes created yet'}
              </h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                {searchQuery
                  ? 'Try searching with different keywords or clear the filter.'
                  : 'Start capturing your thoughts, tasks, and ideas using the form above.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onUpdateNote={handleUpdateNote}
                  onDeleteNote={handleDeleteNote}
                  onOpenEditModal={handleOpenEditModal}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        <p>Built for CodeNova Internship &bull; Production Notes CRUD Application</p>
      </footer>

      {/* Modal Edit Dialog */}
      <EditNoteModal
        note={editingNote}
        isOpen={isModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleUpdateNote}
      />
    </div>
  );
}

