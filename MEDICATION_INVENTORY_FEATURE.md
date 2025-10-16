# Medication Inventory Management Feature

## Overview
The Medication Inventory Management feature automatically tracks medication supply, calculates Days of Supply (DOS), and alerts patients when refills are needed.

## Access the Feature
- Navigate to: `/inventory` or `http://localhost:5173/inventory`
- Or click "Medication Inventory" from the Dashboard quick actions

## Key Features

### 1. **Automatic Days of Supply (DOS) Calculation**
- Formula: `DOS = Current Count ÷ Daily Consumption`
- Daily Consumption = Frequency (pills per day)
- Real-time calculations update as inventory changes

### 2. **Smart Alert System**
The system provides three alert levels:

#### 🔴 Critical (0-3 days supply)
- Immediate refill required
- Red color coding
- Priority alerts in notification center

#### 🟡 Warning (4-7 days supply)
- Refill needed soon
- Yellow/amber color coding
- Standard alerts

#### 🟢 Good (8+ days supply)
- Adequate supply
- Green color coding
- No alerts

### 3. **Manual Inventory Management**
Users can:
- Update current pill count manually
- View pills per bottle
- Track daily usage rate
- Edit inventory at any time

### 4. **Refill Management**
- Track refills remaining
- One-click refill simulation
- Last refill date tracking
- Automatic inventory update on refill

### 5. **AI/NLP Integration (Placeholder)**
The system is designed to integrate with Hugging Face NLP models:

**Purpose**: Extract refill instructions from prescription images
- "Refill 3 times" → Parsed as 3 refills
- "No refills available" → Parsed as 0 refills
- "Refill as needed" → Parsed accordingly

**Implementation Path**:
```
Prescription Image → Hugging Face NLP Model → Extract Refill Notes → Store in refillNotes field
```

## Data Structure

### Medication Interface
```typescript
interface Medication {
  id: string;
  name: string;
  dosage: string;                // e.g., "10mg"
  frequency: number;             // times per day
  durationDays: number;          // prescription duration
  currentCount: number;          // pills in stock
  pillsPerBottle: number;        // standard bottle size
  refillsRemaining: number;      // refills available
  refillNotes?: string;          // NLP-parsed instructions
  lastRefillDate: string;        // ISO date string
}
```

## Mock Data Examples

The demonstration uses 5 medications with different alert levels:

1. **Lisinopril** (Warning - 15 days left)
   - 10mg, once daily
   - 15 pills remaining
   - 3 refills available

2. **Metformin** (Warning - 22 days left)
   - 500mg, twice daily
   - 45 pills remaining
   - 5 refills available

3. **Atorvastatin** (Critical - 5 days left)
   - 20mg, once daily
   - 5 pills remaining
   - 2 refills available

4. **Omeprazole** (Good - 60 days left)
   - 40mg, once daily
   - 60 pills remaining
   - 0 refills (needs prescription renewal)

5. **Aspirin** (Good - 300 days left)
   - 81mg, once daily
   - 300 pills remaining
   - 12 refills available

## User Workflows

### Check Medication Status
1. Navigate to Medication Inventory
2. View summary cards (Critical/Warning/Good counts)
3. Scroll through medication list
4. Review DOS and inventory levels

### Update Inventory
1. Find medication card
2. Click "Edit Count" in the right panel
3. Enter new pill count
4. Click "Save"
5. DOS automatically recalculates

### Process Refill
1. Find medication needing refill
2. Click "Refill" button
3. System adds full bottle to inventory
4. Decrements refills remaining
5. Updates last refill date

## Visual Indicators

### Color Coding
- **Red Border**: Critical medications (0-3 days)
- **Yellow Border**: Warning medications (4-7 days)
- **Green Border**: Well-stocked medications (8+ days)

### Progress Bars
- Show inventory level relative to bottle size
- Match alert level colors
- Visual representation of supply

### Badges
- "OUT OF STOCK" - No pills remaining
- "CRITICAL" - 1-3 days supply
- "LOW STOCK" - 4-7 days supply
- "GOOD" - 8+ days supply

## Future Enhancements

### Backend Integration
Replace mock data with:
- Supabase database queries
- Real-time inventory updates
- Multi-user support
- Sync with prescription uploads

### AI/NLP Features
- Train custom Hugging Face model on prescription data
- Automatic refill note extraction
- OCR integration for prescription images
- Smart dosage parsing

### Notifications
- Push notifications for refill alerts
- Email reminders at 7-day threshold
- SMS alerts for critical medications
- Calendar integration

### Analytics
- Medication adherence tracking
- Refill pattern analysis
- Cost tracking per medication
- Insurance integration

### Pharmacy Integration
- One-click refill ordering
- Pharmacy selection
- Delivery tracking
- Insurance coverage verification

## Technical Notes

### State Management
- Uses React `useState` for local state
- No persistence (demonstration only)
- Easy to integrate with backend

### Calculations
All calculations are client-side:
- Days of Supply: `Math.floor(currentCount / frequency)`
- Inventory Progress: `(currentCount / pillsPerBottle) * 100`
- Alert Level: Based on DOS thresholds

### Responsive Design
- Mobile-first approach
- Grid layouts adapt to screen size
- Touch-friendly buttons and inputs
- Accessible components from shadcn/ui

## Accessibility
- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- Color-blind friendly status indicators
- Screen reader compatible

## Dependencies
- React Router for navigation
- shadcn/ui components
- Lucide React icons
- TailwindCSS for styling
- TypeScript for type safety

## Testing the Feature

1. **Start the development server**
   ```bash
   npm run dev
   # or
   npm start
   ```

2. **Navigate to the page**
   - Go to `http://localhost:5173/inventory`
   - Or use Dashboard → "Medication Inventory"

3. **Test scenarios**
   - View different alert levels
   - Update inventory counts
   - Process refills
   - Check DOS calculations
   - Test responsive layout

## Notes
- This is a **demonstration/prototype** with placeholder data
- No backend persistence (data resets on page refresh)
- Ready for backend integration
- AI/NLP features are conceptual placeholders
- Production deployment would require:
  - Database integration
  - User authentication
  - API endpoints
  - Real NLP model integration
  - Notification service

---

**Created**: October 16, 2025
**Version**: 1.0.0 (Demo)
**Status**: Ready for demonstration and backend integration

