import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { ApiError } from '@/api/client';
import { Card } from '@/components/card';
import { LabeledInput } from '@/components/labeled-input';
import { PrimaryButton } from '@/components/primary-button';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { useSession } from '@/context/session-context';

export default function ConfirmScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const { confirmRegistration, resendCode } = useSession();

  const [code, setCode] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleConfirm = async () => {
    if (!code.trim()) {
      Alert.alert('Sprawdź dane', 'Podaj kod potwierdzający wysłany na Twój email.');
      return;
    }

    setIsConfirming(true);
    try {
      await confirmRegistration(email, code.trim());
      Alert.alert('Konto potwierdzone', 'Możesz się teraz zalogować.', [
        { text: 'OK', onPress: () => router.replace({ pathname: '/(auth)/login', params: { email } }) },
      ]);
    } catch (error) {
      Alert.alert('Nieprawidłowy kod', error instanceof ApiError ? error.message : 'Spróbuj ponownie później.');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await resendCode(email);
      Alert.alert('Wysłano', 'Nowy kod został wysłany na Twój email.');
    } catch (error) {
      Alert.alert('Błąd', error instanceof ApiError ? error.message : 'Spróbuj ponownie później.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Screen>
      <ThemedText type="pageHeader">Potwierdź email</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        Wysłaliśmy kod potwierdzający na podany adres email.
      </ThemedText>

      <Card>
        <LabeledInput label="Email" value={email} editable={false} />
        <LabeledInput
          label="Kod potwierdzający"
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
          autoCapitalize="none"
        />
        <PrimaryButton label="Potwierdź" onPress={handleConfirm} loading={isConfirming} />
        <PrimaryButton
          label="Wyślij kod ponownie"
          onPress={handleResend}
          loading={isResending}
          variant="secondary"
        />
      </Card>
    </Screen>
  );
}
