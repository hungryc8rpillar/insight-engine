'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle, RefreshCw, Database, Settings } from 'lucide-react'

export default function TroubleshootDbPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)

  const runDiagnostics = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test-db')
      const data = await response.json()
      setResults(data)
    } catch (error) {
      setResults({ error: 'Failed to run diagnostics' })
    } finally {
      setLoading(false)
    }
  }

  const checkEnvironment = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/debug-env')
      const data = await response.json()
      setResults(data)
    } catch (error) {
      setResults({ error: 'Failed to check environment' })
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (success: boolean) => {
    return success ? <CheckCircle className="h-5 w-5 text-green-500" /> : <AlertCircle className="h-5 w-5 text-red-500" />
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Database Troubleshooting</h1>
        <p className="text-gray-600">
          Diagnose and fix database connection issues in your Vercel deployment.
        </p>
      </div>

      <div className="grid gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Connection Test
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Test both Prisma and direct PostgreSQL connections to identify the issue.
            </p>
            <Button 
              onClick={runDiagnostics} 
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Run Database Diagnostics
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Environment Variables Check
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Check if all required environment variables are properly set in Vercel.
            </p>
            <Button 
              onClick={checkEnvironment} 
              disabled={loading}
              variant="outline"
              className="flex items-center gap-2"
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Check Environment Variables
            </Button>
          </CardContent>
        </Card>
      </div>

      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Diagnostic Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.success !== undefined && (
                <div className="flex items-center gap-2">
                  {getStatusIcon(results.success)}
                  <span className="font-medium">
                    Overall Status: {results.success ? 'Success' : 'Failed'}
                  </span>
                </div>
              )}

              {results.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-medium text-red-800 mb-2">Error Details</h3>
                  <p className="text-red-700 text-sm">{results.error}</p>
                </div>
              )}

              {results.directConnection && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-800 mb-2">Direct Connection Test</h3>
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(results.directConnection.success)}
                    <span>Direct PostgreSQL: {results.directConnection.success ? 'Success' : 'Failed'}</span>
                  </div>
                  {results.directConnection.error && (
                    <p className="text-blue-700 text-sm">{results.directConnection.error}</p>
                  )}
                  {results.directConnection.currentTime && (
                    <p className="text-blue-700 text-sm">Server Time: {results.directConnection.currentTime}</p>
                  )}
                </div>
              )}

              {results.suggestions && results.suggestions.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-medium text-yellow-800 mb-2">Suggested Solutions</h3>
                  <ul className="list-disc list-inside text-yellow-700 text-sm space-y-1">
                    {results.suggestions.map((suggestion: string, index: number) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}

              {results.environment && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-800 mb-2">Environment Variables</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(results.environment).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="font-mono text-gray-600">{key}:</span>
                        <span className={value === 'Set' ? 'text-green-600' : 'text-red-600'}>
                          {value as string}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-800 mb-2">Connection Details</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span>DATABASE_URL:</span>
                    <span className={results.databaseUrl === 'Set' ? 'text-green-600' : 'text-red-600'}>
                      {results.databaseUrl}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>DIRECT_URL:</span>
                    <span className={results.directUrl === 'Set' ? 'text-green-600' : 'text-red-600'}>
                      {results.directUrl}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>NODE_ENV:</span>
                    <span>{results.nodeEnv}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>VERCEL_ENV:</span>
                    <span>{results.vercelEnv}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-blue-800 mb-4">Common Solutions</h2>
        <div className="space-y-4 text-sm text-blue-700">
          <div>
            <h3 className="font-medium mb-2">1. Check Vercel Environment Variables</h3>
            <p>Ensure these are set in your Vercel dashboard:</p>
            <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
              <li><code className="bg-blue-100 px-1 rounded">DATABASE_URL</code> - Your Supabase connection string</li>
              <li><code className="bg-blue-100 px-1 rounded">DIRECT_URL</code> - Same as DATABASE_URL for Vercel</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">2. Verify Supabase Database</h3>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Check if your Supabase database is not paused</li>
              <li>Verify the connection string format is correct</li>
              <li>Ensure your Supabase project allows external connections</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">3. Consider Prisma Accelerate</h3>
            <p>For better serverless performance, consider using Prisma Accelerate which is optimized for Vercel deployments.</p>
          </div>
        </div>
      </div>
    </div>
  )
} 