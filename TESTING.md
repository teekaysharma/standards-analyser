# Testing Guide for Standards Analyzer

## 🧪 Quick Test Steps

### 1. **Test Health Check**
Visit: `https://standards-analyser.vercel.app/api/health`
- Expected: `{"message":"Good!"}`

### 2. **Test Main Application**
Visit: `https://standards-analyser.vercel.app/`
- Expected: Should see "Standards Analyzer" interface
- Should see "Create New Session" button

### 3. **Test Session Creation**
1. Click "Create New Session"
2. Expected: Session should be created
3. Should see upload interface

### 4. **Test Document Upload**
1. Upload a PDF, DOCX, or TXT file
2. Expected: File should upload successfully
3. Should see document in the list

### 5. **Test Query Functionality**
1. After document upload, ask a question
2. Expected: Should get a response

## 🔍 Troubleshooting

### **If Health Check Fails:**
- Check Vercel deployment logs
- Verify environment variables
- Check for build errors

### **If Main Page Doesn't Load:**
- Check browser console for errors
- Verify Next.js build succeeded
- Check for missing dependencies

### **If Session Creation Fails:**
- Check Supabase connection
- Verify database tables exist
- Check API route logs

### **If Document Upload Fails:**
- Check Supabase storage bucket
- Verify file permissions
- Check file size limits

## 🚀 Deployment Verification

### **Vercel Dashboard:**
1. Go to Vercel project
2. Check deployment status
3. View function logs
4. Check environment variables

### **Supabase Dashboard:**
1. Check database tables
2. Verify storage bucket
3. Check API logs

## 📱 Expected Behavior

### **Successful Flow:**
1. User visits site → Sees session creation screen
2. Creates session → Gets upload interface
3. Uploads document → Document processes
4. Asks question → Gets AI response

### **Error Handling:**
- Invalid file types → Shows error message
- Large files → Shows size limit error
- Expired sessions → Shows session expired
- Network errors → Shows retry option

## 🎯 Success Criteria

The application is working when:
- ✅ Health check returns 200
- ✅ Main page loads without errors
- ✅ Sessions can be created
- ✅ Documents can be uploaded
- ✅ Queries can be processed
- ✅ Responses are displayed

## 📞 Getting Help

If issues persist:
1. Check Vercel logs for specific errors
2. Verify all environment variables are set
3. Ensure Supabase SQL was executed successfully
4. Check browser console for JavaScript errors