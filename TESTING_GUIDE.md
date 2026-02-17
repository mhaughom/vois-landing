# 🧪 WebSocket Streaming Testing Guide

## Quick Test Checklist

Use this checklist to verify the streaming implementation works correctly:

---

## ✅ Pre-Test Setup

- [ ] Backend is running (`cd apps/backend && npm run dev`)
- [ ] Backend is accessible at `http://localhost:3001`
- [ ] Frontend `.env` has `VITE_ENABLE_STREAMING=true`
- [ ] Frontend `.env` has `VITE_API_URL=http://localhost:3001`
- [ ] Frontend dev server is running (`npm run dev`)
- [ ] Browser DevTools is open (Console + Network tabs)

---

## 🎯 Test 1: Basic Streaming Flow

**Objective**: Verify end-to-end streaming works

### Steps:
1. [ ] Navigate to demo section
2. [ ] Click "Try Demo" button
3. [ ] Select device (phone or watch)
4. [ ] **Check console**: Should see `[WS] Connecting to: ws://localhost:3001/ws/demo-deepgram`
5. [ ] **Check console**: Should see `[WS] Connected successfully`
6. [ ] **Check console**: Should see `[WS] AudioWorklet loaded`
7. [ ] Allow microphone permissions
8. [ ] Start speaking: "I need to buy groceries, milk, eggs, and bread"
9. [ ] **Watch phone screen**: Cards should appear in real-time as you speak
10. [ ] **Check console**: Should see `[WS] Received message: interim_transcript`
11. [ ] **Check console**: Should see `[WS] Received message: action_card`
12. [ ] Continue speaking: "Remind me to call the dentist tomorrow"
13. [ ] **Watch**: More cards should appear
14. [ ] Click stop recording
15. [ ] **Check console**: Should see `[WS] Stopping recording...`
16. [ ] **Check**: Final transcript displays on phone screen
17. [ ] **Check**: All cards are visible and properly formatted

### Expected Results:
- ✅ WebSocket connects successfully
- ✅ Audio streams without errors
- ✅ Interim transcripts appear in console
- ✅ Action cards appear incrementally (~1-2 seconds after speaking)
- ✅ Final transcript is complete and accurate
- ✅ No errors in console

### Analytics Events to Verify (PostHog):
```
demo_streaming_started
demo_card_received (x N, where N = number of cards)
demo_streaming_completed
```

---

## 🎯 Test 2: Fallback to Batch Mode

**Objective**: Verify automatic fallback works when streaming fails

### Steps:
1. [ ] **Stop the backend server** (Ctrl+C in backend terminal)
2. [ ] Refresh frontend page
3. [ ] Click "Try Demo"
4. [ ] Select device
5. [ ] **Check console**: Should see `[Demo] Attempting streaming mode...`
6. [ ] **Check console**: Should see `[WS] WebSocket error: ...`
7. [ ] **Check console**: Should see `[Demo] Streaming failed, falling back to batch mode`
8. [ ] **Check console**: Should see `[Demo] Using batch mode...`
9. [ ] Allow microphone and start recording
10. [ ] Speak for 5-10 seconds
11. [ ] Stop recording
12. [ ] **Wait 3-5 seconds**: Processing should complete
13. [ ] **Check**: All cards appear at once (batch behavior)

### Expected Results:
- ✅ WebSocket connection attempt fails gracefully
- ✅ System automatically falls back to batch mode
- ✅ User can still complete demo successfully
- ✅ No breaking errors, just warnings in console

### Analytics Events to Verify (PostHog):
```
demo_streaming_fallback (reason: "Connection failed")
demo_recording_started
demo_processing_started
demo_results_viewed
```

---

## 🎯 Test 3: Network Interruption

**Objective**: Verify handling of connection loss during recording

