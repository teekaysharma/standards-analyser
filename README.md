# 📊 Standards Analyzer

A modern, AI-powered web application for analyzing standards documents while respecting copyright restrictions. Built with Next.js 15, Supabase, and designed for secure, cloud-based document processing.

## ✨ Features

- **🔒 Secure Document Processing**: All documents stored securely in Supabase
- **🤖 AI-Powered Analysis**: Intelligent document analysis using Z.ai SDK
- **📄 Multi-Format Support**: Upload and analyze PDF, DOCX, and TXT files
- **⏰ Session Management**: Temporary sessions with automatic cleanup (30-minute expiry)
- **💬 Interactive Q&A**: Ask questions about your documents and get AI-powered answers
- **🎨 Modern UI**: Beautiful, responsive interface built with shadcn/ui components
- **📱 Mobile-Friendly**: Fully responsive design for all devices
- **☁️ Cloud Storage**: Powered by Supabase for scalability and reliability

## 🚀 Technology Stack

### Core Framework
- **⚡ Next.js 15** - React framework with App Router
- **📘 TypeScript 5** - Type-safe development
- **🎨 Tailwind CSS 4** - Utility-first styling
- **🧩 shadcn/ui** - High-quality UI components

### Backend & Database
- **🗄️ Supabase** - PostgreSQL database + authentication + storage
- **🤖 Z.ai SDK** - AI-powered document analysis
- **🍪 Session Management** - Secure cookie-based sessions
- **⚡ Prisma ORM** - Type-safe database operations

### Storage & Infrastructure
- **📁 Supabase Storage** - Secure file storage with CDN
- **🌍 Supabase CDN** - Fast global content delivery
- **🔄 Real-time Capabilities** - WebSocket support for live updates

### UI/UX Features
- **🎯 Lucide React** - Beautiful icons
- **🌈 Framer Motion** - Smooth animations
- **📊 Responsive Design** - Mobile-first approach
- **🔔 Toast Notifications** - User feedback system

## 🎯 Architecture Overview

This application follows a modern, cloud-native architecture:

```
Frontend (Next.js) → API Routes (Vercel) → Supabase (Database + Storage)
```

### Components

1. **Frontend (Public)**: Next.js web interface - safe for public deployment
2. **Backend (Serverless)**: Next.js API routes hosted on Vercel
3. **Database**: PostgreSQL hosted on Supabase
4. **Storage**: Supabase Storage for document files
5. **AI Processing**: Local AI analysis using Z.ai SDK

### Key Security Features

- **Document Privacy**: Files stored securely in Supabase with access controls
- **Session Expiry**: Automatic cleanup after 30 minutes
- **File Validation**: Secure file upload with type and size restrictions
- **No External Services**: All AI processing happens locally
- **GDPR Compliant**: Data residency and privacy controls

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (free)

### Step 1: Set Up Supabase

1. **Create Supabase Account**
   ```bash
   # Go to https://supabase.com and sign up
   # It's free and takes 2 minutes
   ```

2. **Create New Project**
   - Click "New Project"
   - Choose organization
   - Enter project name (e.g., "standards-analyzer")
   - Enter database password
   - Select region closest to your users
   - Click "Create new project"

3. **Get Your Credentials**
   - Go to Project Settings → API
   - Copy the **Project URL** and **anon key**
   - Go to Project Settings → Database
   - Copy the **Connection string**
   - Go to Project Settings → Service Roles
   - Copy the **service_role_key**

### Step 2: Configure Environment

1. **Copy Environment Template**
   ```bash
   cp .env.example .env
   ```

2. **Update Environment Variables**
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-service-role-key

   # Database Configuration
   DATABASE_URL=postgresql://postgres:[password]@db.your-project-id.supabase.co:5432/postgres
   ```

### Step 3: Install and Run

```bash
# Install dependencies
npm install

# Set up the database
npm run db:push

# Start development server
npm run dev
```

### Step 4: Set Up Supabase Storage

1. **Create Storage Bucket**
   - Go to Storage section in Supabase dashboard
   - Create new bucket named "documents"
   - Set as public bucket (for file access)

2. **Configure CORS (if needed)**
   - Go to Storage → Settings
   - Add CORS configuration for your domain

## 📁 Project Structure

```
standards-analyzer/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── session/       # Session management
│   │   │   ├── documents/     # Document processing
│   │   │   └── query/         # Query handling
│   │   ├── page.tsx           # Main application page
│   │   └── layout.tsx         # Root layout
│   ├── components/            # React components
│   │   └── ui/               # shadcn/ui components
│   ├── hooks/                 # Custom React hooks
│   └── lib/                   # Utilities and database
│       ├── supabase.ts       # Supabase client
│       ├── supabase-storage.ts # Storage utilities
│       └── db.ts             # Prisma database
├── prisma/                    # Database schema
├── uploads/                   # Local temp storage (dev only)
└── public/                    # Static assets
```

## 🔧 Configuration

### Environment Variables

```env
# Required: Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Required: Database
DATABASE_URL=your-postgresql-connection-string

