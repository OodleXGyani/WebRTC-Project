import React, { useState } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { RTCView } from 'react-native-webrtc';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Clipboard from '@react-native-clipboard/clipboard';
import { RootStackParamList } from '../navigation/AppNavigation';
import { useCall } from '../hooks/useCall';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<RootStackParamList, 'Call'>;

const CallScreen: React.FC<Props> = ({ route, navigation }) => {
  const { callerId, isCaller } = route.params; // receiverId removed as it's not strictly needed for manual finding
  const {
    startCall,
    acceptOffer,
    applyAnswer,
    addRemoteIceCandidate,
    endCall,
    callState,
    localStream,
    remoteStream,
    offer,
    answer,
    iceCandidates,
  } = useCall();

  const [remoteSdpInput, setRemoteSdpInput] = useState('');
  const [remoteIceInput, setRemoteIceInput] = useState('');

  /* -----------------------------------------
     Copy / Paste Helpers
  ----------------------------------------- */
  const copyToClipboard = (label: string, text: string) => {
    Clipboard.setString(text);
    Alert.alert('Copied', `${label} copied to clipboard!`);
  };

  const handleStartCall = () => {
    startCall();
  };

  const handleCreateAnswer = () => {
    if (!remoteSdpInput) {
      Alert.alert('Error', 'Please paste the Offer first');
      return;
    }
    acceptOffer(remoteSdpInput);
  };

  const handleApplyAnswer = () => {
    if (!remoteSdpInput) {
      Alert.alert('Error', 'Please paste the Answer first');
      return;
    }
    applyAnswer(remoteSdpInput);
  };

  const handleAddIce = () => {
    if (!remoteIceInput) return;
    addRemoteIceCandidate(remoteIceInput);
    setRemoteIceInput('');
    Alert.alert('Success', 'ICE Candidate added');
  };

  const handleEndCall = () => {
    endCall();
    navigation.popToTop();
  };

  /* -----------------------------------------
     Render Steps
  ----------------------------------------- */
  const renderCallerSteps = () => (
    <View style={styles.stepsContainer}>
      <Text style={styles.stepTitle}>Caller Steps (1 & 3)</Text>

      {/* Step 1: Create Offer */}
      <View style={styles.stepBlock}>
        <Text style={styles.stepHeader}>1. Create Offer</Text>
        {!offer ? (
          <Button title="Generate Offer" onPress={handleStartCall} disabled={callState !== 'idle'} />
        ) : (
          <View>
            <Text style={styles.label}>Your Offer (Copy this send to Receiver):</Text>
            <TextInput style={styles.readOnlyInput} value={offer} editable={false} multiline />
            <Button title="Copy Offer" onPress={() => copyToClipboard('Offer', offer)} />
          </View>
        )}
      </View>

      {/* Step 3: Apply Answer */}
      {offer && (
        <View style={styles.stepBlock}>
          <Text style={styles.stepHeader}>3. Apply Answer</Text>
          <Text style={styles.label}>Paste Answer from Receiver:</Text>
          <TextInput
            style={styles.textInput}
            value={remoteSdpInput}
            onChangeText={setRemoteSdpInput}
            placeholder="Paste Remote Answer here"
            multiline
          />
          <Button title="Apply Answer" onPress={handleApplyAnswer} disabled={!remoteSdpInput} />
        </View>
      )}
    </View>
  );

  const renderReceiverSteps = () => (
    <View style={styles.stepsContainer}>
      <Text style={styles.stepTitle}>Receiver Steps (2)</Text>

      {/* Step 2: Accept Offer & Create Answer */}
      <View style={styles.stepBlock}>
        <Text style={styles.stepHeader}>2. Accept Offer & Create Answer</Text>
        {!answer ? (
          <>
            <Text style={styles.label}>Paste Offer from Caller:</Text>
            <TextInput
              style={styles.textInput}
              value={remoteSdpInput}
              onChangeText={setRemoteSdpInput}
              placeholder="Paste Remote Offer here"
              multiline
            />
            <Button title="Create Answer" onPress={handleCreateAnswer} disabled={!remoteSdpInput} />
          </>
        ) : (
          <View>
            <Text style={styles.label}>Your Answer (Copy this send to Caller):</Text>
            <TextInput style={styles.readOnlyInput} value={answer} editable={false} multiline />
            <Button title="Copy Answer" onPress={() => copyToClipboard('Answer', answer)} />
          </View>
        )}
      </View>
    </View>
  );

  const renderIceSection = () => (
    <View style={styles.stepBlock}>
      <Text style={styles.stepHeader}>4. Exchange ICE Candidates (Optional)</Text>
      <Text style={styles.infoText}>If connection fails, manually exchange candidates.</Text>

      <Text style={styles.label}>Your Candidates:</Text>
      <TextInput
        style={[styles.readOnlyInput, { height: 60 }]}
        value={JSON.stringify(iceCandidates)}
        editable={false}
        multiline
      />
      <Button title="Copy Candidates" onPress={() => copyToClipboard('ICE Candidates', JSON.stringify(iceCandidates))} />

      <View style={{ height: 10 }} />

      <Text style={styles.label}>Paste Remote Candidate:</Text>
      <TextInput
        style={styles.textInput}
        value={remoteIceInput}
        onChangeText={setRemoteIceInput}
        placeholder="Paste single candidate JSON"
        multiline
      />
      <Button title="Add Candidate" onPress={handleAddIce} disabled={!remoteIceInput} />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.videoContainer}>
        {/* Remote Video (Full) */}
        {remoteStream && (
          <RTCView
            streamURL={remoteStream.toURL()}
            style={styles.remoteVideo}
            objectFit="cover"
          />
        )}

        {/* Local Video (Overlay) */}
        {localStream && (
          <RTCView
            streamURL={localStream.toURL()}
            style={styles.localVideo}
            objectFit="cover"
            zOrder={1}
          />
        )}
      </View>

      <ScrollView style={styles.controlsContainer} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Manual Signaling</Text>
        <Text style={styles.roleText}>{isCaller ? 'You are the Caller' : 'You are the Receiver'}</Text>

        {isCaller ? renderCallerSteps() : renderReceiverSteps()}

        {renderIceSection()}

        <View style={styles.footer}>
          <Button title="End Call" onPress={handleEndCall} color="#FF3B30" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CallScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  videoContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
    // If video is present, it will cover background. 
    // We make sure ScrollView has transparent background where needed? 
    // Actually if we want to see video, we should probably hide controls or make them semi-transparent.
    // For manual signaling, we need controls VISIBLE.
    // Once connected, maybe user can minimize controls? 
    // For now, I'll keep controls in a ScrollView that sits 'over' the video but user can scroll.
  },
  remoteVideo: {
    width: '100%',
    height: '100%',
  },
  localVideo: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 100,
    height: 150,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#FFF',
  },
  controlsContainer: {
    flex: 1,
    backgroundColor: 'rgba(245, 247, 250, 0.85)', // Semi-transparent to see video behind if needed
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 50,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 5,
    color: '#333',
  },
  roleText: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
    color: '#555',
    fontWeight: '600',
  },
  stepsContainer: {
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#007AFF',
  },
  stepBlock: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  stepHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    color: '#666',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 10,
    minHeight: 60,
    marginBottom: 10,
    backgroundColor: '#FAFAFA',
    textAlignVertical: 'top',
  },
  readOnlyInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 10,
    minHeight: 60,
    marginBottom: 10,
    backgroundColor: '#F0F0F0',
    color: '#555',
    textAlignVertical: 'top',
  },
  infoText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  footer: {
    marginTop: 20,
  },
});