### Steps:
1. [ ] **Restart backend server**
2. [ ] Start demo and begin recording
3. [ ] Speak for a few seconds
4. [ ] **While recording**: Stop backend server (simulate network loss)
5. [ ] **Check console**: Should see WebSocket error
6. [ ] Continue speaking for a few more seconds
7. [ ] Stop recording
8. [ ] **Check**: Should handle gracefully

### Expected Results:
- ✅ Error is logged but doesn't crash app
- ✅ User sees error message or fallback behavior
- ✅ Analytics event: `demo_streaming_error`

---

## 🎯 Test 4: Microphone Permissions

**Objective**: Verify microphone permission handling

### Steps:
1. [ ] Clear site data (DevTools → Application → Clear site data)
2. [ ] Refresh page
3. [ ] Click "Try Demo" and select device
4. [ ] **Deny microphone permission** when browser asks
5. [ ] **Check**: Should see error message
6. [ ] **Check console**: Should see permission denied error
7. [ ] Refresh page
8. [ ] Try demo again
9. [ ] **Allow microphone permission**
10. [ ] **Check**: Demo should work normally

### Expected Results:
- ✅ Clear error message when permission denied
- ✅ Instructions on how to enable permissions
- ✅ Analytics event: `demo_microphone_denied`
- ✅ Demo works after permissions granted

---

## 🎯 Test 5: Browser Compatibility

**Objective**: Verify works across browsers

### Browsers to Test:
- [ ] **Chrome** (latest)
  - Expected: Full support ✅
- [ ] **Safari** (14.1+)
  - Expected: Full support ✅
  - Note: May need different audio constraints
- [ ] **Firefox** (76+)
  - Expected: Full support ✅
- [ ] **Edge** (Chromium-based)
  - Expected: Full support ✅
- [ ] **Mobile Safari** (iOS)
  - Expected: May have audio constraints, but should work
- [ ] **Mobile Chrome** (Android)
  - Expected: Full support ✅

### For Each Browser:
1. [ ] WebSocket connects
2. [ ] AudioWorklet loads
3. [ ] Microphone access works
4. [ ] Cards appear in real-time
5. [ ] No console errors

---

## 🎯 Test 6: Long Recording (30 seconds)

**Objective**: Verify full 30-second recording works

### Steps:
1. [ ] Start demo and begin recording
2. [ ] Speak continuously for 25-30 seconds (read a paragraph)
3. [ ] **Check**: Auto-stops at 30 seconds
4. [ ] **Check**: Multiple cards appeared during recording
5. [ ] **Check**: Final transcript is complete
6. [ ] **Check**: No memory leaks or performance issues

### Expected Results:
- ✅ Recording auto-stops at 30 seconds
- ✅ All spoken content is transcribed
- ✅ Cards continue appearing throughout
- ✅ No audio dropouts or glitches

---

## 🎯 Test 7: Multiple Demo Attempts

**Objective**: Verify cleanup and state management

### Steps:
1. [ ] Complete a demo recording
2. [ ] Click "Try Again" or start new recording
3. [ ] **Check**: Previous state is cleared
4. [ ] **Check**: New recording starts fresh
5. [ ] Complete second recording
6. [ ] **Check**: Works as expected
7. [ ] Repeat 3-5 times
8. [ ] **Check**: No degradation or errors

### Expected Results:
- ✅ Each demo session is independent
- ✅ State clears between attempts
- ✅ No accumulated errors or memory leaks
- ✅ WebSocket reconnects cleanly

---

## 🎯 Test 8: Mock Mode (No Backend)

**Objective**: Verify mock WebSocket works for development

### Steps:
1. [ ] Stop backend server
2. [ ] Modify `TryNowDemo.tsx` to use mock:
   ```typescript
   import { MockDemoWebSocket } from '../lib/mockWebSocket';
   // In useEffect:
   wsManagerRef.current = new MockDemoWebSocket(wsUrl);
   ```
