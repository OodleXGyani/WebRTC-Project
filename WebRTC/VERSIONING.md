# APK Versioning Guide

## Current Version: 1.0.0

Your WebRTC app now has automatic versioning configured! Here's how to manage versions:

## 🚀 Quick Version Commands

### Update Version (Automatic)
```bash
# Patch version (1.0.0 → 1.0.1) - for bug fixes
npm run version:patch

# Minor version (1.0.1 → 1.1.0) - for new features  
npm run version:minor

# Major version (1.1.0 → 2.0.0) - for breaking changes
npm run version:major

# Check current version
npm run version:check
```

### Manual Version Update
1. Edit `package.json` - change `"version"` field
2. Edit `android/app/build.gradle` - update:
   - `versionName` (must match package.json version)
   - `versionCode` (increment by 1)

## 📱 Version Structure

- **versionName**: User-visible version (e.g., "1.0.0")
- **versionCode**: Internal Android version (e.g., 1, 2, 3...)
- **package.json version**: Project version (should match versionName)

## 🔧 Build APK with Version

```bash
# Build Android APK
cd android
./gradlew assembleRelease

# APK will be generated at:
# android/app/build/outputs/apk/release/app-release.apk
```

## 📋 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Initial | Base WebRTC app with versioning |

## 🎯 Best Practices

1. **Always use npm scripts** to avoid version mismatches
2. **Increment versionCode** every build (handled automatically)
3. **Test APK** before incrementing major versions
4. **Document changes** in version history

## 🔍 Troubleshooting

- If version mismatch occurs, run `npm run version:check`
- For manual updates, ensure both package.json and build.gradle are updated
- versionCode must be a positive integer
