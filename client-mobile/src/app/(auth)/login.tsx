import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet } from 'react-native';

import { ApiError } from '@/api/client';
import { Card } from '@/components/card';
import { LabeledInput } from '@/components/labeled-input';
import { PrimaryButton } from '@/components/primary-button';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { useSession } from '@/context/session-context';

export default function LoginScreen() {
  const { email: initialEmail } = useLocalSearchParams<{ email?: string }>();
  const { login } = useSession();

  const [email, setEmail] = useState(initialEmail ?? '');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Sprawdź dane', 'Podaj email i hasło.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        Alert.alert('Błąd logowania', 'Nieprawidłowy email lub hasło.');
      } else if (error instanceof ApiError && error.status === 403) {
        Alert.alert(
          'Konto niepotwierdzone',
          'Potwierdź swój adres email, aby się zalogować.',
          [
            { text: 'Anuluj', style: 'cancel' },
            {
              text: 'Wprowadź kod',
              onPress: () => router.push({ pathname: '/(auth)/confirm', params: { email: email.trim() } }),
            },
          ]
        );
      } else {
        Alert.alert('Błąd', error instanceof ApiError ? error.message : 'Spróbuj ponownie później.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen>
      <ThemedText type="pageHeader">Zaloguj się</ThemedText>

      <Card>
        <LabeledInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
        />
        <LabeledInput label="Hasło" value={password} onChangeText={setPassword} secureTextEntry />
        <PrimaryButton label="Zaloguj się" onPress={handleLogin} loading={isSubmitting} />
      </Card>

      <Pressable onPress={() => router.push('/(auth)/register')} style={styles.linkRow}>
        <ThemedText type="small" themeColor="textSecondary">
          Nie masz konta?{' '}
        </ThemedText>
        <ThemedText type="linkPrimary">Zarejestruj się</ThemedText>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
});
