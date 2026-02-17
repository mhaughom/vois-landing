# 🎯 WebSocket Streaming - Quick Reference

> Real-time audio streaming with DeepGram for the VOIS demo

---

## 📚 Documentation

Choose your path based on what you need:

### 🚀 **Just Want to Get Started?**
→ Read **[STREAMING_DEV_SETUP.md](./STREAMING_DEV_SETUP.md)**
- Quick 10-minute setup guide
- Start backend and frontend
- Test streaming in 3 steps

### 🧪 **Ready to Test?**
→ Read **[TESTING_GUIDE.md](./TESTING_GUIDE.md)**
- 8 comprehensive test scenarios
- Checklist format for easy tracking
- Covers all edge cases

### 🏗️ **Want Technical Details?**
→ Read **[STREAMING_IMPLEMENTATION.md](./STREAMING_IMPLEMENTATION.md)**
- Full architecture documentation
- Protocol specification
- Implementation details
- Migration strategy

---

## ⚡ TL;DR

### What's New?
- ✅ **Real-time streaming**: Cards appear as you speak (~500ms latency)
- ✅ **WebSocket integration**: Live connection to DeepGram API
- ✅ **Automatic fallback**: Falls back to batch mode if streaming fails
- ✅ **Feature flagged**: Safe gradual rollout via `VITE_ENABLE_STREAMING`

### What Changed?
- **New Files**:
  - `lib/websocketManager.ts` - WebSocket client
  - `public/audio-processor.js` - Audio conversion
  - `lib/mockWebSocket.ts` - Mock for testing
- **Modified Files**:
  - `components/TryNowDemo.tsx` - Streaming integrated
  - `lib/analytics.ts` - New streaming events
  - `.env` - Feature flags added

### Current Status
- ✅ **Backend**: Already implemented (GPT-4o-mini, DeepGram Nova-3)
- ✅ **Frontend**: Fully implemented and ready
- ⏳ **Testing**: Ready for integration testing
- ⏳ **Deployment**: Awaiting test results

---

## 🎯 Quick Start (3 Steps)

### 1. Start Backend
```bash
cd /path/to/backend/apps/backend
npm run dev
```

### 2. Configure Frontend
```bash
# Edit .env
VITE_ENABLE_STREAMING=true
VITE_API_URL=http://localhost:3001
```

### 3. Start Frontend & Test
```bash
npm run dev
# Open http://localhost:5173
# Click "Try Demo" → Select device → Speak!
```

---

## 🔧 Configuration

### Development Mode
```env
VITE_ENABLE_STREAMING=true
VITE_API_URL=http://localhost:3001
```

### Production Mode
```env
VITE_ENABLE_STREAMING=true
VITE_API_URL=https://api.tryvois.com
```

### Disable Streaming (Batch Only)
```env
VITE_ENABLE_STREAMING=false
# Uses original batch upload mode
```

---

## 🎨 How It Works

### Streaming Flow
```
User speaks → Microphone → AudioWorklet → PCM16 conversion →
WebSocket frames → Backend → DeepGram API → Real-time transcripts →
GPT-4o-mini extraction → Action cards → Frontend updates
```

### Timeline
```
0ms:    User starts speaking
500ms:  First interim transcript arrives
1000ms: First action card extracted
1500ms: Card appears on screen 🎉
        (vs 5000ms+ in batch mode)
```

---

## 📊 Key Metrics

### Target Performance
- ⏱️ **Time to first card**: < 2 seconds (vs 5+ seconds batch)
- 📶 **Connection success**: > 98%
- 🎯 **Card accuracy**: > 90%
- 💰 **Cost per session**: ~$0.005 (GPT-4o-mini + 1000ms debounce)

### What to Track (PostHog)
- `demo_streaming_started` - When streaming begins
- `demo_card_received` - Each card arrival
- `demo_streaming_completed` - Success
- `demo_streaming_error` - Errors
- `demo_streaming_fallback` - Batch mode usage

---

## 🐛 Troubleshooting

### WebSocket won't connect?
```
✓ Check backend is running
✓ Check VITE_API_URL in .env
✓ Look for CORS errors in console
```

### No cards appearing?
```
✓ Check backend logs for errors
✓ Verify speaking clearly
✓ Check Network tab for WebSocket messages
✓ Check DeepGram API key in backend
```

