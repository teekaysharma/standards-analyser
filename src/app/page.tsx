"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Upload, FileText, Search, LogOut, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Session {
  id: string
  expiresAt: string
  isActive: boolean
  createdAt: string
}

interface Document {
  id: string
  filename: string
  originalName: string
  fileType: string
  fileSize: number
  status: string
  createdAt: string
}

interface Query {
  id: string
  question: string
  answer?: string
  sources?: string
  createdAt: string
}

export default function Home() {
  const [session, setSession] = useState<Session | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [queries, setQueries] = useState<Query[]>([])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [question, setQuestion] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [isQuerying, setIsQuerying] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isDragOver, setIsDragOver] = useState(false)
  const { toast } = useToast()

  // Check for existing session on mount
  useEffect(() => {
    console.log("Component mounted, checking session...")
    const checkSession = async () => {
      try {
        console.log("Checking existing session...")
        const response = await fetch("/api/session/check", {
          credentials: "include"
        })
        console.log("Session check response:", response)
        if (response.ok) {
          const sessionData = await response.json()
          console.log("Existing session data:", sessionData)
          setSession(sessionData)
          loadDocuments(sessionData.id)
        } else {
          console.log("No existing session found")
        }
      } catch (error) {
        console.error("Session check failed:", error)
      }
    }
    checkSession()
  }, [])

  const loadDocuments = async (sessionId: string) => {
    try {
      console.log("Loading documents for session:", sessionId)
      const response = await fetch(`/api/documents?sessionId=${sessionId}`)
      console.log("Documents response:", response)
      if (response.ok) {
        const docs = await response.json()
        console.log("Documents loaded:", docs)
        setDocuments(docs)
      } else {
        console.error("Failed to load documents, status:", response.status)
      }
    } catch (error) {
      console.error("Failed to load documents:", error)
    }
  }

  const createSession = async () => {
    try {
      console.log("Creating session...")
      const response = await fetch("/api/session", {
        method: "POST",
        credentials: "include"
      })
      console.log("Session response:", response)
      if (response.ok) {
        const sessionData = await response.json()
        console.log("Session data:", sessionData)
        setSession(sessionData)
        console.log("Session state set, loading documents...")
        loadDocuments(sessionData.id)
        console.log("Documents load initiated")
        // Simple alert for now instead of toast
        alert("Session created successfully!")
      } else {
        const error = await response.json()
        console.error("Session creation failed:", error)
        alert("Failed to create session: " + (error.error || "Unknown error"))
      }
    } catch (error) {
      console.error("Session creation error:", error)
      alert("Failed to create session. Please check the console.")
    }
  }

  const endSession = async () => {
    if (!session) return
    
    try {
      const response = await fetch(`/api/session/${session.id}`, {
        method: "DELETE",
        credentials: "include"
      })
      if (response.ok) {
        setSession(null)
        setDocuments([])
        setQueries([])
        toast({
          title: "Session Ended",
          description: "Your session has been ended successfully."
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to end session.",
        variant: "destructive"
      })
    }
  }

  const handleFileUpload = async () => {
    if (selectedFiles.length === 0 || !session) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Upload files sequentially
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]
        const formData = new FormData()
        formData.append("file", file)
        formData.append("sessionId", session.id)

        const response = await fetch("/api/documents/upload", {
          method: "POST",
          body: formData,
          credentials: "include"
        })

        if (response.ok) {
          const result = await response.json()
          setDocuments(prev => [...prev, result.document])
          
          // Update progress
          const progress = ((i + 1) / selectedFiles.length) * 100
          setUploadProgress(progress)
        } else {
          const error = await response.json()
          toast({
            title: "Upload Failed",
            description: `${file.name}: ${error.message || "Failed to upload document."}`,
            variant: "destructive"
          })
        }
      }

      toast({
        title: "Upload Complete",
        description: `${selectedFiles.length} document(s) have been uploaded and processed.`
      })
      setSelectedFiles([])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload documents.",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleQuery = async () => {
    if (!question.trim() || documents.length === 0) return

    setIsQuerying(true)
    const latestDocument = documents[documents.length - 1]

    try {
      const response = await fetch("/api/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          documentId: latestDocument.id,
          question: question
        }),
        credentials: "include"
      })

      if (response.ok) {
        const result = await response.json()
        setQueries(prev => [result.query, ...prev])
        setQuestion("")
        toast({
          title: "Query Processed",
          description: "Your question has been answered."
        })
      } else {
        const error = await response.json()
        toast({
          title: "Query Failed",
          description: error.message || "Failed to process query.",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process query.",
        variant: "destructive"
      })
    } finally {
      setIsQuerying(false)
    }
  }

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    const validFiles = files.filter(file => {
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
      return allowedTypes.includes(file.type) && file.size <= 10 * 1024 * 1024 // 10MB
    })
    
    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validFiles = files.filter(file => {
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
      return allowedTypes.includes(file.type) && file.size <= 10 * 1024 * 1024 // 10MB
    })
    
    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles])
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready": return "bg-green-500"
      case "processing": return "bg-yellow-500"
      case "error": return "bg-red-500"
      default: return "bg-gray-500"
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
              Standards Analyzer
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Analyze standards documents with AI-powered insights
            </p>
          </div>
          
          {session && (
            <div className="flex items-center gap-4">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Session expires: {new Date(session.expiresAt).toLocaleString()}
                </div>
              </div>
              <Button variant="outline" onClick={endSession}>
                <LogOut className="h-4 w-4 mr-2" />
                End Session
              </Button>
            </div>
          )}
        </div>

        {!session ? (
          // Session Creation
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <FileText className="h-6 w-6" />
                Welcome to Standards Analyzer
              </CardTitle>
              <CardDescription>
                Create a session to start analyzing your standards documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => {
                  console.log("Button clicked!")
                  createSession()
                }} 
                className="w-full mb-2"
              >
                Create New Session
              </Button>
              <Button 
                onClick={() => {
                  console.log("Test button clicked!")
                  alert("Test button works!")
                }} 
                variant="outline"
                className="w-full mb-2"
              >
                Test Button (No API)
              </Button>
              <Button 
                onClick={async () => {
                  console.log("Debug button clicked!")
                  try {
                    const response = await fetch("/api/debug-session", {
                      method: "POST",
                      credentials: "include"
                    })
                    const result = await response.json()
                    console.log("Debug result:", result)
                    alert("Debug result: " + JSON.stringify(result, null, 2))
                  } catch (error) {
                    console.error("Debug error:", error)
                    alert("Debug error: " + error.message)
                  }
                }} 
                variant="outline"
                className="w-full"
              >
                Debug Session API
              </Button>
            </CardContent>
          </Card>
        ) : (
          // Main Application
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel - Document Upload */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload Document
                  </CardTitle>
                  <CardDescription>
                    Upload PDF, DOCX, or TXT files for analysis
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div 
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      isDragOver 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      accept=".pdf,.docx,.txt"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                        PDF, DOCX, TXT up to 10MB each
                      </p>
                    </label>
                  </div>
                  
                  {selectedFiles.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Selected Files ({selectedFiles.length})
                      </p>
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <FileText className="h-4 w-4 text-slate-600" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {file.name}
                              </p>
                              <p className="text-xs text-slate-600 dark:text-slate-400">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="h-8 w-8 p-0"
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <Button 
                    onClick={handleFileUpload} 
                    disabled={selectedFiles.length === 0 || isUploading}
                    className="w-full"
                  >
                    {isUploading ? "Processing..." : `Upload & Process ${selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''}`}
                  </Button>
                  
                  {isUploading && (
                    <div className="space-y-2">
                      <Progress value={uploadProgress} />
                      <p className="text-xs text-center text-slate-600 dark:text-slate-400">
                        Processing document...
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Documents List */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    {documents.length === 0 ? (
                      <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                        No documents uploaded yet
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {documents.map((doc) => (
                          <div key={doc.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <FileText className="h-4 w-4 text-slate-600" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {doc.originalName}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className={`text-xs ${getStatusColor(doc.status)}`}>
                                  {doc.status}
                                </Badge>
                                <span className="text-xs text-slate-500">
                                  {formatFileSize(doc.fileSize)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Right Panel - Query Interface */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Query Document
                  </CardTitle>
                  <CardDescription>
                    Ask questions about your uploaded standards documents
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Enter your question about the document..."
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      className="flex-1 resize-none"
                      rows={3}
                    />
                    <Button 
                      onClick={handleQuery} 
                      disabled={!question.trim() || documents.length === 0 || isQuerying}
                    >
                      {isQuerying ? "Processing..." : "Ask"}
                    </Button>
                  </div>

                  {/* Query History */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Query History</h3>
                    <ScrollArea className="h-96">
                      {queries.length === 0 ? (
                        <div className="text-center py-8">
                          <Search className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                          <p className="text-slate-500 dark:text-slate-400">
                            No queries yet. Ask a question to get started.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {queries.map((query) => (
                            <Card key={query.id}>
                              <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                  <CardTitle className="text-sm font-medium">
                                    {query.question}
                                  </CardTitle>
                                  <span className="text-xs text-slate-500">
                                    {formatTime(query.createdAt)}
                                  </span>
                                </div>
                              </CardHeader>
                              <CardContent>
                                {query.answer ? (
                                  <div className="space-y-3">
                                    <div className="prose prose-sm dark:prose-invert max-w-none">
                                      <p className="text-sm">{query.answer}</p>
                                    </div>
                                    {query.sources && (
                                      <details className="text-sm">
                                        <summary className="cursor-pointer text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
                                          View Sources
                                        </summary>
                                        <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-800 rounded text-xs">
                                          <pre className="whitespace-pre-wrap">
                                            {JSON.stringify(JSON.parse(query.sources), null, 2)}
                                          </pre>
                                        </div>
                                      </details>
                                    )}
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 text-slate-500">
                                    <div className="animate-spin h-4 w-4 border-2 border-slate-300 border-t-slate-600 rounded-full" />
                                    <span className="text-sm">Processing...</span>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}