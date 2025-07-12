# 🚀 Vercel Deployment Guide

This guide will walk you through deploying your Next.js application to Vercel for production simulation.

## Prerequisites

Before deploying, ensure you have:

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub/GitLab Account**: Your code should be in a Git repository
3. **External Services Setup**:
   - Supabase database
   - Typesense search cluster
   - OpenAI API key
   - Trigger.dev project

## Step 1: Prepare Your Repository

### 1.1 Push to Git
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 1.2 Verify Environment Variables
Create a `.env.local` file locally with all required variables (see `env.example`).

## Step 2: Deploy to Vercel

### 2.1 Connect Repository
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your Git repository
4. Vercel will auto-detect Next.js

### 2.2 Configure Environment Variables
In the Vercel dashboard, add these environment variables:

#### Database (Supabase)
```
DATABASE_URL=your-supabase-db-url
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### Search (Typesense)
```
TYPESENSE_HOST=your-cluster-host
TYPESENSE_PORT=443
TYPESENSE_PROTOCOL=https
TYPESENSE_API_KEY=your-api-key
```

#### AI (OpenAI)
```
OPENAI_API_KEY=your-openai-api-key
```

#### Background Jobs (Trigger.dev)
```
TRIGGER_API_KEY=your-trigger-api-key
TRIGGER_PROJECT_ID=your-project-id
NEXT_PUBLIC_TRIGGER_API_URL=https://api.trigger.dev
```

### 2.3 Configure Build Settings
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 2.4 Deploy
Click "Deploy" and wait for the build to complete.

## Step 3: Post-Deployment Setup

### 3.1 Database Migration
After deployment, you may need to run database migrations:

```bash
# Via Vercel CLI
vercel env pull .env.local
npx prisma db push
```

### 3.2 Initialize Typesense
Visit your deployed URL + `/test-typesense` to initialize the search collection.

### 3.3 Set Up Trigger.dev
1. Go to your Trigger.dev dashboard
2. Update your project settings with the production URL
3. Deploy your trigger functions:
   ```bash
   npx trigger.dev@latest deploy
   ```

## Step 4: Verify Deployment

### 4.1 Test Core Features
1. **Homepage**: Should load without errors
2. **Document Upload**: Test file upload functionality
3. **Search**: Verify search works with Typesense
4. **Chat**: Test AI chat functionality
5. **Background Jobs**: Check Trigger.dev integration

### 4.2 Monitor Logs
- Check Vercel function logs for API errors
- Monitor Trigger.dev dashboard for job failures
- Verify Supabase connection

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors
- Verify `DATABASE_URL` is correct
- Check if Supabase allows connections from Vercel IPs
- Ensure database is not paused

#### 2. Typesense Connection Issues
- Verify `TYPESENSE_HOST` and `TYPESENSE_API_KEY`
- Check if Typesense cluster is accessible
- Ensure proper SSL configuration

#### 3. OpenAI API Errors
- Verify `OPENAI_API_KEY` is valid
- Check API usage limits
- Ensure key has proper permissions

#### 4. Trigger.dev Issues
- Verify `TRIGGER_API_KEY` and `TRIGGER_PROJECT_ID`
- Check if trigger functions are deployed
- Monitor job execution logs

### Debug Commands

```bash
# Check environment variables
vercel env ls

# View deployment logs
vercel logs

# Pull latest environment
vercel env pull .env.local

# Redeploy
vercel --prod
```

## Environment-Specific Configurations

### Development vs Production
- **Development**: Uses local `.env.local`
- **Production**: Uses Vercel environment variables
- **Preview**: Uses Vercel preview environment variables

### Custom Domains
1. Go to Vercel project settings
2. Add custom domain
3. Configure DNS records
4. Enable HTTPS

## Monitoring & Analytics

### Vercel Analytics
- Enable Vercel Analytics in project settings
- Monitor performance metrics
- Track user interactions

### External Monitoring
- Set up Supabase monitoring
- Monitor Typesense cluster health
- Track Trigger.dev job success rates

## Cost Optimization

### Vercel
- Use appropriate plan for your needs
- Monitor function execution time
- Optimize bundle size

### External Services
- Supabase: Monitor database usage
- Typesense: Check search query limits
- OpenAI: Monitor API usage
- Trigger.dev: Track job execution costs

## Security Considerations

### Environment Variables
- Never commit sensitive keys to Git
- Use Vercel's environment variable encryption
- Rotate keys regularly

### API Security
- Implement rate limiting
- Add authentication where needed
- Monitor for suspicious activity

## Next Steps

After successful deployment:

1. **Set up monitoring** for production usage
2. **Configure backups** for critical data
3. **Implement CI/CD** for automated deployments
4. **Add performance monitoring**
5. **Set up error tracking** (Sentry, etc.)

---

**Need Help?**
- Check Vercel documentation: [vercel.com/docs](https://vercel.com/docs)
- Trigger.dev docs: [trigger.dev/docs](https://trigger.dev/docs)
- Supabase docs: [supabase.com/docs](https://supabase.com/docs) 