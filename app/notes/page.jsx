"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useTheme } from "../components/ThemeProvider";
import Link from "next/link";

function timeAgo(date) {
  const now = new Date();
  const d = new Date(date);
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getPreview(content) {
  const text = content.replace(/\n/g, " ").trim();
  return text.length > 80 ? text.slice(0, 80) + "…" : text || "No additional text";
}

export default function NotesPage() {
  const { theme, toggleTheme } = useTheme();
  const [notes, setNotes] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const saveTimerRef = useRef(null);
  const titleRef = useRef(null);
  const contentRef = useRef(null);

  const activeNote = notes.find((n) => n._id === activeId);

  // Fetch notes
  const fetchNotes = useCallback(async () => {
    try {
      const res = await fetch("/api/notes");
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
        return data;
      }
    } catch (err) {
      console.error("Failed to fetch notes:", err);
    } finally {
      setIsLoaded(true);
    }
    return [];
  }, []);

  useEffect(() => {
    fetchNotes().then((data) => {
      if (data && data.length > 0 && !activeId) {
        setActiveId(data[0]._id);
      }
    });
  }, [fetchNotes, activeId]);

  // Auto-save with debounce
  const saveNote = useCallback(
    async (id, updates) => {
      // Optimistic update
      setNotes((prev) =>
        prev.map((n) => (n._id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n))
      );

      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(async () => {
        try {
          await fetch(`/api/notes/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
          });
        } catch (err) {
          console.error("Failed to save note:", err);
        }
      }, 500);
    },
    []
  );

  // Create new note
  async function createNote() {
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Untitled", content: "" }),
      });
      if (res.ok) {
        const note = await res.json();
        setNotes((prev) => [note, ...prev]);
        setActiveId(note._id);
        setSidebarOpen(false);
        // Focus title after render
        setTimeout(() => titleRef.current?.focus(), 100);
      }
    } catch (err) {
      console.error("Failed to create note:", err);
    }
  }

  // Delete note
  async function deleteNote(id) {
    try {
      await fetch(`/api/notes/${id}`, { method: "DELETE" });
      setNotes((prev) => prev.filter((n) => n._id !== id));
      if (activeId === id) setActiveId(null);
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Failed to delete note:", err);
    }
  }

  // Pin/unpin note
  async function togglePin(id) {
    const note = notes.find((n) => n._id === id);
    if (!note) return;
    const pinned = !note.pinned;
    setNotes((prev) =>
      prev.map((n) => (n._id === id ? { ...n, pinned } : n))
    );
    try {
      await fetch(`/api/notes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinned }),
      });
    } catch (err) {
      console.error("Failed to toggle pin:", err);
    }
  }

  // Filter notes
  const filteredNotes = notes
    .filter((n) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return b.pinned ? 1 : -1;
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });

  const pinnedNotes = filteredNotes.filter((n) => n.pinned);
  const unpinnedNotes = filteredNotes.filter((n) => !n.pinned);

  if (!isLoaded) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-amber-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-800">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Delete Note</h3>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Are you sure you want to delete &ldquo;{notes.find((n) => n._id === deleteConfirm)?.title || "Untitled"}&rdquo;? This can&apos;t be undone.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteNote(deleteConfirm)}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80 sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 py-1.5 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Back to tasks */}
              <Link
                href="/"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 transition-colors"
                title="Back to Tasks"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
              </Link>
              {/* Toggle sidebar on mobile */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 transition-colors sm:hidden"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
              <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Notes</h1>
              <span className="text-sm text-zinc-400 dark:text-zinc-500">{notes.length} notes</span>
            </div>

            <div className="flex items-center gap-2">
              {/* New note */}
              <button
                onClick={createNote}
                className="flex h-9 items-center gap-2 rounded-xl bg-amber-500 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-amber-600 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span className="hidden sm:inline">New Note</span>
              </button>
              {/* Theme */}
              <button
                onClick={toggleTheme}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 transition-colors"
              >
                {theme === "dark" ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content: Sidebar + Editor */}
      <div className="flex flex-1 overflow-hidden" style={{ height: "calc(100vh - 49px)" }}>
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"
          } absolute sm:relative z-30 w-72 sm:w-80 flex flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 transition-transform duration-200 h-full`}
        >
          {/* Search */}
          <div className="p-3 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2 rounded-xl bg-zinc-100 px-3 py-2 dark:bg-zinc-800">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400 shrink-0">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notes..."
                className="flex-1 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 outline-none"
              />
              {search && (
                <button onClick={() => setSearch("")} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Notes list */}
          <div className="flex-1 overflow-y-auto">
            {filteredNotes.length === 0 && search ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  No notes match your search
                </p>
              </div>
            ) : filteredNotes.length > 0 ? (
              <>
                {/* Pinned section */}
                {pinnedNotes.length > 0 && (
                  <div>
                    <div className="px-4 pt-3 pb-1">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                        Pinned
                      </span>
                    </div>
                    {pinnedNotes.map((note) => (
                      <NoteListItem
                        key={note._id}
                        note={note}
                        isActive={activeId === note._id}
                        onClick={() => {
                          setActiveId(note._id);
                          setSidebarOpen(false);
                        }}
                        onPin={() => togglePin(note._id)}
                        onDelete={() => setDeleteConfirm(note._id)}
                      />
                    ))}
                  </div>
                )}
                {/* All notes */}
                {unpinnedNotes.length > 0 && (
                  <div>
                    {pinnedNotes.length > 0 && (
                      <div className="px-4 pt-3 pb-1">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                          Notes
                        </span>
                      </div>
                    )}
                    {unpinnedNotes.map((note) => (
                      <NoteListItem
                        key={note._id}
                        note={note}
                        isActive={activeId === note._id}
                        onClick={() => {
                          setActiveId(note._id);
                          setSidebarOpen(false);
                        }}
                        onPin={() => togglePin(note._id)}
                        onDelete={() => setDeleteConfirm(note._id)}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : null}
          </div>
        </aside>

        {/* Click-away overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/30 sm:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Editor */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {activeNote ? (
            <div className="flex-1 flex flex-col overflow-y-auto">
              {/* Editor toolbar */}
              <div className="flex items-center justify-between px-6 py-2 border-b border-zinc-100 dark:border-zinc-800/50">
                <span className="text-xs text-zinc-400 dark:text-zinc-500">
                  {timeAgo(activeNote.updatedAt)}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => togglePin(activeNote._id)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                      activeNote.pinned
                        ? "text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                        : "text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    }`}
                    title={activeNote.pinned ? "Unpin" : "Pin"}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill={activeNote.pinned ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 17v5" />
                      <path d="M9 2h6l-1.5 5h-3L9 2z" />
                      <path d="M7.5 7h9l-1 5h-7l-1-5z" />
                      <path d="M8.5 12l-1 5h9l-1-5" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(activeNote._id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Delete"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Title */}
              <div className="px-6 pt-6">
                <input
                  ref={titleRef}
                  type="text"
                  value={activeNote.title}
                  onChange={(e) => saveNote(activeNote._id, { title: e.target.value })}
                  placeholder="Note title"
                  className="w-full bg-transparent text-2xl font-bold text-zinc-900 dark:text-zinc-50 placeholder-zinc-300 dark:placeholder-zinc-600 outline-none"
                />
              </div>

              {/* Content */}
              <div className="flex-1 px-6 py-4">
                <textarea
                  ref={contentRef}
                  value={activeNote.content}
                  onChange={(e) => saveNote(activeNote._id, { content: e.target.value })}
                  placeholder="Start writing..."
                  className="w-full h-full min-h-[400px] bg-transparent text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300 placeholder-zinc-300 dark:placeholder-zinc-600 outline-none resize-none"
                />
              </div>
            </div>
          ) : null}
        </main>
      </div>

      {/* Empty state — centered on full page */}
      {!activeNote && (
        <div className="fixed inset-0 z-10 flex flex-col items-center justify-center text-center px-4 pointer-events-none">
          <div className="text-6xl mb-4 opacity-40">📝</div>
          <h3 className="text-lg font-semibold text-zinc-400 dark:text-zinc-500">
            Select a note or create a new one
          </h3>
          <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-600">
            Your notes are saved automatically
          </p>
          <button
            onClick={createNote}
            className="pointer-events-auto mt-4 flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-amber-600 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Note
          </button>
        </div>
      )}
    </div>
  );
}

