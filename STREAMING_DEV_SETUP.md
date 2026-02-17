# 🚀 Streaming Development Setup

Quick setup guide to start developing and testing the WebSocket streaming feature.

---

## Prerequisites

- ✅ Backend repository cloned and set up
- ✅ Node.js installed
- ✅ npm or yarn installed

---

## 1. Backend Setup (5 minutes)

### Start the Backend Server

```bash
# Navigate to your backend repository
cd /path/to/your/backend

# Install dependencies (if not already done)
npm install

# Start the development server
cd apps/backend
npm run dev
```

**Expected output:**
```
Server running on http://localhost:3001
WebSocket endpoint available at ws://localhost:3001/ws/demo-deepgram
```

### Verify Backend is Running

Open browser and navigate to:
```
http://localhost:3001/health
```

Should return: `{"status": "ok"}` or similar

---

## 2. Frontend Setup (3 minutes)

### Update Environment Variables

Edit `.env` file:

```env
# Enable streaming mode
VITE_ENABLE_STREAMING=true

# Point to local backend
VITE_API_URL=http://localhost:3001

# Keep other variables as is
VITE_POSTHOG_KEY=phc_GNJRLquFyT0tj5Qu7X4kk2jJdhXcG36JY9uU25oNdIa
VITE_POSTHOG_HOST=https://eu.i.posthog.com
VITE_WEB_APP_URL=https://app.tryvois.com
VITE_SUPABASE_URL=https://nnaqhmarmswbhagwjssi.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5uYXFobWFybXN3YmhhZ3dqc3NpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExNDEzNzUsImV4cCI6MjA4NjcxNzM3NX0.jgQBOBQYylh0WDfOLNACsSM0VdGLF5sEpqeZ0xo3LWg
```

### Start Frontend Dev Server

```bash
# In this repository
npm install  # If not already done
npm run dev
```

**Expected output:**
```
VITE v4.x.x ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## 3. Test the Integration (2 minutes)

### Quick Test

1. **Open browser**: http://localhost:5173
2. **Navigate to demo section**
3. **Open DevTools**: F12 or Cmd+Option+I
4. **Go to Console tab**
5. **Click "Try Demo"**
6. **Select device** (phone or watch)

### Expected Console Output

```
[WS] Connecting to: ws://localhost:3001/ws/demo-deepgram
[WS] Connected successfully
[WS] AudioWorklet loaded
[WS] Audio pipeline connected
[WS] Recording started successfully
```

### Start Speaking

Say something like:
> "I need to buy groceries, milk and eggs. Remind me to call the dentist tomorrow."

### Expected Behavior

- ✅ Cards appear on phone screen in **real-time** as you speak
- ✅ Console shows: `[WS] Received message: interim_transcript`
- ✅ Console shows: `[WS] Received message: action_card`
- ✅ No errors in console

---

## 4. Development Workflow

### Hot Reload is Enabled

Both frontend and backend support hot reload:
- **Frontend**: Vite auto-reloads on file changes
- **Backend**: Nodemon auto-restarts on file changes

### Making Changes

**Frontend changes** (React components, styles):
1. Edit files in `components/`, `lib/`, etc.
2. Vite automatically reloads
3. Refresh browser to see changes

**Backend changes** (WebSocket, extraction logic):
1. Edit backend files
2. Backend auto-restarts
3. Refresh frontend to reconnect

---

## 5. Debugging Tips

### Enable Verbose Logging

In browser console, filter by:
```
[WS]    - WebSocket messages
[Demo]  - Demo state changes
```

### Check WebSocket Connection

**DevTools → Network tab**:
1. Filter by "WS"
2. Click on "demo-deepgram" connection
3. View Messages tab to see real-time communication

### Common Issues

**Issue**: WebSocket fails to connect
```
✓ Check backend is running
✓ Check VITE_API_URL is correct
✓ Check no CORS errors in console
```

**Issue**: AudioWorklet fails to load
```
✓ Verify /public/audio-processor.js exists
✓ Try Chrome (best AudioWorklet support)
✓ Check console for specific error
```

**Issue**: No cards appearing
```
✓ Check backend terminal for errors
✓ Verify DeepGram API key is set in backend
✓ Check Network tab for WebSocket messages
✓ Speak clearly and naturally
```

---

## 6. Testing Without Backend (Mock Mode)

### Enable Mock WebSocket

Edit `components/TryNowDemo.tsx`:

```typescript
// Add import at top
import { MockDemoWebSocket } from '../lib/mockWebSocket';

