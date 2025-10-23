# Supabase Setup Guide

## 🚀 Quick Setup Instructions

### 1. Run SQL in Supabase Dashboard

1. **Go to your Supabase Dashboard**: https://wvlflfazprggruisarns.supabase.co
2. **Navigate to**: SQL Editor → New query
3. **Copy and paste** the contents of `supabase-setup.sql`
4. **Run** the SQL query

### 2. Create Storage Bucket (Alternative)

If the SQL doesn't create the storage bucket automatically:

1. **Go to**: Storage → Create new bucket
2. **Bucket name**: `documents`
3. **Public bucket**: ✅ Yes
4. **File size limit**: 10MB (or higher if needed)
5. **Allowed MIME types**: 
   - `application/pdf`
   - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
   - `text/plain`

### 3. Environment Variables for Vercel

Copy these variables to your Vercel project settings:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://wvlflfazprggruisarns.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2bGZsZmF6cHJnZ3J1aXNhcm5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMTM3MDEsImV4cCI6MjA3Njc4OTcwMX0.XsvwuFyBk-Nriwd_7Iwt5RcL5bMG1iepMCvp8moKczs
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2bGZsZmF6cHJnZ3J1aXNhcm5zIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTIxMzcwMSwiZXhwIjoyMDc2Nzg5NzAxfQ.RqJfdsgAk_oOKhXSaTzEEgLRQpgpGWyTsjDppNvtvD4

# Database URL (if needed)
# DATABASE_URL=postgresql://postgres.wvlflfazprggruisarns:HseAiDb@GitHub@aws-0-us-west-1.pooler.supabase.com:6543/postgres

# AI Configuration (if using Z.ai SDK)
# ZAI_API_KEY=your_zai_api_key
```

## 🔧 Database Schema

The following tables will be created:

### Session Table
- Stores user sessions with 30-minute expiration
- Tracks active status

### Document Table
- Stores uploaded file information
- Links to sessions and storage

### Chunk Table
- Stores document chunks for processing
- Used for AI analysis and search

### Query Table
- Stores user queries and AI responses
- Links to sessions and documents

## ✅ Verification

After running the SQL, verify:

1. **Tables exist** in Database → Table editor
2. **Storage bucket** exists in Storage section
3. **Policies** are set correctly
4. **Indexes** are created for performance

## 🚨 Troubleshooting

### If tables don't create:
- Check for syntax errors in SQL
- Ensure you have admin permissions
- Try running each table creation separately

### If storage bucket doesn't create:
- Create manually via Storage dashboard
- Check bucket policies

### If connection fails:
- Verify environment variables
- Check Supabase project status
- Ensure IP whitelisting (if enabled)

## 🎯 Next Steps

1. **Deploy to Vercel**:
   - Connect GitHub repository
   - Add environment variables
   - Deploy

2. **Test the application**:
   - Upload a document
   - Ask questions
   - Verify responses

3. **Monitor usage**:
   - Check Supabase logs
   - Monitor storage usage
   - Track database performance

Your Standards Analyzer is now ready for production! 🎉