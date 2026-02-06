# Abdiku Mobile App - Feature Summary

## Overview
Abdiku is a mobile attendance management application built with React Native (Expo) that allows employees to clock in/out, manage attendance requests, and view their profile information.

---

## Core Features

### 1. Authentication
- **Login/Logout** - Secure authentication with JWT tokens
- **Auto-logout** - Automatic session invalidation on 401/403 errors
- **Persistent sessions** - Token stored in AsyncStorage

### 2. Attendance Management

#### Clock In/Out
- **Geolocation verification** - GPS-based location tracking
- **Geofencing** - Validates if user is within designated office areas
- **Mock location detection** - Blocks fake GPS apps
- **Real-time clock display** - Live time with date formatting
- **Shift time display** - Shows assigned shift hours
- **Late detection** - Calculates and displays late minutes
- **Loading indicator** - Shows progress during clock action

#### Attendance History
- **Recent activity list** - Last 5 attendance records
- **Status badges** - Approved, Pending, Rejected, Locked
- **Late time display** - Formatted late duration (hours/minutes)

### 3. Offline Mode
- **Offline clock in/out** - Save attendance locally when offline
- **Automatic sync** - Syncs pending actions when network restored
- **Pending indicator** - Shows "Pending sync" badge
- **7-day data retention** - Auto-cleanup of expired offline data
- **Retry mechanism** - Up to 5 retry attempts for failed syncs

### 4. Attendance Requests
- **Late justification** - Explain late arrivals
- **Time correction** - Request clock time corrections
- **Missing attendance** - Request for forgotten attendance
- **Request status tracking** - View pending/approved/rejected requests
- **Delete requests** - Remove pending requests

### 5. Profile Management
- **Personal information** - View employee details
- **Employment details** - Department, position, employee ID
- **Compensation info** - Salary and allowances (if available)
- **Language settings** - Switch between English and Indonesian

---

## Technical Implementation

### Architecture
```
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Attendance/Home screen
│   │   ├── requests.tsx   # Requests screen
│   │   └── explore.tsx    # Profile screen
│   ├── _layout.tsx        # Root layout with providers
│   └── login.tsx          # Login screen
├── components/            # Reusable UI components
│   ├── attendance/        # Attendance-specific components
│   ├── requests/          # Request-specific components
│   └── common/            # Shared components (Toast, etc.)
├── context/               # React Context providers
│   ├── AuthContext.tsx    # Authentication state
│   ├── LocalizationContext.tsx  # i18n support
│   └── NetworkContext.tsx # Network & offline sync
├── hooks/                 # Custom React hooks
│   ├── useAttendance.ts   # Attendance logic
│   ├── useGeofence.ts     # Geofencing logic
│   └── useRequests.ts     # Request management
├── services/              # API & business logic
│   ├── api.ts             # Axios instance
│   ├── attendanceService.ts
│   ├── requestService.ts
│   ├── offlineStorage.ts  # AsyncStorage operations
│   └── syncService.ts     # Background sync logic
├── types/                 # TypeScript definitions
└── utils/                 # Utility functions
```

### Key Dependencies
- **Expo SDK 54** - React Native framework
- **expo-router** - File-based routing
- **expo-location** - GPS and geofencing
- **@react-native-async-storage/async-storage** - Local storage
- **@react-native-community/netinfo** - Network detection
- **axios** - HTTP client
- **react-native-reanimated** - Animations
- **react-native-maps** - Map display

### Localization
- **English (en)** - Default language
- **Indonesian (id)** - Bahasa Indonesia support
- Uses `expo-localization` for device locale detection

---

## Offline Mode Details

### How It Works
1. User attempts clock in/out while offline
2. Action saved to local AsyncStorage queue
3. UI shows "Pending sync" indicator
4. When network restored, auto-sync triggered
5. Pending actions synced to server sequentially
6. On success: removed from queue, UI updated
7. On failure: retry with exponential backoff

### Storage Keys
- `offline_queue` - Array of pending clock actions
- `last_sync_attempt` - Timestamp of last sync

### Configuration
- Max retry attempts: 5
- Data retention: 7 days
- Retry delay: 1 second between attempts

---

## UI/UX Features

### Visual Feedback
- **Toast notifications** - Success/error/info messages
- **Loading modals** - During clock actions
- **Pull-to-refresh** - Refresh attendance data
- **Animated transitions** - Smooth UI animations

### Status Indicators
- **Geofence badge** - Inside/outside office area
- **Late notice banner** - Dismissible late warning
- **Pending sync badge** - Offline actions waiting

---

## Testing

### Test Coverage
- Unit tests for services (attendanceService, offlineStorage, syncService)
- Utility function tests (date, geo, status)
- Jest test runner with ts-jest

### Run Tests
```bash
npm test              # Run all tests
npm test:watch        # Watch mode
npm test:coverage     # With coverage report
```

---

## API Endpoints Used

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/attendance/status` | GET | Current attendance status |
| `/attendance/history` | GET | Attendance history |
| `/attendance/clock-in` | POST | Clock in |
| `/attendance/clock-out` | POST | Clock out |
| `/company/locations` | GET | Office locations for geofencing |
| `/requests` | GET/POST/DELETE | Manage requests |

---

## Future Considerations
- [ ] Push notifications for sync status
- [ ] Background sync when app is closed
- [ ] Biometric authentication
- [ ] Attendance reports/analytics
- [ ] Manager approval workflow