### AudioWorklet fails?
```
✓ Verify /public/audio-processor.js exists
✓ Use Chrome (best support)
✓ Check HTTPS in production
```

→ See **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** for full troubleshooting

---

## 🏗️ Architecture

### Backend Stack
- **WebSocket Server**: Custom endpoint at `/ws/demo-deepgram`
- **DeepGram**: Nova-3 model for transcription
- **GPT-4o-mini**: Action card extraction
- **Debouncing**: 1000ms to reduce API costs

### Frontend Stack
- **WebSocket Client**: `lib/websocketManager.ts`
- **AudioWorklet**: Real-time PCM16 conversion
- **React**: Incremental UI updates
- **Feature Flags**: Safe rollout control

### Communication Protocol
```
Client → Server:  JSON commands + Binary audio frames
Server → Client:  JSON messages (transcripts, cards, errors)
```

→ See **[STREAMING_IMPLEMENTATION.md](./STREAMING_IMPLEMENTATION.md)** for details

---

## 📋 Testing Checklist

Quick verification that everything works:

- [ ] Backend running on port 3001
- [ ] Frontend `.env` has `VITE_ENABLE_STREAMING=true`
- [ ] Console shows `[WS] Connected successfully`
- [ ] Console shows `[WS] AudioWorklet loaded`
- [ ] Microphone permissions granted
- [ ] Cards appear as you speak (< 2 seconds)
- [ ] No console errors
- [ ] Fallback works when backend stops
- [ ] Analytics events firing

→ See **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** for 8 comprehensive tests

---

## 🚀 Deployment Checklist

Before enabling in production:

- [ ] All tests pass (see TESTING_GUIDE.md)
- [ ] Backend deployed with WebSocket endpoint
- [ ] DeepGram API key configured
- [ ] GPT-4o-mini API key configured
- [ ] CORS settings allow WebSocket connections
- [ ] HTTPS/WSS enabled in production
- [ ] Analytics tracking verified
- [ ] Fallback to batch tested
- [ ] Cross-browser testing complete
- [ ] Mobile testing complete
- [ ] Error handling verified
- [ ] Cost monitoring in place

---

## 🎯 Rollout Strategy

### Phase 1: Internal Testing (Week 1)
```
Audience: Dev team
Config: VITE_ENABLE_STREAMING=true (staging)
Goal: Verify integration works end-to-end
```

### Phase 2: Beta Testing (Week 2)
```
Audience: 10% of users
Config: Feature flag with 10% rollout
Goal: Monitor metrics, error rates
```

### Phase 3: Gradual Rollout (Weeks 3-4)
```
Week 3: 25% → 50% users
Week 4: 75% → 100% users
Goal: Full adoption with monitoring
```

### Phase 4: Deprecation (Week 6)
```
Action: Remove batch endpoint (optional)
Config: Streaming becomes default
Goal: Simplify codebase
```

---

## 📞 Support

### Need Help?

1. **Read the docs**:
   - [STREAMING_DEV_SETUP.md](./STREAMING_DEV_SETUP.md) - Setup
   - [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Testing
   - [STREAMING_IMPLEMENTATION.md](./STREAMING_IMPLEMENTATION.md) - Details

2. **Check the logs**:
   - Browser console: Filter by `[WS]` or `[Demo]`
   - Backend terminal: Server logs
   - Network tab: WebSocket messages

3. **Common fixes**:
   - Restart backend: `npm run dev`
   - Clear browser data: DevTools → Application → Clear
   - Check `.env` configuration
   - Verify backend URL is correct

---

## 🎉 Success!

When streaming works correctly, you'll see:

```
✓ WebSocket connects in < 1 second
✓ Audio streams smoothly
✓ Transcripts appear in real-time
✓ Cards pop up as you speak (~500ms latency)
✓ User experience feels magical ✨
```

**vs Batch Mode:**
```
✗ Wait 3-5 seconds after recording
✗ All cards appear at once
✗ Feels slow and clunky
```

---

## 📈 Expected Impact

Based on plan estimates:

- 📊 **+20% demo completion rate**
- ⚡ **-80% time to first card** (5s → 1s)
- 😊 **+30% user satisfaction**
- 🎯 **+30% waitlist signups**
- 💰 **~$0.005 per session** (with optimizations)

---

**Built with ❤️ by Claude Sonnet 4.5**
*Last updated: 2026-02-15*
