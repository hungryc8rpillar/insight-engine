import { Button } from "@/components/ui/button";
import DocumentUpload from '@/components/DocumentUpload'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Smart Document Search & AI Assistant
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Upload documents (TXT, MD, JSON, DOCX), search with AI, and get intelligent insights
          </p>
        </div>

        {/* Document Upload */}
        <div className="max-w-2xl mx-auto mb-12">
          <DocumentUpload />
        </div>

        {/* Quick Links */}
        <div className="mt-12 bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-6 text-center">Quick Actions</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <Link 
              href="/search" 
              className="text-center py-3 px-4 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              🔍 Search Documents
            </Link>
            <Link 
              href="/documents" 
              className="text-center py-3 px-4 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              📚 View All Documents
            </Link>
            <Link 
              href="/api/test" 
              className="text-center py-3 px-4 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              🔧 System Health Check
            </Link>
            <Link 
              href="https://cloud.trigger.dev" 
              target="_blank"
              className="text-center py-3 px-4 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              ⚡ Trigger.dev Dashboard
            </Link>
          </div>
        </div>

        {/* Tech Stack Info */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4 text-center">Tech Stack in Action</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div className="text-center">
              <div className="font-medium text-blue-600">React + TypeScript</div>
              <div className="text-gray-500">Frontend</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-green-600">Supabase + Prisma</div>
              <div className="text-gray-500">Database</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-purple-600">Typesense</div>
              <div className="text-gray-500">Search Engine</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-orange-600">Trigger.dev</div>
              <div className="text-gray-500">Background Jobs</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-red-600">OpenAI</div>
              <div className="text-gray-500">AI Assistant</div>
            </div>
          </div>
        </div>

        {/* How it Works */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-center">How It Works</h3>
          <div className="grid md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl mb-2">📤</div>
              <div className="font-medium">1. Upload</div>
              <div className="text-gray-600">Upload your documents (TXT, MD, JSON, DOCX)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">⚡</div>
              <div className="font-medium">2. Process</div>
              <div className="text-gray-600">Trigger.dev runs background jobs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🤖</div>
              <div className="font-medium">3. AI Analysis</div>
              <div className="text-gray-600">OpenAI generates summaries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🔍</div>
              <div className="font-medium">4. Search</div>
              <div className="text-gray-600">Typesense enables fast search</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}