import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet } from 'react-native';

import { ApiError } from '@/api/client';
import { Card } from '@/components/card';
import { LabeledInput } from '@/components/labeled-input';
import { PrimaryButton } from '@/components/primary-button';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { useSession } from '@/context/session-context';

const EMAIL_PATTERN = /\S+@\S+\.\S+/;

export default function RegisterScreen() {
  const { register } = useSession();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    if (!EMAIL_PATTERN.test(email.trim())) {
      return 'Podaj poprawny adres email.';
    }
    if (password.length < 8) {
      return 'Hasło musi mieć co najmniej 8 znaków.';
    }
    if (!name.trim() || name.trim().length > 20) {
      return 'Imię jest wymagane i może mieć maksymalnie 20 znaków.';
    }
    if (!surname.trim() || surname.trim().length > 20) {
      return 'Nazwisko jest wymagane i może mieć maksymalnie 20 znaków.';
    }
    if (phoneNumber.trim() && !/^\d{9}$/.test(phoneNumber.trim())) {
      return 'Numer telefonu musi składać się z 9 cyfr.';
    }
    return null;
  };

  const handleRegister = async () => {
    const validationError = validate();
    if (validationError) {
      Alert.alert('Sprawdź dane', validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      const resp = await register({
        email: email.trim(),
        password,
        name: name.trim(),
        surname: surname.trim(),
        phoneNumber: phoneNumber.trim() ? Number(phoneNumber.trim()) : undefined,
      });
      router.replace({ pathname: '/(auth)/confirm', params: { email: resp.email } });
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        Alert.alert('Konto już istnieje', error.message);
      } else {
        Alert.alert('Nie udało się zarejestrować', error instanceof ApiError ? error.message : 'Spróbuj ponownie później.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen>
      <ThemedText type="pageHeader">Zarejestruj się</ThemedText>

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
        <LabeledInput label="Imię" value={name} onChangeText={setName} autoCapitalize="words" />
        <LabeledInput label="Nazwisko" value={surname} onChangeText={setSurname} autoCapitalize="words" />
        <LabeledInput
          label="Numer telefonu (opcjonalnie)"
          value={phoneNumber}
          onChangeText={(text) => setPhoneNumber(text.replace(/[^0-9]/g, ''))}
          keyboardType="number-pad"
          maxLength={9}
        />
        <PrimaryButton label="Zarejestruj się" onPress={handleRegister} loading={isSubmitting} />
      </Card>

      <Pressable onPress={() => router.push('/(auth)/login')} style={styles.linkRow}>
        <ThemedText type="small" themeColor="textSecondary">
          Masz już konto?{' '}
        </ThemedText>
        <ThemedText type="linkPrimary">Zaloguj się</ThemedText>
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
