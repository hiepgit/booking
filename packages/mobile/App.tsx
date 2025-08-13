import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, Alert } from 'react-native';
import { api, saveTokens } from './src/lib/apiClient';
import { AuthLoginSchema, TokenPairSchema } from '@healthcare/shared/schemas';

export default function App() {
  const [status, setStatus] = useState<string>('');
  return (
    <View style={styles.container}>
      <Text>Open up App.tsx to start working on your app!</Text>
      <View style={{ height: 12 }} />
      <Button
        title="Test login"
        onPress={async () => {
          try {
            setStatus('Đang đăng nhập...');
            const body = AuthLoginSchema.parse({ email: 'demo@example.com', password: 'password123' });
            const resp = await api.post('/auth/login', body);
            const parsed = TokenPairSchema.parse(resp.data);
            await saveTokens(parsed.accessToken, parsed.refreshToken);
            setStatus('Login OK');
            Alert.alert('Success', 'Login OK');
          } catch (e: any) {
            const msg = e?.response?.data?.error?.message ?? e?.message ?? 'Error';
            console.log('Login error:', e?.response?.data ?? e);
            setStatus(`Login failed: ${msg}`);
            Alert.alert('Login failed', msg);
          }
        }}
      />
      <View style={{ height: 12 }} />
      <Text>{status}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
