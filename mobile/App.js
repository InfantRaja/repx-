import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  BackHandler,
  Modal,
  Platform,
  SafeAreaView,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEFAULT_SERVER_URL = 'http://10.102.99.107:5173';
const STORAGE_KEY = 'repx_mobile_server_url';

export default function App() {
  const [serverUrl, setServerUrl] = useState(DEFAULT_SERVER_URL);
  const [inputUrl, setInputUrl] = useState(DEFAULT_SERVER_URL);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorDetails, setErrorDetails] = useState('');
  const [canGoBack, setCanGoBack] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [webKey, setWebKey] = useState(1);

  const webViewRef = useRef(null);

  // Load saved server URL on initial mount
  useEffect(() => {
    async function loadSavedUrl() {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          setServerUrl(saved);
          setInputUrl(saved);
        }
      } catch (e) {
        console.warn('Failed to load saved server URL:', e);
      }
    }
    loadSavedUrl();
  }, []);

  // Handle Android hardware back button
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const onBackPress = () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true; // prevent app from closing
      }
      return false; // let system exit
    };

    const backSubscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backSubscription.remove();
  }, [canGoBack]);

  const handleSaveUrl = async (newUrl) => {
    let formatted = newUrl.trim();
    if (!formatted) return;

    // Automatically add https:// if user didn't type http:// or https://
    if (!/^https?:\/\//i.test(formatted)) {
      formatted = `https://${formatted}`;
    }

    try {
      await AsyncStorage.setItem(STORAGE_KEY, formatted);
    } catch (e) {
      console.warn('Failed to save server URL:', e);
    }

    setServerUrl(formatted);
    setInputUrl(formatted);
    setIsSettingsOpen(false);
    setHasError(false);
    setIsLoading(true);
    setWebKey((k) => k + 1);
  };

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    setWebKey((k) => k + 1);
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" backgroundColor="#FFFFFF" />

        {/* Floating Quick Settings / Info Pill */}
        <View style={styles.topToolbar}>
          <TouchableOpacity
            style={styles.settingsBadge}
            onPress={() => {
              setInputUrl(serverUrl);
              setIsSettingsOpen(true);
            }}
            activeOpacity={0.8}
          >
            <View style={styles.onlineDot} />
            <Text style={styles.settingsBadgeText} numberOfLines={1}>
              {serverUrl.replace(/^https?:\/\//, '')}
            </Text>
            <Text style={styles.settingsIconText}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Main Application WebView */}
        <View style={styles.webviewWrapper}>
          <WebView
            key={webKey}
            ref={webViewRef}
            source={{ uri: serverUrl }}
            style={styles.webview}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            allowsInlineMediaPlayback={true}
            originWhitelist={['*']}
            mixedContentMode="always"
            allowsBackForwardNavigationGestures={true}
            onNavigationStateChange={(navState) => {
              setCanGoBack(navState.canGoBack);
            }}
            onLoadStart={() => {
              setIsLoading(true);
              setHasError(false);
            }}
            onLoadEnd={() => {
              setIsLoading(false);
            }}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              setIsLoading(false);
              setHasError(true);
              setErrorDetails(nativeEvent.description || 'Connection failed');
            }}
            onHttpError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              if (nativeEvent.statusCode >= 500) {
                setHasError(true);
                setErrorDetails(`Server error: HTTP ${nativeEvent.statusCode}`);
              }
            }}
          />

          {/* Loading Overlay */}
          {isLoading && !hasError && (
            <View style={styles.loadingContainer}>
              <View style={styles.logoBadge}>
                <Text style={styles.logoBadgeText}>REPX</Text>
              </View>
              <ActivityIndicator size="large" color="#0084FF" style={{ marginTop: 20 }} />
              <Text style={styles.loadingText}>Connecting to REPX Fitness...</Text>
              <Text style={styles.loadingSubtext}>{serverUrl}</Text>
            </View>
          )}

          {/* Error / Offline State */}
          {hasError && (
            <View style={styles.errorContainer}>
              <View style={styles.errorCard}>
                <Text style={styles.errorIcon}>📡</Text>
                <Text style={styles.errorTitle}>Cannot Connect to Server</Text>
                <Text style={styles.errorSubtitle}>
                  Unable to reach <Text style={styles.codeText}>{serverUrl}</Text>
                </Text>
                {errorDetails ? (
                  <Text style={styles.errorDetailText}>{errorDetails}</Text>
                ) : null}

                <View style={styles.tipsList}>
                  <Text style={styles.tipItem}>
                    1. Verify your laptop & phone are on the{' '}
                    <Text style={styles.tipHighlight}>same Wi-Fi network</Text>.
                  </Text>
                  <Text style={styles.tipItem}>
                    2. Check if{' '}
                    <Text style={styles.tipHighlight}>npm run dev</Text> is running on your laptop.
                  </Text>
                  <Text style={styles.tipItem}>
                    3. If your laptop IP changed, tap below to update it.
                  </Text>
                </View>

                <View style={styles.actionButtonsRow}>
                  <TouchableOpacity
                    style={[styles.btn, styles.btnPrimary]}
                    onPress={handleRetry}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.btnPrimaryText}>🔄 Retry</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.btn, styles.btnSecondary]}
                    onPress={() => {
                      setInputUrl(serverUrl);
                      setIsSettingsOpen(true);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.btnSecondaryText}>⚙️ Change IP</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Server IP Settings Modal */}
        <Modal
          visible={isSettingsOpen}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsSettingsOpen(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalBackdrop}
          >
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Server Connection</Text>
                <TouchableOpacity
                  onPress={() => setIsSettingsOpen(false)}
                  style={styles.closeBtn}
                >
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.modalDescription}>
                Enter your laptop's local IP address and port where the Vite client is running:
              </Text>

              <TextInput
                style={styles.input}
                value={inputUrl}
                onChangeText={setInputUrl}
                placeholder="http://192.168.1.X:5173"
                placeholderTextColor="#6B7280"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />

              {/* Quick Presets */}
              <Text style={styles.presetsLabel}>Quick Presets:</Text>
              <View style={styles.presetsContainer}>
                <TouchableOpacity
                  style={styles.presetChip}
                  onPress={() => setInputUrl(DEFAULT_SERVER_URL)}
                >
                  <Text style={styles.presetChipText}>Laptop Wi-Fi ({DEFAULT_SERVER_URL})</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.presetChip}
                  onPress={() => setInputUrl('http://localhost:5173')}
                >
                  <Text style={styles.presetChipText}>localhost:5173 (Simulator)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.presetChip}
                  onPress={() => setInputUrl('http://10.0.2.2:5173')}
                >
                  <Text style={styles.presetChipText}>10.0.2.2:5173 (Android Emulator)</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={[styles.btn, styles.btnSecondary, { flex: 1, marginRight: 8 }]}
                  onPress={() => setIsSettingsOpen(false)}
                >
                  <Text style={styles.btnSecondaryText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btn, styles.btnPrimary, { flex: 1 }]}
                  onPress={() => handleSaveUrl(inputUrl)}
                >
                  <Text style={styles.btnPrimaryText}>Save & Connect</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topToolbar: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  settingsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    maxWidth: '85%',
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  settingsBadgeText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '500',
    flexShrink: 1,
  },
  settingsIconText: {
    fontSize: 12,
    marginLeft: 6,
  },
  webviewWrapper: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  webview: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    zIndex: 10,
  },
  logoBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  logoBadgeText: {
    color: '#0F172A',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 2,
  },
  loadingText: {
    marginTop: 18,
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingSubtext: {
    marginTop: 6,
    color: '#64748B',
    fontSize: 12,
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    zIndex: 20,
  },
  errorCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  errorIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  errorTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  errorSubtitle: {
    color: '#64748B',
    fontSize: 13,
    marginBottom: 10,
    textAlign: 'center',
  },
  codeText: {
    color: '#0084FF',
    fontWeight: '600',
  },
  errorDetailText: {
    color: '#DC2626',
    fontSize: 12,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    marginBottom: 14,
    textAlign: 'center',
  },
  tipsList: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  tipItem: {
    color: '#475569',
    fontSize: 13,
    lineHeight: 18,
    marginVertical: 3,
  },
  tipHighlight: {
    color: '#0084FF',
    fontWeight: '600',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: {
    backgroundColor: '#0084FF',
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  btnSecondary: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  btnSecondaryText: {
    color: '#334155',
    fontWeight: '600',
    fontSize: 14,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 6,
  },
  closeBtnText: {
    color: '#64748B',
    fontSize: 16,
  },
  modalDescription: {
    color: '#64748B',
    fontSize: 13,
    marginBottom: 12,
    lineHeight: 18,
  },
  input: {
    backgroundColor: '#F8FAFC',
    color: '#0F172A',
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginBottom: 14,
  },
  presetsLabel: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  presetsContainer: {
    gap: 8,
    marginBottom: 18,
  },
  presetChip: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  presetChipText: {
    color: '#0084FF',
    fontSize: 13,
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    marginTop: 6,
  },
});
