import React, { useState } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigation';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [callerId, setCallerId] = useState('user-1');
  const [receiverId, setReceiverId] = useState('user-2');
  const [loading, setLoading] = useState(false);

  const handleStartCall = async () => {
    const from = callerId.trim();
    const to = receiverId.trim();

    if (!from || !to) {
      Alert.alert('Validation Error', 'Please enter both user IDs');
      return;
    }

    if (from === to) {
      Alert.alert('Invalid Call', 'Caller and receiver cannot be the same');
      return;
    }

    setLoading(true);

    try {
      navigation.navigate('Call', {
        callerId: from,
        receiverId: to,
        isCaller: true,
      });
    } catch (error) {
      Alert.alert(
        'Error',
        'Unable to start call: ' + (error as Error).message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>WebRTC Voice Call</Text>
        <Text style={styles.subtitle}>
          Enter your ID and the receiver's ID to start a call
        </Text>

        {/* Caller ID */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Your User ID</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. user-1"
            placeholderTextColor="#999"
            value={callerId}
            onChangeText={setCallerId}
            editable={!loading}
            autoCapitalize="none"
          />
        </View>

        {/* Receiver ID */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Receiver User ID</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. user-2"
            placeholderTextColor="#999"
            value={receiverId}
            onChangeText={setReceiverId}
            editable={!loading}
            autoCapitalize="none"
          />
        </View>

        {/* Start Call */}
        <View style={styles.buttonContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#007AFF" />
          ) : (
            <Button
              title="Start Call"
              onPress={handleStartCall}
              color="#007AFF"
            />
          )}
        </View>

        {/* Tips */}
        <Text style={styles.infoText}>
          💡 Tips:
          {'\n'}• One device is Caller, one is Receiver
          {'\n'}• Manually copy Offer/Answer between devices
          {'\n'}• Ensure both are on same Wi-Fi (usually)
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
  },
  buttonContainer: {
    width: '100%',
    marginTop: 20,
    marginBottom: 30,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    backgroundColor: '#e8f4f8',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    marginTop: 20,
  },
});
