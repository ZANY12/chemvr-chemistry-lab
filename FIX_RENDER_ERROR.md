# 🔧 FIX RENDER DEPLOYMENT ERROR

## 🎯 QUICK FIX - Update Build Settings in Render

The error is likely because of the build command format. Let's fix it directly in Render:

---

## ✅ STEP-BY-STEP FIX:

### 1. Go to Your Service Settings

1. In Render dashboard, click on **"chemvr-chemistry-lab"**
2. Click **"Settings"** in the left sidebar

---

### 2. Update Build & Deploy Settings

Scroll down to **"Build & Deploy"** section and change:

**Build Command:**
```
npm ci && npm run build
```

**Start Command:**
```
node dist/index.cjs
```

**Click "Save Changes"**

---

### 3. Add Node Version (Important!)

Scroll to **"Environment"** section:

Click **"Add Environment Variable"**:
- **Key:** `NODE_VERSION`
- **Value:** `20`

**Click "Save"**

---

### 4. Verify Environment Variables

Make sure you have these environment variables set:

1. **`DATABASE_URL`** - Your PostgreSQL connection string
2. **`NODE_ENV`** - `production`
3. **`NODE_VERSION`** - `20` (just added)

---

### 5. Manual Deploy

1. Click **"Manual Deploy"** button (top right)
2. Select **"Clear build cache & deploy"**
3. Wait for deployment (3-5 minutes)

---

## 🔍 ALTERNATIVE: If Still Failing

### Check the Exact Error:

1. In Render, click on **"Logs"** tab
2. Look for the error message
3. Common errors and fixes:

#### **Error: "tsx: command not found"**
**Fix:** Build command should be:
```
npm install && npx tsx script/build.ts
```

#### **Error: "Cannot find module"**
**Fix:** Make sure all dependencies are in `package.json`

#### **Error: "ENOENT: no such file or directory"**
**Fix:** Build command should create the dist folder:
```
npm ci && npm run build
```

#### **Error: "Exit code 127"**
**Fix:** Usually means a command wasn't found. Use:
```
npm ci && npx tsx script/build.ts
```

---

## 🚀 RECOMMENDED SETTINGS FOR RENDER:

### **Basic Settings:**
- **Name:** `chemvr-chemistry-lab`
- **Environment:** `Node`
- **Branch:** `main`
- **Root Directory:** (blank)

### **Build & Deploy:**
- **Build Command:** `npm ci && npm run build`
- **Start Command:** `node dist/index.cjs`
- **Auto-Deploy:** Yes

### **Environment Variables:**
```
DATABASE_URL = postgresql://chemvr_user:xxxxx@dpg-xxxxx/chemvr
NODE_ENV = production
NODE_VERSION = 20
```

---

## 📸 WHAT TO SEND ME IF STILL FAILING:

Take a screenshot of:
1. The **error message** in the Logs tab
2. Your **Build & Deploy** settings
3. Your **Environment Variables**

This will help me diagnose the exact issue!

---

## ✅ CHECKLIST:

- [ ] Updated Build Command to `npm ci && npm run build`
- [ ] Updated Start Command to `node dist/index.cjs`
- [ ] Added `NODE_VERSION=20` environment variable
- [ ] Verified `DATABASE_URL` is set correctly
- [ ] Verified `NODE_ENV=production` is set
- [ ] Clicked "Clear build cache & deploy"
- [ ] Waited for deployment to complete

---

## 🎯 EXPECTED SUCCESS:

After fixing, you should see:
```
==> Installing dependencies...
==> Running 'npm ci'...
==> Running 'npm run build'...
==> Building client...
==> Building server...
==> Build successful!
==> Starting server with 'node dist/index.cjs'...
==> Your service is live 🎉
```

---

**Try the fix above and let me know if you still get errors!** 🚀
