# 📚 Smart Document Search & AI Assistant

A modern web application that combines document management, AI-powered search, and intelligent chat capabilities. Upload documents, search through them with advanced AI features, and have conversations about your content.

## ✨ Features

### 🔍 **Advanced Search**
- **Full-text search** across document titles and content
- **Real-time search suggestions** with autocomplete
- **Relevance scoring** and result highlighting
- **Pagination** for large result sets
- **Search analytics** and query logging

### 🤖 **AI-Powered Chat**
- **Document-aware conversations** - chat about specific documents
- **Conversation memory** - AI remembers previous messages in the session
- **Context-aware responses** - AI understands document content
- **Smart suggestions** - pre-built questions for quick start
- **Real-time chat interface** with typing indicators

### 📄 **Document Management**
- **Upload support** for `.txt`, `.md`, `.json` files
- **Background processing** with AI-powered analysis
- **Document status tracking** (processing/ready)
- **Document listing** with metadata and actions
- **Processing pipeline** with error handling

### ⚡ **Real-time Features**
- **Live progress tracking** for document processing
- **WebSocket-based updates** for job status
- **Real-time search results** with instant feedback
- **Background job processing** with Trigger.dev

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (Next.js)                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Home      │  │   Search    │  │    Chat     │  │ Documents   │        │
│  │   Page      │  │   Page      │  │  Interface  │  │   Page      │        │
│  │             │  │             │  │             │  │             │        │
│  │ • Upload    │  │ • Real-time │  │ • Message   │  │ • Document  │        │
│  │   Form      │  │   Search    │  │   History   │  │   Listing   │        │
│  │ • Progress  │  │ • Auto-     │  │ • Context   │  │ • Status    │        │
│  │   Tracking  │  │   complete  │  │   Memory    │  │   Display   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ HTTP Requests
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              BACKEND (API Routes)                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ /api/       │  │ /api/       │  │ /api/       │  │ /api/       │        │
│  │ documents/  │  │ search      │  │ chat        │  │ documents/  │        │
│  │ upload      │  │             │  │             │  │             │        │
│  │             │  │ • Query     │  │ • Message   │  │ • List all  │        │
│  │ • File      │  │   Typesense │  │   Processing│  │   documents │        │
│  │   Upload    │  │ • Results   │  │ • OpenAI    │  │ • Metadata  │        │
│  │ • Database  │  │   Formatting│  │   Integration│  │   Retrieval │        │
│  │   Storage   │  │ • Analytics │  │ • Memory    │  │             │        │
│  │ • Trigger   │  │   Logging   │  │   Management│  │             │        │
│  │   Job       │  │             │  │             │  │             │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ Background Jobs
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           BACKGROUND PROCESSING                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                    Trigger.dev Workers                                │   │
│  │                                                                       │   │
│  │  ┌─────────────┐                    ┌─────────────┐                  │   │
│  │  │ Document    │                    │ AI Analysis │                  │   │
│  │  │ Processing  │                    │ Task        │                  │   │
│  │  │             │                    │             │                  │   │
│  │  │ • File      │◄─────────────────►│ • OpenAI    │                  │   │
│  │  │   Parsing   │                   │   API Call  │                  │   │
│  │  │ • Content   │                   │ • Summary   │                  │   │
│  │  │   Extraction│                   │   Generation│                  │   │
│  │  │ • Database  │                   │ • Keyword   │                  │   │
│  │  │   Update    │                   │   Extraction│                  │   │
│  │  │ • Typesense │                   │ • Metadata  │                  │   │
│  │  │   Indexing  │                   │   Update    │                  │   │
│  │  └─────────────┘                    └─────────────┘                  │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ External Services
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            EXTERNAL SERVICES                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐   │
│  │   Supabase  │    │  Typesense  │    │   OpenAI    │    │ Trigger.dev │   │
│  │  (Database) │    │   (Search)  │    │    (AI)     │    │ (Background)│   │
│  │             │    │             │    │             │    │             │   │
│  │ • PostgreSQL│    │ • Full-text │    │ • GPT-4o-   │    │ • Job Queue │   │
│  │   Database  │    │   Search    │    │   mini      │    │ • Real-time │   │
│  │ • Document  │    │ • Auto-     │    │ • Chat      │    │   Updates   │   │
│  │   Metadata  │    │   complete  │    │   Completions│   │ • WebSocket │   │
│  │ • Search    │    │ • Relevance │    │ • Document  │    │   Connections│   │
│  │   Analytics │    │   Scoring   │    │   Analysis  │    │ • Error     │   │
│  │ • User      │    │ • Faceted   │    │ • Context   │    │   Handling  │   │
│  │   Management│    │   Search    │    │   Processing│    │ • Retry     │   │
│  │             │    │             │    │             │    │   Logic      │   │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘   │
│         │                   │                   │                   │       │
│         ▼                   ▼                   ▼                   ▼       │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐   │
│  │   Data      │    │   Search    │    │   AI        │    │   Job       │   │
│  │   Flow      │    │   Flow      │    │   Flow      │    │   Flow      │   │
│  │             │    │             │    │             │    │             │   │
│  │ • Document  │    │ • Query     │    │ • Message   │    │ • Task      │   │
│  │   Storage   │    │   Processing│    │   Processing│    │   Execution │   │
│  │ • Metadata  │    │ • Result    │    │ • Context   │    │ • Progress  │   │
│  │   Updates   │    │   Ranking   │    │   Retrieval │    │   Tracking  │   │
│  │ • Analytics │    │ • Highlight │    │ • Response  │    │ • Status    │   │
│  │   Logging   │    │   Generation│    │   Generation│    │   Updates   │   │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### **Data Flow Architecture**

