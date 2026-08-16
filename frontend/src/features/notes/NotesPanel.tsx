'use client'

import { FormEvent, useEffect, useState } from 'react'
import { getAuth } from 'firebase/auth'

import type { Note } from './types'
import {
  createNote,
  deleteNote,
  getNotes,
  updateNote,
} from './notes-service'

export default function NotesPanel() {
  const [notes, setNotes] = useState<Note[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function loadNotes() {
    try {
      setError('')

      const user = getAuth().currentUser

      if (!user) {
        setNotes([])
        return
      }

      const result = await getNotes(user.uid)
      setNotes(result)
    } catch (err) {
      console.error(err)
      setError('Unable to load notes.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotes()
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const user = getAuth().currentUser

    if (!user) {
      setError('You must be signed in.')
      return
    }

    if (!title.trim() || !content.trim()) {
      setError('Please enter both a title and note content.')
      return
    }

    try {
      setSaving(true)
      setError('')

      if (editingId) {
        await updateNote(editingId, title.trim(), content.trim())
      } else {
        await createNote(user.uid, title.trim(), content.trim())
      }

      setTitle('')
      setContent('')
      setEditingId(null)

      await loadNotes()
    } catch (err) {
      console.error(err)
      setError('Unable to save note.')
    } finally {
      setSaving(false)
    }
  }

  function handleEdit(note: Note) {
    setEditingId(note.id)
    setTitle(note.title)
    setContent(note.content)
    setError('')
  }

  async function handleDelete(noteId: string) {
    try {
      setError('')
      await deleteNote(noteId)

      if (editingId === noteId) {
        setEditingId(null)
        setTitle('')
        setContent('')
      }

      await loadNotes()
    } catch (err) {
      console.error(err)
      setError('Unable to delete note.')
    }
  }

  function handleCancelEdit() {
    setEditingId(null)
    setTitle('')
    setContent('')
    setError('')
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Notes</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Create, edit and delete your personal notes.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-lg border border-zinc-200 p-5 dark:border-zinc-800"
      >
        <div>
          <label
            htmlFor="note-title"
            className="mb-1 block text-sm font-medium"
          >
            Title
          </label>

          <input
            id="note-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Enter note title"
            className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700"
          />
        </div>

        <div>
          <label
            htmlFor="note-content"
            className="mb-1 block text-sm font-medium"
          >
            Note
          </label>

          <textarea
            id="note-content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Write your note..."
            rows={5}
            className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700"
          />
        </div>

        {error && (
          <p className="text-sm text-red-500">
            {error}
          </p>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
          >
            {saving
              ? 'Saving...'
              : editingId
                ? 'Update note'
                : 'Add note'}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium dark:border-zinc-700"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="space-y-3">
        {loading ? (
          <p className="text-sm text-zinc-500">Loading notes...</p>
        ) : notes.length === 0 ? (
          <p className="text-sm text-zinc-500">
            No notes yet.
          </p>
        ) : (
          notes.map((note) => (
            <article
              key={note.id}
              className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold">
                    {note.title}
                  </h3>

                  <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-300">
                    {note.content}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(note)}
                    className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(note.id)}
                    className="rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-600 dark:border-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  )
}