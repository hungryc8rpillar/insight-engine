#!/usr/bin/env node

/**
 * Script to check Vercel environment variables
 * Run this locally to verify your environment setup
 */

const requiredEnvVars = [
  'DATABASE_URL',
  'DIRECT_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'TYPESENSE_HOST',
  'TYPESENSE_API_KEY',
  'OPENAI_API_KEY',
  'TRIGGER_API_KEY'
]

console.log('🔍 Checking Vercel Environment Variables...\n')

let allSet = true

requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar]
  const isSet = !!value
  const status = isSet ? '✅ Set' : '❌ Not set'
  
  console.log(`${envVar}: ${status}`)
  
  if (!isSet) {
    allSet = false
  }
})

console.log('\n' + '='.repeat(50))

if (allSet) {
  console.log('🎉 All required environment variables are set!')
  console.log('\nNext steps:')
  console.log('1. Deploy to Vercel')
  console.log('2. Visit /troubleshoot-db to test connections')
  console.log('3. Check /api/test for health status')
} else {
  console.log('⚠️  Some environment variables are missing!')
  console.log('\nTo fix this:')
  console.log('1. Create a .env.local file with the missing variables')
  console.log('2. Add the variables to your Vercel dashboard')
  console.log('3. Redeploy your application')
}

console.log('\nFor Vercel deployment, ensure:')
console.log('- DATABASE_URL and DIRECT_URL have the same value')
console.log('- All variables are set in Vercel dashboard → Settings → Environment Variables')
console.log('- Variables are set for Production, Preview, and Development environments') 