```
┌─────────────────┐    1. Upload     ┌─────────────────┐
│   User Uploads  │ ───────────────► │   File Storage  │
│   Document      │                  │   (Supabase)    │
└─────────────────┘                  └─────────────────┘
                                              │
                                              ▼ 2. Trigger Job
┌─────────────────┐                  ┌─────────────────┐
│   Real-time     │ ◄────────────── │   Background    │
│   Progress UI   │                  │   Processing    │
│   (Trigger.dev) │                  │   (Trigger.dev) │
└─────────────────┘                  └─────────────────┘
                                              │
                                              ▼ 3. AI Analysis
┌─────────────────┐                  ┌─────────────────┐
│   Search        │ ◄────────────── │   OpenAI API    │
│   Results       │                  │   (Analysis)    │
│   (Typesense)   │                  └─────────────────┘
└─────────────────┘                          │
       │                                      ▼ 4. Index Update
       ▼ 5. Search Query              ┌─────────────────┐
┌─────────────────┐                  │   Search Index  │
│   Chat          │ ◄────────────── │   (Typesense)   │
│   Interface     │                  └─────────────────┘
│   (OpenAI)      │                          │
└─────────────────┘                          ▼ 6. Search Results
       │                              ┌─────────────────┐
       ▼ 7. Chat Response             │   Document      │
┌─────────────────┐                  │   Context       │
│   User          │ ◄────────────── │   (Supabase)    │
│   Experience    │                  └─────────────────┘
└─────────────────┘
```

### **Service Interactions**

| Service | Primary Function | Interactions | Data Flow |
|---------|-----------------|--------------|-----------|
| **Supabase** | Database & Storage | • Stores documents<br>• Logs search queries<br>• Manages metadata | • Document uploads<br>• Search analytics<br>• Chat logs |
| **Typesense** | Search Engine | • Indexes documents<br>• Processes queries<br>• Returns results | • Document content<br>• Search queries<br>• Relevance scores |
| **OpenAI** | AI Processing | • Chat completions<br>• Document analysis<br>• Summary generation | • User messages<br>• Document content<br>• Context retrieval |
| **Trigger.dev** | Background Jobs | • Document processing<br>• Real-time updates<br>• Error handling | • File uploads<br>• Processing status<br>• Job management |

## 🛠️ Tech Stack

### **Frontend**
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Modern UI components
- **Lucide React** - Beautiful icons

### **Backend & Services**
- **Supabase** - PostgreSQL database and authentication
- **Prisma ORM** - Type-safe database queries
- **Typesense** - Fast, typo-tolerant search engine
- **Trigger.dev** - Background job processing
- **OpenAI API** - AI-powered chat and analysis

### **Infrastructure**
- **Vercel** - Deployment platform (recommended)
- **PostgreSQL** - Primary database (via Supabase)
- **Redis** - Caching and session storage (optional)

## 🚀 Quick Start

### Prerequisites

You'll need to set up the following services:

