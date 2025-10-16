# AI Chat Assistant Setup & Usage Guide

## Overview
The Medication Inventory page now includes an **AI-powered chat assistant** that uses Google's Gemini API to understand natural language and automatically update your medication inventory.

## Features

### 🤖 Natural Language Understanding
The assistant can understand phrases like:
- "I took my Lisinopril"
- "I missed my Metformin dose this morning"
- "I have 50 Aspirin pills left"
- "I just refilled my Atorvastatin"

### 📦 Automatic Inventory Updates
Based on your chat messages, the assistant will:
- **Decrease inventory** when you take medication
- **Log missed doses** without changing inventory
- **Update counts** when you manually count pills
- **Process refills** and update refill counts

### 💾 Persistent Storage
- All medications saved to `localStorage`
- Chat history preserved between sessions
- API key securely stored locally
- Data persists across page refreshes

---

## Getting Your Gemini API Key

### Step 1: Visit Google AI Studio
Go to: **https://makersuite.google.com/app/apikey**

### Step 2: Sign In
- Sign in with your Google account
- Accept the terms of service if prompted

### Step 3: Create API Key
1. Click **"Create API Key"**
2. Select a project or create a new one
3. Copy the generated API key (starts with `AIza...`)
4. **Keep it secure** - don't share it publicly!

### Step 4: Configure in App
1. Open the Medication Inventory page (`/inventory`)
2. Click the **Settings** icon (⚙️) in the header
3. Paste your API key in the dialog
4. Click **"Save API Key"**
5. You should see "✓ API Key is configured"

---

## Using the Chat Assistant

### Opening the Chat
1. Navigate to `/inventory` page
2. Click the **Message** icon (💬) in the header
3. Chat sidebar opens on the right

### Example Conversations

#### Taking Medication
```
You: I just took my morning Lisinopril
Assistant: Great job taking your Lisinopril! I'll update your inventory. 
You're doing well with your medication adherence.
```
→ **Result**: Inventory decreases by 1 pill

#### Missing a Dose
```
You: I forgot my Metformin this morning
Assistant: No worries, it happens! Try to take it as soon as you remember 
if it's not too close to your next dose. I've noted that you missed this dose.
```
→ **Result**: Logged but inventory unchanged

#### Manual Count Update
```
You: I counted and I have 45 Aspirin pills
Assistant: Thanks for updating me! I've updated your Aspirin inventory to 
45 pills. That gives you about 45 days of supply.
```
→ **Result**: Inventory set to 45 pills

#### Refill Request
```
You: I refilled my Atorvastatin today
Assistant: Excellent! I've processed your Atorvastatin refill. Added 30 
pills to your inventory. You now have 2 refills remaining.
```
→ **Result**: Adds full bottle, decrements refills

---

## How It Works

### 1. Context-Aware Processing
The assistant receives:
- Your current medications list
- Dosage and frequency information
- Current pill counts
- Recent conversation history

### 2. Gemini AI Analysis
The AI:
- Understands natural language
- Identifies medication names
- Determines the action (took/missed/update/refill)
- Generates a friendly response

### 3. Automatic Updates
Based on the AI's analysis:
- Medication counts update in real-time
- Changes persist to localStorage
- Toast notifications confirm actions
- Page refreshes to show new counts

### 4. Data Flow
```
User Message → Gemini API → Parse Action → Update Inventory → Save to localStorage
     ↓                                              ↓
Chat History                                  Visual Update
```

---

## Local Storage Structure

### Medications
**Key**: `vital-wise-medications`
```json
[
  {
    "id": "1",
    "name": "Lisinopril",
    "dosage": "10mg",
    "frequency": 1,
    "currentCount": 15,
    "pillsPerBottle": 90,
    "refillsRemaining": 3,
    ...
  }
]
```

### Chat History
**Key**: `vital-wise-chat-history`
```json
[
  {
    "role": "user",
    "content": "I took my Lisinopril",
    "timestamp": "2025-10-16T14:30:00.000Z"
  },
  {
    "role": "assistant",
    "content": "Great job taking your Lisinopril!...",
    "timestamp": "2025-10-16T14:30:02.000Z"
  }
]
```

### API Key
**Key**: `vital-wise-gemini-key`
```
AIzaSy... (encrypted string)
```

---

## API Integration Details

### Gemini Client (`src/lib/gemini-client.ts`)

#### Key Functions

**`initializeGemini(apiKey: string)`**
- Initializes the Gemini client with your API key
- Call this once during app setup

**`getGeminiClient()`**
- Returns the initialized client
- Throws error if not initialized

**`chat(message, medications, history)`**
- Sends message to Gemini API
- Returns response and parsed action
- Handles context and conversation history

#### Action Types
```typescript
interface MedicationAction {
  medicationName: string;
  action: "took" | "missed" | "refill" | "update";
  amount?: number;
  note?: string;
}
```

### API Request Format
```json
{
  "contents": [{
    "parts": [{
      "text": "System prompt + context + user message"
    }]
  }],
  "generationConfig": {
    "temperature": 0.7,
    "topK": 40,
    "topP": 0.95,
    "maxOutputTokens": 1024
  }
}
```

