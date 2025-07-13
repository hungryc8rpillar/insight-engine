'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestPDFPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError(null)
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/test-pdf', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        setResult(data)
      } else {
        setError(data.error || 'Test failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Test PDF Processing</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Upload PDF for Testing</CardTitle>
          </CardHeader>
          <CardContent>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </CardContent>
        </Card>

        {loading && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2">Processing PDF...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700">{error}</p>
            </CardContent>
          </Card>
        )}

        {result && (
          <Card>
            <CardHeader>
              <CardTitle>PDF Processing Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900">Text Length</h4>
                  <p className="text-sm text-gray-600">{result.textLength} characters</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Number of Pages</h4>
                  <p className="text-sm text-gray-600">{result.numPages}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">PDF Version</h4>
                  <p className="text-sm text-gray-600">{result.version}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Text Preview</h4>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{result.preview}</p>
                </div>
              </div>

              {result.info && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">PDF Info</h4>
                  <pre className="bg-gray-50 p-3 rounded-md text-xs overflow-auto">
                    {JSON.stringify(result.info, null, 2)}
                  </pre>
                </div>
              )}

              {result.metadata && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">PDF Metadata</h4>
                  <pre className="bg-gray-50 p-3 rounded-md text-xs overflow-auto">
                    {JSON.stringify(result.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
} 