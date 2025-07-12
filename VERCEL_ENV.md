# 🔧 Vercel Environment Variables Setup

## **Required Environment Variables**

Add these in your Vercel Dashboard → Settings → Environment Variables:

### **Database (Supabase)**
```
DATABASE_URL=postgresql://your-supabase-connection-string
DIRECT_URL=postgresql://your-supabase-connection-string
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### **Search (Typesense)**
```
TYPESENSE_HOST=your-cluster-host
TYPESENSE_PORT=443
TYPESENSE_PROTOCOL=https
TYPESENSE_API_KEY=your-api-key
```

### **AI (OpenAI)**
```
OPENAI_API_KEY=sk-your-openai-api-key
```

### **Background Jobs (Trigger.dev)**
```
TRIGGER_API_KEY=your-trigger-api-key
TRIGGER_PROJECT_ID=your-project-id
NEXT_PUBLIC_TRIGGER_API_URL=https://api.trigger.dev
```

## **Important Notes**

### **Database URL Format**
- Use your **Supabase connection string** directly
- Format: `postgresql://username:password@host:port/database`
- Vercel will handle the Prisma URL conversion automatically

### **Environment Selection**
- ✅ **Production**
- ✅ **Preview** 
- ✅ **Development**

### **Example Supabase Connection String**
```
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

## **Troubleshooting**

### **If you get Prisma URL errors:**
1. Make sure `DATABASE_URL` is a valid PostgreSQL connection string
2. Add `DIRECT_URL` with the same value as `DATABASE_URL`
3. Ensure Supabase allows connections from Vercel IPs

### **If build fails:**
1. Check all environment variables are set
2. Verify API keys are valid
3. Test database connection locally first

---

**Remember**: Never commit these values to Git! 