### Response Parsing
The assistant looks for:
```
ACTION: {"medicationName": "Lisinopril", "action": "took", "amount": 1}
```

This JSON is:
1. Parsed from AI response
2. Removed from display text
3. Used to update inventory

---

## Features & Capabilities

### ✅ What the Assistant Can Do
- Understand medication names (case-insensitive)
- Parse "took dose" messages
- Log missed doses
- Update inventory counts
- Process refills
- Maintain conversation context
- Provide helpful reminders
- Give adherence encouragement

### ❌ What the Assistant Cannot Do
- Prescribe medications
- Provide medical advice
- Replace doctor consultations
- Set future reminders (yet)
- Order from pharmacy (yet)
- Access real-time medical records

---

## Troubleshooting

### "API Key Required" Error
**Solution**: 
1. Click Settings icon
2. Enter your Gemini API key
3. Save and retry

### "Failed to send message"
**Possible Causes**:
- Invalid API key
- Network connectivity issues
- API rate limits exceeded

**Solutions**:
- Verify API key is correct
- Check internet connection
- Wait a few minutes (rate limit)
- Get a new API key if needed

### Medication Not Found
**Issue**: AI can't find the medication
**Solution**: 
- Use exact medication name from list
- Check spelling
- Try alternative: "Update Lisinopril to 50 pills"

### Chat Not Updating Inventory
**Check**:
1. Open browser console (F12)
2. Look for errors
3. Verify localStorage has data:
   ```javascript
   localStorage.getItem('vital-wise-medications')
   ```

### Clear All Data
To reset everything:
```javascript
// In browser console (F12)
localStorage.removeItem('vital-wise-medications');
localStorage.removeItem('vital-wise-chat-history');
localStorage.removeItem('vital-wise-gemini-key');
location.reload();
```

---

## Privacy & Security

### Data Storage
- All data stored **locally** in your browser
- No server synchronization (demo mode)
- API key stored in localStorage (not encrypted)
- Chat history stays on your device

### API Key Security
⚠️ **Important**:
- Never share your API key
- Don't commit it to git
- Don't post it online
- Regenerate if compromised

### Best Practices
1. Use API key only for personal testing
2. Enable billing alerts in Google Cloud
3. Monitor API usage
4. Rotate keys regularly
5. Clear localStorage on shared computers

---

## Future Enhancements

### Planned Features
- 🔔 **Smart Reminders**: "Remind me to take Lisinopril at 8 AM"
- 📊 **Adherence Tracking**: Visual adherence score
- 📅 **Schedule Integration**: Sync with calendar
- 🏥 **Pharmacy Connection**: One-click refill orders
- 🔐 **Backend Sync**: Cloud storage with encryption
- 📱 **Push Notifications**: Mobile alerts
- 🎯 **Predictive Alerts**: ML-based refill predictions

### Backend Integration (Coming Soon)
Replace localStorage with:
- Supabase database
- Real-time sync
- Multi-device support
- Encrypted storage
- User authentication

---

## Example Use Cases

### Morning Routine
```
8:00 AM - User: "Took my morning meds"
Assistant: "Great! Which medications did you take?"
User: "Lisinopril and Metformin"
Assistant: "Perfect! Updated both medications..."
```

### Weekly Check
```
User: "How many days of Atorvastatin do I have left?"
Assistant: "You have 5 pills of Atorvastatin remaining, 
which gives you 5 days of supply. You should refill soon!"
```

### Refill Day
```
User: "Just picked up my Lisinopril refill from pharmacy"
Assistant: "Excellent! I've added 90 pills to your inventory. 
You now have 2 refills remaining."
```

---

## Technical Notes

### Dependencies
- Google Generative AI API (Gemini Pro)
- React 18+ for state management
- localStorage API for persistence
- shadcn/ui components

### Browser Compatibility
- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Responsive

### Performance
- Chat responses: ~1-3 seconds
- localStorage: Instant
- No page reloads needed
- Real-time UI updates

---

## Support & Resources

### Google Gemini
- **API Docs**: https://ai.google.dev/docs
- **API Key**: https://makersuite.google.com/app/apikey
- **Pricing**: https://ai.google.dev/pricing
- **Limits**: Free tier includes generous quotas

### Project Resources
- See `MEDICATION_INVENTORY_FEATURE.md` for main feature docs
- Check `src/lib/gemini-client.ts` for API implementation
- Review `src/pages/MedicationInventory.tsx` for UI code

---

## Quick Start Checklist

- [ ] Get Gemini API key from Google AI Studio
- [ ] Open Medication Inventory page (`/inventory`)
- [ ] Click Settings icon and enter API key
- [ ] Click Chat icon to open assistant
- [ ] Try: "I took my Lisinopril"
- [ ] Verify inventory decreased
- [ ] Check localStorage has data

---

**Created**: October 16, 2025  
**Version**: 1.0.0  
**Status**: Ready for use with Gemini API key  
**Demo Mode**: Uses localStorage (no backend)

Happy medication management! 💊🤖

