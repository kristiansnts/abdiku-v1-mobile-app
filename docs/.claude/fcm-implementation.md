# FCM Push Notifications Implementation Plan

## Overview
Integrate Firebase Cloud Messaging (FCM) into Abdiku attendance system to enable real-time push notifications on mobile devices while maintaining existing database notifications for web dashboard users.

## What You Need to Provide

### 1. Firebase Project Setup
- **Create Firebase Project**: https://console.firebase.google.com
- **Add Android App**: Package name `com.kristiansnts.abdikuv1mobileapp`
- **Add iOS App**: Bundle ID `com.kristiansnts.abdikuv1mobileapp`
- **Enable FCM API**: Cloud Messaging API (v1) in Firebase Console

### 2. Download Required Files
- **Service Account JSON**: Firebase Console → Project Settings → Service Accounts → Generate New Private Key
  - Save as: `abdiku-v1/storage/app/json/firebase-service-account.json`
- **Android Config**: Download `google-services.json` → Place in `abdiku-v1-mobile-app/`
- **iOS Config**: Download `GoogleService-Info.plist` → Place in `abdiku-v1-mobile-app/`

### 3. Expo Project ID
- Get from: `abdiku-v1-mobile-app/app.json` under `extra.eas.projectId`
- If not present, run: `eas init` in mobile app directory

## Token Budget Estimate
**40,000 - 60,000 tokens** for full implementation
- Current usage: ~47K tokens
- **Remaining: ~153K tokens** ✅ Sufficient (well above 20K reserve)

## Architecture Decisions

### Dual-Channel Strategy
Extend existing notifications to support **both database AND FCM** channels:
- **Web users (HR/Owners)**: Database notifications in Filament Dashboard
- **Mobile users (Employees)**: FCM push notifications + database backup
- **Benefit**: Gradual rollout without breaking existing functionality

### Multi-Device Token Management
Store FCM tokens in existing `UserDevice` model:
- One user can have multiple devices
- Each device has unique FCM token
- Tokens tracked per device for targeted delivery
- Automatic cleanup of expired/invalid tokens

### Package Selection
**Backend**: `laravel-notification-channels/fcm` (not kreait/firebase-php)
- Native Laravel notification system integration
- FCM HTTP v1 API support (Google recommended)
- Minimal changes to existing notification classes

**Mobile**: `expo-notifications`
- Simplifies FCM setup for Expo apps
- Handles Android/iOS platform differences
- Built-in permission management

## Implementation Steps

### Phase 1: Backend Infrastructure

#### 1. Install FCM Package
```bash
cd abdiku-v1
composer require laravel-notification-channels/fcm
```

#### 2. Database Migration
**Create**: `database/migrations/2026_02_10_000001_add_fcm_token_to_user_devices_table.php`
```php
Schema::table('user_devices', function (Blueprint $table) {
    $table->string('fcm_token')->nullable()->after('app_version');
    $table->timestamp('fcm_token_updated_at')->nullable()->after('fcm_token');
    $table->index(['fcm_token']);
});
```

Run: `php artisan migrate`

#### 3. Configuration Files

**Create**: `config/fcm.php`
```php
return [
    'driver' => env('FCM_DRIVER', 'fcm'),
    'drivers' => [
        'fcm' => [
            'credentials' => storage_path('app/json/firebase-service-account.json'),
        ],
    ],
];
```

**Update**: `.env`
```env
FCM_DRIVER=fcm
```

**Update**: `.gitignore`
```
storage/app/json/firebase-service-account.json
```

#### 4. Update UserDevice Model
**File**: `app/Models/UserDevice.php`

Add to `$fillable`: `'fcm_token', 'fcm_token_updated_at'`

Add methods:
- `updateFcmToken(?string $token): void`
- `hasFcmToken(): bool`
- `clearFcmToken(): void`

### Phase 2: Backend API Endpoints

#### 5. Create Controllers

**Create**: `app/Http/Controllers/Api/V1/Notification/FcmTokenController.php`
- `update()`: Register/update FCM token for device
- `destroy()`: Remove FCM token (logout/permission revoked)

**Create**: `app/Http/Controllers/Api/V1/Notification/NotificationController.php`
- `index()`: Get user's notifications (paginated)
- `markAsRead()`: Mark single notification as read
- `markAllAsRead()`: Mark all as read
- `unreadCount()`: Get unread count for badge

#### 6. Add API Routes
**Update**: `routes/api.php`

```php
Route::prefix('notifications')->group(function () {
    Route::get('/', [NotificationController::class, 'index']);
    Route::get('/unread-count', [NotificationController::class, 'unreadCount']);
    Route::post('/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::post('/fcm-token', [FcmTokenController::class, 'update']);
    Route::delete('/fcm-token', [FcmTokenController::class, 'destroy']);
});
```

### Phase 3: FCM Notification Channel

#### 7. Create FCM Channel
**Create**: `app/Channels/FcmChannel.php`
- Connect to Firebase using service account
- Send notifications to all active devices with FCM tokens
- Handle token invalidation (NotFound errors)
- Log send status and errors