3. [ ] Refresh frontend
4. [ ] Start demo and recording
5. [ ] **Check console**: Should see `[Mock WS]` logs
6. [ ] **Check**: Mock transcripts appear
7. [ ] **Check**: Mock cards appear (groceries, dentist, blog post, meeting)
8. [ ] **Wait**: Cards should appear at intervals
9. [ ] Stop recording
10. [ ] **Check**: Final transcript includes all segments

### Expected Results:
- ✅ Mock data appears without backend
- ✅ Timing simulates real behavior
- ✅ Useful for frontend development

---

## 📊 Network Tab Verification

### During Recording:

**WebSocket Tab (Filter: WS)**
```
Name: demo-deepgram
Status: 101 Switching Protocols
Type: websocket
```

**Messages Tab (↑ Sent)**
```
{"type":"start","sample_rate":16000,"channels":1,"format":"pcm16"}
<multiple binary frames> (audio data)
{"type":"stop"}
```

**Messages Tab (↓ Received)**
```
{"type":"interim_transcript","text":"I need to..."}
{"type":"interim_transcript","text":"I need to buy..."}
{"type":"action_card","action":"create","card":{...}}
{"type":"transcript","data":{...}}
```

---

## 🐛 Common Issues & Solutions

### Issue: "WebSocket connection failed"
**Solution**:
- Verify backend is running
- Check `VITE_API_URL` in `.env`
- Ensure no CORS issues
- Check firewall/antivirus

### Issue: "AudioWorklet failed to load"
**Solution**:
- Verify `/public/audio-processor.js` exists
- Check HTTPS (required for AudioWorklet)
- Try Chrome (best support)
- Check console for specific error

### Issue: "No cards appearing"
**Solution**:
- Check backend logs for extraction errors
- Verify speaking clearly and naturally
- Check Network tab for WebSocket messages
- Look for backend errors in terminal

### Issue: "Microphone permission denied"
**Solution**:
- Click lock icon in address bar
- Reset permissions
- Reload page
- Grant microphone access

### Issue: "Cards appear but transcript is empty"
**Solution**:
- Check DeepGram API key in backend
- Verify audio is being sent (check network tab)
- Check backend logs for DeepGram errors

---

## 📈 Performance Metrics to Track

### During Testing:
- **Time to first card**: Should be < 2 seconds after speaking
- **WebSocket latency**: Check in Network tab, should be < 100ms
- **Audio frame rate**: Should send frames continuously
- **Memory usage**: Monitor in DevTools Performance tab
- **No memory leaks**: Should stay stable across multiple recordings

### Target Metrics:
- ⏱️ Time to first card: **< 2 seconds**
- 📶 WebSocket connection success: **> 98%**
- 🎯 Card accuracy: **> 90%**
- 🚀 Demo completion rate: **+20%** vs batch mode

---

## ✅ Final Checklist

Before declaring streaming ready for production:

- [ ] All 8 tests pass
- [ ] Works in Chrome, Safari, Firefox
- [ ] Mobile browsers tested
- [ ] No console errors in any browser
- [ ] Analytics events firing correctly
- [ ] Fallback to batch mode works reliably
- [ ] Performance metrics meet targets
- [ ] Backend logs show no errors
- [ ] DeepGram API costs are reasonable
- [ ] User experience feels smooth and delightful

---

## 🎉 Success Criteria

**Streaming is ready for rollout when:**

1. ✅ All tests pass consistently
2. ✅ WebSocket connection success > 98%
3. ✅ Time to first card < 2 seconds
4. ✅ Zero breaking errors
5. ✅ Fallback works 100% of the time
6. ✅ Cross-browser compatibility verified
7. ✅ Analytics tracking accurate
8. ✅ Backend handles load gracefully

---

**Happy Testing! 🚀**

If you find issues, check the main `STREAMING_IMPLEMENTATION.md` for troubleshooting or create a GitHub issue with:
- Browser version
- Console logs
- Network tab screenshot
- Steps to reproduce
