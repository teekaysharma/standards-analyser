-- Create tables for Standards Analyzer
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Session table
CREATE TABLE "Session" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);

-- Create Document table
CREATE TABLE "Document" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "sessionId" UUID NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "filePath" TEXT NOT NULL,
    "title" TEXT,
    "summary" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE
);

-- Create Chunk table
CREATE TABLE "Chunk" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "documentId" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" TEXT, -- Store as JSON or base64
    "chunkIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE
);

-- Create Query table
CREATE TABLE "Query" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "sessionId" UUID NOT NULL,
    "documentId" UUID,
    "query" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE,
    FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX "session_expiresAt_idx" ON "Session"("expiresAt");
CREATE INDEX "session_isActive_idx" ON "Session"("isActive");
CREATE INDEX "document_sessionId_idx" ON "Document"("sessionId");
CREATE INDEX "document_createdAt_idx" ON "Document"("createdAt");
CREATE INDEX "chunk_documentId_idx" ON "Chunk"("documentId");
CREATE INDEX "query_sessionId_idx" ON "Query"("sessionId");
CREATE INDEX "query_documentId_idx" ON "Query"("documentId");
CREATE INDEX "query_createdAt_idx" ON "Query"("createdAt");

-- Create storage bucket for documents
-- Run this in the Supabase Storage dashboard or use the SQL below:
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'documents', 
    'documents', 
    true, 
    10485760, -- 10MB in bytes
    ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
CREATE POLICY "Enable read access for all users" ON storage.objects
FOR SELECT USING (bucket_id = 'documents');

CREATE POLICY "Enable insert access for all users" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Enable update access for all users" ON storage.objects
FOR UPDATE USING (bucket_id = 'documents');

CREATE POLICY "Enable delete access for all users" ON storage.objects
FOR DELETE USING (bucket_id = 'documents');

-- Grant permissions
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT ALL ON storage.buckets TO postgres;
GRANT ALL ON storage.objects TO postgres;