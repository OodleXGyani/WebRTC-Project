import { useRef, useState } from 'react';
import { Alert } from 'react-native';
import { MediaStream } from 'react-native-webrtc';

import {
  createPeerConnection,
  createOffer,
  createAnswer,
  setRemoteAnswer,
  addIceCandidate,
  closePeerConnection,
} from '../webrtc/peer';

import { getLocalStream, stopLocalStream } from '../webrtc/media';

type CallState = 'idle' | 'calling' | 'connected' | 'ended';

export const useCall = () => {
  const [callState, setCallState] = useState<CallState>('idle');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const [offer, setOffer] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [iceCandidates, setIceCandidates] = useState<string[]>([]);

  /* --------------------------------------------------
     START CALL (Caller) - Step 1
     - Creates Peer Connection
     - Creates Offer
  -------------------------------------------------- */
  const startCall = async () => {
    try {
      setCallState('calling');
      setIceCandidates([]);
      setOffer(null);
      setAnswer(null);

      console.log('getting local stream');
      const stream = await getLocalStream(true);
      console.log('got local stream', stream?.id);
      setLocalStream(stream);

      console.log('creating peer connection');
      createPeerConnection(
        stream,
        candidate => {
          if (candidate) {
            setIceCandidates(prev => [...prev, JSON.stringify(candidate)]);
          }
        },
        remoteStream => {
          setRemoteStream(remoteStream);
          setCallState('connected');
        }
      );

      console.log('creating offer');
      const generatedOffer = await createOffer();
      console.log('offer created', generatedOffer);
      if (generatedOffer) {
        setOffer(JSON.stringify(generatedOffer));
      }
    } catch (error: any) {
      console.error('Start call failed:', error);
      Alert.alert('Error', 'Failed to start call: ' + error.message);
      setCallState('idle');
    }
  };

  /* --------------------------------------------------
     ACCEPT OFFER (Receiver) - Step 2
     - Creates Peer Connection
     - Accepts Remote Offer
     - Creates Answer
  -------------------------------------------------- */
  const acceptOffer = async (remoteOfferStr: string) => {
    try {
      console.log('Accepting offer...');
      setCallState('calling');
      setIceCandidates([]);
      setOffer(remoteOfferStr); // Store what we received

      const stream = await getLocalStream(true);
      setLocalStream(stream);

      createPeerConnection(
        stream,
        candidate => {
          if (candidate) {
            setIceCandidates(prev => [...prev, JSON.stringify(candidate)]);
          }
        },
        remoteStream => {
          setRemoteStream(remoteStream);
          setCallState('connected');
        }
      );

      const remoteOffer = JSON.parse(remoteOfferStr);
      const generatedAnswer = await createAnswer(remoteOffer);

      if (generatedAnswer) {
        setAnswer(JSON.stringify(generatedAnswer));
      }
    } catch (error: any) {
      console.error('Error accepting offer:', error);
      Alert.alert('Error', 'Failed to accept offer: ' + error.message);
      // setCallState('idle'); // Optional: reset on error
    }
  };

  /* --------------------------------------------------
     APPLY ANSWER (Caller) - Step 3
     - Caller receives Answer from Receiver
  -------------------------------------------------- */
  const applyAnswer = async (remoteAnswerStr: string) => {
    try {
      const remoteAnswer = JSON.parse(remoteAnswerStr);
      await setRemoteAnswer(remoteAnswer);
      setAnswer(remoteAnswerStr); // Store what we accepted
      // If we are connected, state will update via ontrack, but we can also set connected here if track already arrived? 
      // Safe to rely on track but sometimes track arrives earlier. 
      // Let's assume ontrack sets connected.
    } catch (error) {
      console.error('Error applying answer:', error);
    }
  };

  /* --------------------------------------------------
     ADD ICE CANDIDATE - Step 4
  -------------------------------------------------- */
  const addRemoteIceCandidate = async (candidateStr: string) => {
    try {
      const candidate = JSON.parse(candidateStr);
      await addIceCandidate(candidate);
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  };

  /* --------------------------------------------------
     END CALL
  -------------------------------------------------- */
  const endCall = () => {
    closePeerConnection();
    stopLocalStream();

    setCallState('idle');
    setLocalStream(null);
    setRemoteStream(null);
    setOffer(null);
    setAnswer(null);
    setIceCandidates([]);
  };

  return {
    callState,
    localStream,
    remoteStream,
    offer,
    answer,
    iceCandidates,
    startCall,
    acceptOffer,
    applyAnswer,
    addRemoteIceCandidate,
    endCall,
  };
};
