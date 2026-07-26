import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

import { isApiBaseUrlConfigured } from './config/env';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>iThinka Vision</Text>
      <Text style={styles.subtitle}>FAZ 0 — proje temeli hazır (SDK 54)</Text>
      <Text style={styles.status}>
        {isApiBaseUrlConfigured ? 'API adresi yapılandırıldı' : 'API adresi tanımlı değil (.env)'}
      </Text>
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
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    color: '#444',
  },
  status: {
    marginTop: 16,
    fontSize: 14,
    color: '#666',
  },
});