// In the useEffect that initializes wsManagerRef, replace:
const wsUrl = API_URL.replace('https://', 'wss://').replace('http://', 'ws://') + '/ws/demo-deepgram';
wsManagerRef.current = new MockDemoWebSocket(wsUrl); // ← Use mock instead
```

### Benefits of Mock Mode

- ✅ Develop without backend running
- ✅ Test UI/UX changes quickly
- ✅ Simulates real-time behavior
- ✅ Predictable test data
- ✅ No API costs

### Mock Behavior

Mock will simulate:
- Incremental transcripts appearing
- Action cards arriving at intervals:
  - 🛒 "Buy groceries" (2s)
  - 🔔 "Call dentist" (3.5s)
  - 💡 "Blog post idea" (5s)
  - 📅 "Team meeting" (6.5s)

---

## 7. Environment Variables Reference

### Required for Development

```env
VITE_ENABLE_STREAMING=true           # Enable streaming mode
VITE_API_URL=http://localhost:3001   # Local backend
```

### Optional for Development

```env
# Use mock WebSocket (no backend needed)
VITE_USE_MOCK_WEBSOCKET=true

# Disable streaming (test batch mode)
VITE_ENABLE_STREAMING=false
```

### Production Settings

```env
VITE_ENABLE_STREAMING=true           # Enable for production
VITE_API_URL=https://api.tryvois.com # Production backend
```

---

## 8. File Structure

### Frontend Files

```
components/
  TryNowDemo.tsx           ← Main demo component (streaming integrated)
  deviceState.ts           ← Shared state management

lib/
  websocketManager.ts      ← WebSocket client + audio streaming
  mockWebSocket.ts         ← Mock implementation for testing
  analytics.ts             ← Analytics tracking (streaming events added)

public/
  audio-processor.js       ← AudioWorklet for PCM16 conversion

.env                       ← Environment configuration
```

### Backend Files (Reference)

```
apps/backend/
  routes/
    demoDeepgramRelay.ts   ← WebSocket endpoint handler
  services/
    deepgramService.ts     ← DeepGram integration
    extractionService.ts   ← GPT-4o-mini extraction
```

---

## 9. Quick Commands Cheat Sheet

### Start Development

```bash
# Terminal 1: Backend
cd /path/to/backend/apps/backend
npm run dev

# Terminal 2: Frontend
cd /path/to/frontend
npm run dev
```

### Test Streaming

```bash
# Open browser
open http://localhost:5173

# Or use curl to test WebSocket endpoint
curl -i -N \
  -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  http://localhost:3001/ws/demo-deepgram
```

### View Logs

```bash
# Backend logs (in backend terminal)
# Shows DeepGram messages, extraction calls, WebSocket events

# Frontend logs (in browser console)
# Filter by [WS] or [Demo]
```

### Reset Everything

```bash
# Clear browser data
# DevTools → Application → Clear site data

# Restart backend
# Ctrl+C in backend terminal, then npm run dev

# Restart frontend
# Ctrl+C in frontend terminal, then npm run dev
```

---

## 10. Next Steps

After setup is working:

1. ✅ Read `TESTING_GUIDE.md` for comprehensive test cases
2. ✅ Read `STREAMING_IMPLEMENTATION.md` for architecture details
3. ✅ Try the demo yourself and verify real-time behavior
4. ✅ Check analytics events in PostHog
5. ✅ Test error scenarios (disconnect backend mid-recording)
6. ✅ Test on different browsers
7. ✅ Test on mobile devices

---

## 🎉 You're Ready!

Your development environment is now set up for WebSocket streaming development.

**Test it works:**
```
✓ Backend running on http://localhost:3001
✓ Frontend running on http://localhost:5173
✓ Click "Try Demo" → Select device → Allow microphone
✓ Speak and watch cards appear in real-time! 🚀
```

**Need help?**
- Check `TESTING_GUIDE.md` for detailed test cases
- Check `STREAMING_IMPLEMENTATION.md` for architecture
- Check browser console for `[WS]` logs
- Check backend terminal for server logs

Happy coding! 💻✨
