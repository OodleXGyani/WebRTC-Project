import { MediaStream, mediaDevices } from 'react-native-webrtc';
import { requestMicrophonePermission } from '../utils/permissions';

let localStream: MediaStream | null = null;

/**
 * Get local audio stream for the call
 * @param includeVideo - Whether to include video (false for audio-only)
 * @returns Local media stream
 */
export const getLocalStream = async (
  includeVideo: boolean = false
): Promise<MediaStream> => {
  try {
    // Request microphone permission
    await requestMicrophonePermission();

    const constraints: any = {
      audio: true,
      video: includeVideo
        ? {
            width: { ideal: 1280 },
            height: { ideal: 720 },
          }
        : false,
    };

    const stream = await mediaDevices.getUserMedia(constraints);
    localStream = stream;
    return stream;
  } catch (error) {
    console.error('Error getting local stream:', error);
    throw error;
  }
};

/**
 * Stop local audio/video stream
 */
export const stopLocalStream = () => {
  if (localStream) {
    localStream.getTracks().forEach(track => {
      track.stop();
    });
    localStream = null;
  }
};

/**
 * Get current local stream
 */
export const getLocalStreamInstance = (): MediaStream | null => {
  return localStream;
};
