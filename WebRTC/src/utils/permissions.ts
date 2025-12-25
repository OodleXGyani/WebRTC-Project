import { Platform, PermissionsAndroid } from 'react-native';

/**
 * Request microphone permission for Android
 */
const requestAndroidMicPermission = async (): Promise<boolean> => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      {
        title: 'Microphone Permission',
        message: 'This app needs access to your microphone for voice calls.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      }
    );

    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('✅ Microphone permission granted (Android)');
      return true;
    } else {
      console.log('❌ Microphone permission denied (Android)');
      return false;
    }
  } catch (err) {
    console.error('Error requesting Android permission:', err);
    return false;
  }
};

/**
 * Request microphone permission for iOS
 * Note: iOS permissions are declared in Info.plist
 */
const requestIOSMicPermission = async (): Promise<boolean> => {
  try {
    // iOS permissions are handled via Info.plist
    // The system will automatically prompt the user on first access
    console.log('✅ iOS will request permission automatically via Info.plist');
    return true;
  } catch (err) {
    console.error('Error with iOS permission:', err);
    return false;
  }
};

/**
 * Request microphone permission (cross-platform)
 */
export const requestMicrophonePermission = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'android') {
      return await requestAndroidMicPermission();
    } else if (Platform.OS === 'ios') {
      return await requestIOSMicPermission();
    }
    return true;
  } catch (err) {
    console.error('Error requesting microphone permission:', err);
    return false;
  }
};

/**
 * Request all required permissions for video/voice calls
 */
export const requestCallPermissions = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'android') {
      const audioGranted = await requestAndroidMicPermission();

      // Also request camera permission if needed for video calls
      const cameraGranted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'This app needs access to your camera for video calls.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );

      const audioOk = (audioGranted as any) === PermissionsAndroid.RESULTS.GRANTED;
      const cameraOk = (cameraGranted as any) === PermissionsAndroid.RESULTS.GRANTED;
      return audioOk && cameraOk;
    }
    return true;
  } catch (err) {
    console.error('Error requesting call permissions:', err);
    return false;
  }
};
