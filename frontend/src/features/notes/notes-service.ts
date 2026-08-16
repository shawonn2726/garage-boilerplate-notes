import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where,
  } from 'firebase/firestore'
  
  import { getClientDb } from '@/lib/firebase/client'
  import type { Note } from './types'
  const db = getClientDb()
  const notesCollection = collection(db, 'notes')
  
  export async function getNotes(userId: string): Promise<Note[]> {
    const q = query(
      notesCollection,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )
  
    const snapshot = await getDocs(q)
  
    return snapshot.docs.map((item) => ({
      id: item.id,
      ...(item.data() as Omit<Note, 'id'>),
    }))
  }
  
  export async function createNote(
    userId: string,
    title: string,
    content: string
  ) {
    return addDoc(notesCollection, {
      userId,
      title,
      content,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }
  
  export async function updateNote(
    noteId: string,
    title: string,
    content: string
  ) {
    return updateDoc(doc(db, 'notes', noteId), {
      title,
      content,
      updatedAt: serverTimestamp(),
    })
  }
  
  export async function deleteNote(noteId: string) {
    return deleteDoc(doc(db, 'notes', noteId))
  }