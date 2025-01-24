"use client"
import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input" 
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

// Define the structure of a note
interface Note {
  id: number
  title: string
  content: string
  date: string
}

export default function Home() {
  // Initial sample notes
  const initialNotes: Note[] = [
    {
      id: 1,
      title: "The Art of Programming",
      content: "Programming is both a science and an art form. Like any craft, it requires technical knowledge and precision, but also creativity and intuition. The best programmers are those who can balance these aspects, creating code that is not only functional but also elegant and maintainable.\n\nJust as a writer crafts stories with words, a programmer writes solutions with code. Each line serves a purpose, each function tells a story, and the whole program comes together like chapters in a book. The joy of programming comes from solving complex problems with simple, beautiful solutions.",
      date: new Date().toLocaleDateString()
    },
    {
      id: 2,
      title: "Web Development Journey",
      content: "Starting my journey in web development has been an exciting adventure. From learning HTML and CSS basics to diving into JavaScript and React, each step has opened new possibilities. The web is an incredibly dynamic platform, constantly evolving with new technologies and approaches.\n\nOne of the most fascinating aspects is how different technologies work together. Frontend frameworks like React make building interactive interfaces intuitive, while backend technologies handle data and business logic. Understanding how these pieces fit together is like solving a complex puzzle, where each piece has its own unique role.",
      date: new Date().toLocaleDateString()
    },
    {
      id: 3,
      title: "Future of AI in Technology",
      content: "Artificial Intelligence is revolutionizing the way we approach software development and problem-solving. From automated testing to code generation, AI tools are becoming an integral part of a developer's toolkit. These advancements are not replacing programmers but rather augmenting their capabilities and productivity.\n\nThe future looks even more promising as AI continues to evolve. We're seeing the emergence of systems that can understand context, generate complex code structures, and even debug applications. However, it's crucial to remember that human creativity and critical thinking remain essential in guiding these tools and ensuring they produce meaningful results.",
      date: new Date().toLocaleDateString()
    }
  ];

  // State to store notes and form inputs
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)

  // Function to add or update a note
  const handleSubmit = () => {
    if (title.trim() === "" || content.trim() === "") return

    if (editingId) {
      // Update existing note
      setNotes(notes.map(note => 
        note.id === editingId 
          ? { ...note, title, content, date: new Date().toLocaleDateString() }
          : note
      ))
      setEditingId(null)
    } else {
      // Add new note
      const newNote: Note = {
        id: Date.now(),
        title,
        content,
        date: new Date().toLocaleDateString()
      }
      setNotes([...notes, newNote])
    }

    // Clear the form
    setTitle("")
    setContent("")
  }

  // Function to start editing a note
  const handleEdit = (note: Note) => {
    setTitle(note.title)
    setContent(note.content)
    setEditingId(note.id)
  }

  // Function to delete a note
  const handleDelete = (id: number) => {
    setNotes(notes.filter(note => note.id !== id))
  }

  return (
    <div className="min-h-screen p-8">
      {/* Note Input Section */}
      <div className="max-w-2xl mx-auto mb-12 space-y-4">
        <h1 className="text-2xl font-bold mb-6">My Notes</h1>
        
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
        {notes.map((note) => (
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
              <p className="whitespace-pre-wrap">{note.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
