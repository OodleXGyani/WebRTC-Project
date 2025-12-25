import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  MediaStream,
} from 'react-native-webrtc';
import { ICE_SERVERS } from '../constants/config';

let peerConnection: RTCPeerConnection | null = null;

export const createPeerConnection = (
  localStream: MediaStream,
  onIceCandidate: (candidate: RTCIceCandidate) => void,
  onRemoteStream: (stream: MediaStream) => void
) => {
  try {
    console.log('Initializing PeerConnection with config:', ICE_SERVERS);
    peerConnection = new RTCPeerConnection(ICE_SERVERS);
    console.log('PeerConnection initialized');

    // Add local tracks
    const tracks = localStream.getTracks();
    console.log(`Adding ${tracks.length} local tracks`);
    tracks.forEach(track => {
      peerConnection?.addTrack(track, localStream);
    });

    // ICE candidates
    (peerConnection as any).onicecandidate = (event: any) => {
      if (event.candidate) {
        onIceCandidate(event.candidate);
      }
    };

    // Remote stream
    (peerConnection as any).ontrack = (event: any) => {
      console.log('Remote track received');
      onRemoteStream(event.streams[0]);
    };

    return peerConnection;
  } catch (error) {
    console.error('Failed to create PeerConnection:', error);
    throw error;
  }
};

export const createOffer = async () => {
  if (!peerConnection) return null;

  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);

  return offer;
};

export const createAnswer = async (offer: any) => {
  if (!peerConnection) return null;

  await peerConnection.setRemoteDescription(
    new RTCSessionDescription(offer)
  );

  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);

  return answer;
};

export const setRemoteAnswer = async (
  answer: any
) => {
  if (!peerConnection) return;

  await peerConnection.setRemoteDescription(
    new RTCSessionDescription(answer)
  );
};

export const addIceCandidate = async (
  candidate: any
) => {
  if (!peerConnection) return;

  await peerConnection.addIceCandidate(
    new RTCIceCandidate(candidate)
  );
};

export const closePeerConnection = () => {
  peerConnection?.close();
  peerConnection = null;
};
