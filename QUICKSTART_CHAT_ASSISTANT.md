# Quick Start Guide: AI Chat Assistant

## 🚀 Get Started in 1 Minute

### Step 1: Configure Your API Key (30 seconds)
1. Navigate to `/inventory` page (http://localhost:5173/inventory)
2. Click the **⚙️ Settings** icon in the header
3. Paste your Gemini API key
4. Click "Save API Key"

### Step 2: Start Chatting (30 seconds)
1. Click the **💬 Message** icon in the header
2. Type: `I took my Lisinopril`
3. Press Enter
4. Watch your inventory update automatically! ✨

---

## 💬 What Can You Say?

### Taking Medication
```
✓ "I took my Lisinopril"
✓ "Just took my morning Metformin"
✓ "Took Atorvastatin"
```
**Result**: Inventory decreases by 1 pill (or frequency amount)

### Missing Doses
```
✓ "I missed my Metformin this morning"
✓ "Forgot my Atorvastatin"
✓ "Didn't take my pills today"
```
**Result**: Logged but inventory unchanged

### Manual Updates
```
✓ "I have 50 Aspirin pills left"
✓ "Counted 45 pills of Metformin"
✓ "My Lisinopril bottle has 30 pills"
```
**Result**: Inventory updated to specified count

### Refills
```
✓ "I refilled my Atorvastatin"
✓ "Just picked up my Lisinopril from pharmacy"
✓ "Got a refill for Metformin"
```
**Result**: Adds full bottle, decrements refills

---

## 📊 Features at a Glance

| Feature | Status | Description |
|---------|--------|-------------|
| 💾 **Persistent Storage** | ✅ Active | Data saved to localStorage |
| 🤖 **AI Understanding** | ✅ Active | Gemini API processes messages |
| 📉 **Auto Updates** | ✅ Active | Inventory changes automatically |
| 🔔 **Smart Alerts** | ✅ Active | 7-day advance warnings |
| 💬 **Chat History** | ✅ Active | Conversations saved |
| 📱 **Responsive UI** | ✅ Active | Works on mobile |

---

## 🎯 Example Conversations

### Taking Morning Meds
```
You: I took my Lisinopril