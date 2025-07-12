'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react'

export default function TestTypesensePage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const testTypesense = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test')
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: 'Failed to test Typesense' })
    } finally {
      setLoading(false)
    }
  }

  const initializeTypesense = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/init-typesense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'init' })
      })
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: 'Failed to initialize Typesense' })
    } finally {
      setLoading(false)
    }
  }

  const recreateTypesense = async () => {
    if (!confirm('This will delete and recreate the Typesense collection. All indexed documents will be lost. Continue?')) {
      return
    }
    
    setLoading(true)
    try {
      const response = await fetch('/api/init-typesense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'recreate' })
      })
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: 'Failed to recreate Typesense collection' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Typesense Test & Setup</h1>
        
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Test Connection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Test the current Typesense connection and configuration
              </p>
              <Button onClick={testTypesense} disabled={loading} className="w-full">
                {loading ? 'Testing...' : 'Test Typesense'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Initialize Collection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Check and initialize the documents collection
              </p>
              <Button onClick={initializeTypesense} disabled={loading} className="w-full">
                {loading ? 'Initializing...' : 'Initialize Collection'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Recreate Collection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Delete and recreate the collection (⚠️ loses all data)
              </p>
              <Button 
                onClick={recreateTypesense} 
                disabled={loading} 
                variant="destructive"
                className="w-full"
              >
                {loading ? 'Recreating...' : 'Recreate Collection'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {result && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Result</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>1.</strong> First, test the connection to see the current status</p>
              <p><strong>2.</strong> If the test shows missing fields, try initializing the collection</p>
              <p><strong>3.</strong> If initialization fails, you may need to recreate the collection</p>
              <p><strong>4.</strong> After fixing Typesense, re-upload your documents</p>
              <p><strong>Note:</strong> Recreating the collection will delete all indexed documents</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
} 