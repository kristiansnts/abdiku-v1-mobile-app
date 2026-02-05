# Unit Tests

This directory contains comprehensive unit tests for the Abdiku mobile app.

## 📁 Structure

```
__tests__/
├── services/
│   └── attendanceService.test.ts    # Attendance API service tests
├── utils/
│   ├── date.test.ts                 # Date formatting utilities tests
│   ├── geo.test.ts                  # Geolocation utilities tests
│   └── status.test.ts               # Status translation utilities tests
└── TEST_SUMMARY.md                  # Detailed test documentation
```

## 🚀 Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (auto-rerun on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## 📊 Current Status

- **Total Test Suites**: 4
- **Total Tests**: 59
- **Status**: ✅ All passing
- **Code Coverage**: ~91% statements, ~77% branches, ~86% functions

## 🧪 Test Categories

### Services Tests (18 tests)
- **attendanceService.test.ts**: Tests all attendance-related API calls
  - Getting attendance status
  - Fetching attendance history
  - Clock in/out operations
  - Location services
  - Payload building

### Utilities Tests (41 tests)

#### Date Utilities (13 tests)
- Date formatting with multiple patterns
- Time parsing and extraction
- Locale support (English/Indonesian)

#### Geo Utilities (11 tests)
- Distance calculations (Haversine formula)
- Geofence validation
- Nearest location finding

#### Status Utilities (17 tests)
- Status translation
- Color mapping
- Request type/status handling

## 🛠️ Testing Stack

- **Test Runner**: Jest 30.2.0
- **TypeScript Support**: ts-jest 29.4.6
- **Mocking**: Jest mocks for API calls
- **Coverage**: Built-in Jest coverage

## 📝 Writing New Tests

### Example Test Structure

```typescript
import { myFunction } from '../../path/to/module';

describe('myFunction', () => {
  it('should do something specific', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = myFunction(input);
    
    // Assert
    expect(result).toBe('expected');
  });
});
```

### Best Practices

1. **Descriptive Names**: Use clear, descriptive test names
2. **Arrange-Act-Assert**: Follow the AAA pattern
3. **Isolation**: Each test should be independent
4. **Mock External Dependencies**: Mock API calls, timers, etc.
5. **Edge Cases**: Test both happy paths and error scenarios
6. **Type Safety**: Leverage TypeScript for type-safe tests

## 🔧 Configuration

### jest.config.js
- **Preset**: ts-jest for TypeScript support
- **Test Environment**: Node.js
- **Module Mapping**: Supports `@/` path aliases
- **Transform Ignore**: Handles React Native and Expo modules
- **Coverage**: Configured for utils and services directories

### Mocks
- **react-native**: Mocked in `__mocks__/react-native.js` for Node environment

## 📈 Coverage Goals

Current coverage is excellent, but we aim for:
- **Statements**: 95%+
- **Branches**: 85%+
- **Functions**: 95%+
- **Lines**: 95%+

## 🐛 Debugging Tests

```bash
# Run a specific test file
npm test -- __tests__/utils/date.test.ts

# Run tests matching a pattern
npm test -- --testNamePattern="formatDate"

# Run with verbose output
npm test -- --verbose

# Update snapshots (if using snapshot tests)
npm test -- -u
```

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [ts-jest Documentation](https://kulshekhar.github.io/ts-jest/)
- [Testing Best Practices](https://testingjavascript.com/)

## 🤝 Contributing

When adding new features:
1. Write tests first (TDD approach recommended)
2. Ensure all tests pass before committing
3. Maintain or improve code coverage
4. Update this README if adding new test categories

---

**Last Updated**: 2026-02-05
**Maintained By**: Development Team
