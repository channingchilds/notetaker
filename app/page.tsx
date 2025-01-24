"use client"
import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input" 
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase"

// Define the structure of a note
interface Note {
  id: number
  title: string
  content: string
  date: string
}

export default function Home() {
  // State to store notes and form inputs
  const [notes, setNotes] = useState<Note[]>([])
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [summaryNote, setSummaryNote] = useState<Note | null>(null)
  const [summary, setSummary] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  // Fetch notes from Supabase on component mount
  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    setIsLoading(true)
    try {
      console.log('Attempting to fetch notes...')
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      if (data) {
        console.log('Successfully fetched notes:', data)
        setNotes(data)
      }
    } catch (error) {
      console.error('Error fetching notes:', error)
      console.dir(error)
    } finally {
      setIsLoading(false)
    }
  }

  // Function to add or update a note
  const handleSubmit = async () => {
    if (title.trim() === "" || content.trim() === "") return

    try {
      if (editingId) {
        // Update existing note
        const { error } = await supabase
          .from('notes')
          .update({
            title,
            content,
            date: new Date().toLocaleDateString()
          })
          .eq('id', editingId)

        if (error) {
          console.error('Supabase update error:', error)
          throw error
        }
      } else {
        // Add new note
        const newNote = {
          id: Date.now(),
          title,
          content,
          date: new Date().toLocaleDateString()
        }

        const { error } = await supabase
          .from('notes')
          .insert(newNote)

        if (error) {
          console.error('Supabase insert error:', error)
          throw error
        }
      }

      // Refresh notes
      await fetchNotes()
      
      // Clear form
      setTitle("")
      setContent("")
      setEditingId(null)
    } catch (error) {
      console.error('Error saving note:', error)
    }
  }

  // Function to start editing a note
  const handleEdit = (note: Note) => {
    setTitle(note.title)
    setContent(note.content)
    setEditingId(note.id)
  }

  // Function to delete a note
  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      // Refresh notes
      fetchNotes()
    } catch (error) {
      console.error('Error deleting note:', error)
    }
  }

  // Add this new function to handle summary generation
  const handleGenerateSummary = async (note: Note) => {
    setIsLoading(true)
    setSummaryNote(note)
    
    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: note.content }),
      })

      const data = await response.json()
      
      if (response.ok) {
        setSummary(data.summary)
      } else {
        throw new Error(data.error || 'Failed to generate summary')
      }
    } catch (error) {
      console.error('Error:', error)
      setSummary('Failed to generate summary. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Add this function to close the dialog
  const handleDialogClose = () => {
    setSummaryNote(null)
    setSummary("")
  }

  // Add this function to test the connection
  const testSupabaseConnection = async () => {
    try {
      console.log('Testing Supabase connection...')
      const testNote = {
        id: Date.now(),
        title: 'Test Note',
        content: 'This is a test note',
        date: new Date().toLocaleDateString()
      }

      const { data, error } = await supabase
        .from('notes')
        .insert(testNote)
        .select()

      if (error) {
        console.error('Test insert error:', error)
        throw error
      }

      console.log('Successfully inserted test note:', data)
      await fetchNotes()
    } catch (error) {
      console.error('Test connection failed:', error)
    }
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto mb-12 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold mb-6">My Notes</h1>
          <Button 
            onClick={testSupabaseConnection}
            variant="outline"
            size="sm"
          >
            Test Connection
          </Button>
        </div>
        
        <div className="space-y-4">
          <Input
            placeholder="Note Title"
            value={title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="Write your note here..."
            value={content}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
            className="min-h-[100px]"
          />
          <Button onClick={handleSubmit} className="w-full">
            {editingId ? 'Update Note' : 'Add Note'}
          </Button>
          {editingId && (
            <Button 
              variant="outline" 
              onClick={() => {
                setEditingId(null)
                setTitle("")
                setContent("")
              }} 
              className="w-full mt-2"
            >
              Cancel Edit
            </Button>
          )}
        </div>
      </div>

      {/* Notes Display Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : notes.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No notes yet. Create your first note above!
          </div>
        ) : (
          notes.map((note) => (
            <Card key={note.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{note.title}</CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEdit(note)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDelete(note.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  {note.date}
                </p>
                <p className="whitespace-pre-wrap mb-4">{note.content}</p>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => handleGenerateSummary(note)}
                  className="w-full"
                >
                  Generate AI Summary
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialog component */}
      <Dialog open={summaryNote !== null} onOpenChange={handleDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>AI Summary: {summaryNote?.title}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              AI-generated summary of your note
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <p className="text-sm text-gray-700 dark:text-gray-300">{summary}</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