# Optional: Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Database Setup

```bash
# Push schema to Supabase PostgreSQL
npm run db:push

# Generate Prisma client
npm run db:generate
```

## 🌍 Deployment

### Vercel + Supabase (Recommended)

This is the **perfect free combination**:

#### **Step 1: Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/standards-analyzer.git
git push -u origin main
```

#### **Step 2: Deploy to Vercel**
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `DATABASE_URL`
4. Click "Deploy"

#### **Step 3: Configure Domain (Optional)**
- Add custom domain in Vercel dashboard
- Update URL in Supabase CORS settings

### Cost Breakdown

| Service | Free Tier | Our Usage | Cost |
|---------|------------|------------|------|
| **Vercel** | 100GB bandwidth, 6000 build mins | ~50MB/month, ~2 mins/build | **$0** |
| **Supabase** | 500MB DB, 1GB Storage, 5GB bandwidth | ~50MB DB, ~100MB storage, ~200MB bandwidth | **$0** |
| **Total** | | | **$0/month** |

## 🛡️ Security Considerations

### Document Privacy

- **Supabase Storage**: Files stored securely with Row Level Security
- **Access Controls**: Only authenticated sessions can access documents
- **Automatic Cleanup**: Files removed when sessions expire
- **GDPR Compliant**: Data residency and privacy controls

### Session Security

- **HTTP-Only Cookies**: Session identifiers stored securely
- **Automatic Expiry**: Sessions expire after 30 minutes
- **Supabase Auth**: Built-in authentication infrastructure
- **Environment Variables**: Sensitive data never in code

### Network Security

- **HTTPS**: Automatic SSL certificates from Vercel
- **CORS**: Proper cross-origin configuration
- **API Rate Limiting**: Built-in protection from abuse

## 📊 File Support

### Supported Formats

- **PDF**: Portable Document Format files
- **DOCX**: Microsoft Word documents
- **TXT**: Plain text files

### File Restrictions

- **Maximum Size**: 10MB per file
- **File Types**: Only PDF, DOCX, and TXT are accepted
- **Storage**: Secure Supabase storage with CDN delivery

## 🤖 AI Processing

### Document Analysis

The application uses Z.ai SDK for intelligent document analysis:

1. **Upload**: Files stored in Supabase Storage
2. **Processing**: Text extracted and chunked for analysis
3. **Indexing**: Content prepared for fast querying
4. **Q&A**: Questions answered using document context

### Query Features

- **Context-Aware Answers**: Responses based on document content
- **Source Citation**: Answers include references to relevant sections
- **Multi-Chunk Analysis**: Combines information from multiple sections
- **Error Handling**: Graceful handling of processing errors

## 🧪 Testing

```bash
# Run linting
npm run lint

# Type checking
npx tsc --noEmit

# Database validation
npm run db:push
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 🚀 Production Checklist

Before deploying to production:

- [ ] Set up Supabase project
- [ ] Configure environment variables
- [ ] Set up storage bucket
- [ ] Test document upload and processing
- [ ] Test query functionality
- [ ] Verify session management
- [ ] Check security settings
- [ ] Deploy to Vercel
- [ ] Set up custom domain (optional)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Related Technologies

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - PostgreSQL + Storage + Auth
- [Vercel](https://vercel.com/) - Deployment platform
- [Prisma](https://prisma.io/) - Modern ORM
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Z.ai](https://z.ai/) - AI SDK

## 💡 Tips & Tricks

### Development
- Use `npm run dev` for local development
- Changes automatically reload with hot refresh
- Database changes require `npm run db:push`

### Production
- Monitor usage in Supabase dashboard
- Set up alerts for database usage
- Use Vercel analytics for performance monitoring

### Scaling
- Supabase can handle significant growth
- Vercel scales automatically with traffic
- Consider upgrading plans for high-traffic usage

---

Built with ❤️ for secure document analysis. **100% Free to deploy and operate** with Vercel + Supabase.

**Get Started**: 
1. [Create Supabase Account](https://supabase.com) (2 minutes)
2. [Deploy to Vercel](https://vercel.com) (1 click)
3. Start analyzing documents! 🚀