#### 1. **OpenAI API** (Required)
- Sign up at [OpenAI](https://platform.openai.com/)
- Get your API key from the dashboard
- Add to `.env.local`: `OPENAI_API_KEY=your-key-here`

#### 2. **Supabase** (Required)
- Create account at [Supabase](https://supabase.com/)
- Create a new project
- Get your database URL and anon key
- Add to `.env.local`:
  ```
  DATABASE_URL=your-supabase-db-url
  NEXT_PUBLIC_SUPABASE_URL=your-project-url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
  ```

#### 3. **Typesense** (Required)
- Sign up at [Typesense Cloud](https://cloud.typesense.org/) or self-host
- Get your API key and cluster details
- Add to `.env.local`:
  ```
  TYPESENSE_HOST=your-cluster-host
  TYPESENSE_PORT=443
  TYPESENSE_PROTOCOL=https
  TYPESENSE_API_KEY=your-api-key
  ```

#### 4. **Trigger.dev** (Required)
- Sign up at [Trigger.dev](https://trigger.dev/)
- Create a new project
- Get your API key and project reference
- Add to `.env.local`:
  ```
  TRIGGER_API_KEY=your-api-key
  ```
- Update `trigger.config.ts` with your project reference

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd nextjs-realtime-simple-demo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your API keys
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Initialize Typesense collection**
   - Visit `/test-typesense` in your browser
   - Click "Initialize Collection" or "Recreate Collection"

6. **Start the development servers**
   ```bash
   # Terminal 1: Next.js app
   npm run dev
   
   # Terminal 2: Trigger.dev worker
   npx trigger.dev@latest dev
   ```

7. **Open your browser**
   - Navigate to `http://localhost:3000`
   - Start uploading and searching documents!

## 📖 Usage Guide

### **Uploading Documents**

1. **Go to the home page** (`/`)
2. **Click "Upload Document"** or drag files to the upload area
3. **Supported formats**: `.txt`, `.md`, `.json`
4. **Wait for processing** - you'll see real-time progress
5. **Documents are automatically indexed** for search

### **Searching Documents**

1. **Navigate to Search** (`/search`) or click "Search Documents"
2. **Type your query** - get real-time suggestions
3. **View results** with relevance scores and highlights
4. **Click "Chat"** on any result to start a conversation
5. **Use pagination** for large result sets

### **AI Chat**

1. **Start a conversation**:
   - **General chat**: Go to `/chat`
   - **Document-specific**: Click "Chat" on any document
   - **From search**: Click "Chat" on search results

2. **Ask questions**:
   - "What are the main topics in this document?"
   - "Can you summarize the key points?"
   - "Tell me more about [specific topic]"

3. **Conversation features**:
   - **Memory**: AI remembers previous messages
   - **Context**: AI understands document content
   - **Suggestions**: Click pre-built questions

### **Document Management**

1. **View all documents** (`/documents`)
2. **See processing status** (ready/processing)
3. **Quick actions** (search, chat, view)
4. **Statistics** (total, ready, processing counts)

## 🔧 Configuration

### **Environment Variables**

Create a `.env.local` file with:

```bash
# Database
DATABASE_URL=your-supabase-db-url
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Search
TYPESENSE_HOST=your-cluster-host
TYPESENSE_PORT=443
TYPESENSE_PROTOCOL=https
TYPESENSE_API_KEY=your-api-key

# AI
OPENAI_API_KEY=your-openai-api-key

# Background Jobs
TRIGGER_API_KEY=your-trigger-api-key
```

### **Trigger.dev Configuration**

Update `trigger.config.ts`:
```typescript
export default defineConfig({
  project: "your-project-reference", // ← Update this
  // ... rest of config
});
```

## 🏗️ Project Structure

```
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── chat/          # AI chat endpoint
│   │   │   ├── documents/     # Document management
│   │   │   └── search/        # Search functionality
│   │   ├── chat/              # Chat interface
│   │   ├── documents/         # Document listing
│   │   ├── search/            # Search interface
│   │   └── test-typesense/    # Typesense setup
│   ├── components/            # React components
│   │   └── ui/               # shadcn/ui components
│   ├── lib/                  # Utility libraries
│   │   ├── prisma.ts         # Database client
│   │   ├── typesense.ts      # Search client
│   │   └── trigger.ts        # Background jobs
│   └── trigger/              # Background tasks
│       ├── tasks.ts          # Job definitions
│       └── process-document.ts
├── prisma/
│   └── schema.prisma         # Database schema
└── trigger.config.ts         # Trigger.dev config
```

## 🚀 Deployment

### **Vercel (Recommended)**

1. **Connect your repository** to Vercel
2. **Add environment variables** in Vercel dashboard
3. **Deploy** - Vercel will auto-detect Next.js
4. **Set up Trigger.dev** for background jobs

### **Other Platforms**

- **Netlify**: Similar to Vercel setup
- **Railway**: Good for full-stack apps
- **Self-hosted**: Docker deployment available

## 🔍 Troubleshooting

### **Common Issues**

1. **Search not working**:
   - Visit `/test-typesense` to check connection
   - Recreate Typesense collection if needed

2. **Chat not responding**:
   - Check OpenAI API key in `.env.local`
   - Verify API key has sufficient credits

3. **Documents not processing**:
   - Ensure Trigger.dev worker is running
   - Check Trigger.dev dashboard for errors

4. **Database errors**:
   - Run `npx prisma db push` to sync schema
   - Check Supabase connection in dashboard

### **Development Tips**

- **Hot reload**: Changes reflect immediately
- **Type safety**: TypeScript catches errors early
- **Debug mode**: Check browser console for errors
- **API testing**: Use `/api/test` for health checks

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js** team for the amazing framework
- **Supabase** for the database infrastructure
- **Typesense** for fast search capabilities
- **Trigger.dev** for background job processing
- **OpenAI** for AI capabilities
- **shadcn/ui** for beautiful components

---

**Built with ❤️ using modern web technologies**
