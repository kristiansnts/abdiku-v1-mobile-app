# Localization Implementation

This app supports multiple languages using `expo-localization` and a custom localization context.

## Supported Languages

- **English (en)** - Default
- **Bahasa Indonesia (id)**

## Features

- Automatic language detection based on device settings
- Persistent language preference (saved to AsyncStorage)
- Easy language switching from the Profile screen
- Fully typed translation system

## Files Structure

### Translation Files
- **`constants/translations.ts`** - Contains all translations for both languages

### Context
- **`context/LocalizationContext.tsx`** - Manages language state and provides translation function

## Usage

### Using Translations in Components

```tsx
import { useLocalization } from '@/context/LocalizationContext';

function MyComponent() {
  const { t, locale, setLocale } = useLocalization();

  return (
    <View>
      <Text>{t.home.greeting}</Text>
      <Text>{t.common.loading}</Text>
    </View>
  );
}
```

### Adding New Translations

1. Open `constants/translations.ts`
2. Add your key to both `en` and `id` objects:

```typescript
export const translations = {
  en: {
    mySection: {
      myKey: 'My English Text',
    },
  },
  id: {
    mySection: {
      myKey: 'Teks Bahasa Indonesia Saya',
    },
  },
};
```

3. Use it in your component:

```tsx
const { t } = useLocalization();
<Text>{t.mySection.myKey}</Text>
```

### Changing Language

Users can change the language from:
**Profile Tab → Settings → Language**

The app will:
1. Save the preference to AsyncStorage
2. Update the UI immediately
3. Remember the choice on app restart

## Implementation Details

### How It Works

1. **LocalizationProvider** wraps the entire app in `app/_layout.tsx`
2. On mount, it loads the saved language from AsyncStorage
3. If no saved language, it uses the device's default language
4. The `useLocalization` hook provides access to:
   - `t` - The translation object for the current language
   - `locale` - The current language code ('en' or 'id')
   - `setLocale` - Function to change the language

### Auto-detection

The app automatically detects the device language on first launch:
- If device is set to Indonesian → Uses Indonesian
- Otherwise → Uses English

## Translation Coverage

Currently translated screens:
- ✅ Tab navigation labels
- ✅ Profile screen
- ✅ Common UI elements (buttons, loading states)
- ✅ Map modal
- ✅ Home/Attendance screen labels
- ✅ Error messages

## Adding More Languages

To add a new language (e.g., Spanish):

1. Add the language code to the Language type in `translations.ts`:
```typescript
export type Language = 'en' | 'id' | 'es';
```

2. Add the translation object:
```typescript
export const translations = {
  en: { /* ... */ },
  id: { /* ... */ },
  es: {
    common: {
      loading: 'Cargando...',
      // ... add all keys
    },
  },
};
```

3. Update the language selector UI in `app/(tabs)/explore.tsx`

## Notes

- All UI text should use translations for consistency
- Keep translation keys organized by feature/screen
- Always provide translations for both languages when adding new keys
- The TypeScript system will warn you if a translation key is missing