#### 8. Create FCM Support Trait
**Create**: `app/Notifications/Concerns/HasFcmSupport.php`
- `toFcm($notifiable)`: Convert database notification to FCM format
- `getFcmType()`: Notification type for routing
- `getRelatedId()`: Entity ID for deep linking
- `getRelatedType()`: Entity type for deep linking

#### 9. Update Notification Classes
**Modify 8 files** in `app/Notifications/`:
1. AttendanceRequestSubmittedNotification
2. AttendanceRequestReviewedNotification
3. EmployeeAbsentNotification
4. PayrollPreparedNotification
5. PayrollFinalizedStakeholderNotification
6. PayrollFinalizedEmployeeNotification
7. PayslipAvailableNotification
8. OverrideRequestNotification

**Changes for each**:
- Add `use HasFcmSupport` trait
- Update `via()` to include `FcmChannel::class` for employee/hr/owner roles
- Implement `getFcmType()`, `getRelatedId()`, `getRelatedType()` methods

### Phase 4: Mobile App Setup

#### 10. Install Expo Notifications
```bash
cd abdiku-v1-mobile-app
npx expo install expo-notifications expo-device
```

#### 11. Configure app.json
**Update**: `app.json`
- Add `expo-notifications` plugin with icon, color, sounds
- Configure Android: `googleServicesFile`, `POST_NOTIFICATIONS` permission
- Configure iOS: `googleServicesFile`
- Add notification configuration object

#### 12. Create Notification Service
**Create**: `services/notificationService.ts`
- `requestNotificationPermissions()`: Request user permission
- `getFcmToken()`: Get Expo push token
- `registerFcmToken()`: Register with backend
- `clearFcmToken()`: Clear on logout
- `getNotifications()`: Fetch from backend
- `markNotificationAsRead()`: Mark as read
- `markAllNotificationsAsRead()`: Bulk mark
- `getUnreadCount()`: Get badge count
- `parseNotificationData()`: Parse push payload

#### 13. Create Notification Context
**Create**: `context/NotificationContext.tsx`
- Manage notification state (notifications, unreadCount, loading)
- Set up notification listeners (foreground, background, killed)
- Handle notification press with deep linking routing
- Provide `useNotifications()` hook
- Automatic badge count management

#### 14. Update Auth Context
**Update**: `context/AuthContext.tsx`
- In `login()`: Request permission → Get FCM token → Register with backend
- In `logout()`: Clear FCM token from backend

#### 15. Update App Layout
**Update**: `app/_layout.tsx`
- Wrap with `<NotificationProvider>` around existing providers

#### 16. Create Notifications Screen
**Create**: `app/(tabs)/notifications.tsx`
- Display notification list with unread indicators
- Pull to refresh
- Mark as read on tap
- Mark all as read button
- Navigate to related screens on notification press

### Phase 5: Testing & Verification

#### Backend Tests
1. ✅ Database migration successful
2. ✅ API endpoints respond correctly:
   - POST /api/v1/notifications/fcm-token
   - DELETE /api/v1/notifications/fcm-token
   - GET /api/v1/notifications
   - POST /api/v1/notifications/{id}/read
   - GET /api/v1/notifications/unread-count
3. ✅ FCM channel sends messages successfully
4. ✅ Multi-device delivery works
5. ✅ Invalid tokens are cleaned up

#### Mobile Tests (Physical Device Required)
1. ✅ Permission request flow
2. ✅ FCM token registration on login
3. ✅ Notification receipt - Foreground (banner)
4. ✅ Notification receipt - Background (system tray)
5. ✅ Notification receipt - Killed state
6. ✅ Deep linking navigation works
7. ✅ Badge count updates correctly
8. ✅ Notifications screen displays history
9. ✅ Mark as read functionality
10. ✅ Token cleared on logout

#### End-to-End Test Scenarios
1. **Attendance Request Flow**:
   - Employee submits attendance request
   - HR receives push notification
   - HR taps notification → Opens request detail
   - HR reviews request
   - Employee receives review notification

2. **Payroll Flow**:
   - Payroll finalized by system
   - All employees receive push notification
   - Employee taps notification → Opens payslip detail

3. **Multi-Device**:
   - User logged in on 2 devices
   - Trigger notification
   - Both devices receive push notification

## Critical Files to Modify/Create

### Backend (17 files)
**New Files:**
- `config/fcm.php` - FCM configuration
- `database/migrations/2026_02_10_000001_add_fcm_token_to_user_devices_table.php` - Token storage
- `app/Channels/FcmChannel.php` - FCM delivery channel
- `app/Notifications/Concerns/HasFcmSupport.php` - Reusable FCM trait
- `app/Http/Controllers/Api/V1/Notification/FcmTokenController.php` - Token management API
- `app/Http/Controllers/Api/V1/Notification/NotificationController.php` - Notification API
- `storage/app/json/firebase-service-account.json` - Firebase credentials (from you)