// Sidebar note list item
function NoteListItem({ note, isActive, onClick, onPin, onDelete }) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className={`group relative cursor-pointer px-4 py-3 transition-colors ${
        isActive
          ? "bg-amber-50 border-l-2 border-amber-400 dark:bg-amber-900/20 dark:border-amber-500"
          : "border-l-2 border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h4 className={`text-sm font-semibold truncate ${
            isActive ? "text-amber-900 dark:text-amber-200" : "text-zinc-900 dark:text-zinc-100"
          }`}>
            {note.title || "Untitled"}
          </h4>
          <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500 truncate">
            {getPreview(note.content)}
          </p>
          <p className="mt-1 text-[11px] text-zinc-400 dark:text-zinc-600">
            {timeAgo(note.updatedAt)}
          </p>
        </div>
        {/* Actions */}
        {showActions && (
          <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={onPin}
              className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                note.pinned
                  ? "text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                  : "text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
              title={note.pinned ? "Unpin" : "Pin"}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill={note.pinned ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 17v5" />
                <path d="M9 2h6l-1.5 5h-3L9 2z" />
                <path d="M7.5 7h9l-1 5h-7l-1-5z" />
                <path d="M8.5 12l-1 5h9l-1-5" />
              </svg>
            </button>
            <button
              onClick={onDelete}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="Delete"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