**Modified Files:**
- `app/Models/UserDevice.php` - Add FCM token methods
- `routes/api.php` - Add notification routes
- `.env` - Add FCM_DRIVER
- `.gitignore` - Ignore Firebase credentials
- `app/Notifications/*.php` (8 files) - Add FCM support

### Mobile App (8 files)
**New Files:**
- `services/notificationService.ts` - Notification client
- `context/NotificationContext.tsx` - Notification state
- `app/(tabs)/notifications.tsx` - Notifications screen
- `google-services.json` - Android Firebase config (from you)
- `GoogleService-Info.plist` - iOS Firebase config (from you)

**Modified Files:**
- `app.json` - Add notification configuration
- `context/AuthContext.tsx` - Add FCM token registration
- `app/_layout.tsx` - Add NotificationProvider
- `.gitignore` - Ignore Firebase config files
- `package.json` - Add expo-notifications dependency (auto-updated)

## Notification Type Mapping

| Backend Event | Notification Class | FCM Type | Deep Link Destination |
|--------------|-------------------|----------|----------------------|
| Attendance request submitted | AttendanceRequestSubmittedNotification | `attendance_request_submitted` | `/request-detail?id={id}` |
| Attendance request reviewed | AttendanceRequestReviewedNotification | `attendance_request_reviewed` | `/request-detail?id={id}` |
| Employee absent detected | EmployeeAbsentNotification | `employee_absent` | `/(tabs)/history` |
| Payroll prepared | PayrollPreparedNotification | `payroll_prepared` | `/(tabs)/payslip` |
| Payroll finalized (stakeholder) | PayrollFinalizedStakeholderNotification | `payroll_finalized_stakeholder` | `/(tabs)/payslip` |
| Payroll finalized (employee) | PayrollFinalizedEmployeeNotification | `payroll_finalized_employee` | `/payslip-detail?id={id}` |
| Payslip available | PayslipAvailableNotification | `payslip_available` | `/payslip-detail?id={id}` |
| Override request | OverrideRequestNotification | `override_request` | `/request-detail?id={id}` |

## Risks & Mitigations

### Risk 1: FCM Token Expiration
**Impact**: Users stop receiving notifications
**Mitigation**:
- Implement token refresh listener in mobile app
- Automatic cleanup of invalid tokens on send failure
- Monthly cleanup job for stale tokens

### Risk 2: iOS Background Restrictions
**Impact**: Notifications not delivered in background
**Mitigation**:
- Use data-only messages (not notification messages)
- Configure proper iOS capabilities
- Test thoroughly on physical iOS devices

### Risk 3: Security - Firebase Credentials
**Impact**: Unauthorized access if credentials leaked
**Mitigation**:
- Store in gitignored location
- Use environment-specific credentials
- Never commit to version control
- Rotate keys periodically

### Risk 4: Multi-Device Complexity
**Impact**: Inconsistent notification state across devices
**Mitigation**:
- Use database as source of truth
- Mark as read on backend (syncs across devices)
- Badge count from backend API

## Success Criteria

### Technical Metrics
- ✅ FCM token registration rate: >80% of active mobile users
- ✅ Notification delivery rate: >95%
- ✅ Average delivery time: <5 seconds
- ✅ Zero database notification regressions

### User Experience
- ✅ Push notifications arrive instantly on mobile
- ✅ Tapping notification opens correct screen
- ✅ Badge count shows accurate unread count
- ✅ Web dashboard notifications continue working

## Post-Implementation Tasks

1. **Save plan to project docs**:
   ```bash
   mkdir -p docs/.claude
   cp ~/.claude/plans/precious-weaving-lemon.md docs/.claude/fcm-implementation.md
   ```

2. **Monitor for 48 hours**:
   - Check Laravel logs for FCM send errors
   - Monitor token registration rate
   - Track notification delivery metrics
   - Collect user feedback

3. **Future Enhancements**:
   - User notification preferences (enable/disable types)
   - Quiet hours configuration
   - Rich media notifications (images)
   - Action buttons in notifications

## Dependencies

### Already Installed
- ✅ Laravel 12
- ✅ Laravel Sanctum (API auth)
- ✅ Expo 54
- ✅ React Navigation
- ✅ Axios

### To Install
- ⏳ laravel-notification-channels/fcm (Backend)
- ⏳ expo-notifications (Mobile)
- ⏳ expo-device (Mobile)

## Environment Variables

### Backend (.env)
```env
FCM_DRIVER=fcm
```

### Mobile (app.json)
```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "your-expo-project-id"
      }
    }
  }
}
```

## Rollout Strategy

**Week 1**: Internal testing with dev team
**Week 2**: Beta testing with 10-20 employees
**Week 3**: Full production rollout

Monitor closely during each phase before proceeding to next.

---

## Ready to Implement

All files have been identified, architecture decisions made, and testing procedures defined. Implementation can begin once you provide the Firebase credentials and configuration files listed in the "What You Need to Provide" section.
