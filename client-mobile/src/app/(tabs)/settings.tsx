import { useState } from 'react';
import { Alert, StyleSheet, Switch } from 'react-native';

import { ApiError } from '@/api/client';
import { Card, CardRow } from '@/components/card';
import { LabeledInput } from '@/components/labeled-input';
import { PrimaryButton } from '@/components/primary-button';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { useSession } from '@/context/session-context';

export default function SettingsScreen() {
  const { user, hasResidentCard, updateUser, setHasResidentCard } = useSession();

  const [name, setName] = useState(user?.name ?? '');
  const [surname, setSurname] = useState(user?.surname ?? '');
  const [phoneNumber, setPhoneNumber] = useState(String(user?.phoneNumber ?? ''));
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  if (!user) return null;

  const saveProfile = async () => {
    if (!name.trim() || !surname.trim() || !/^\d{9}$/.test(phoneNumber.trim())) {
      Alert.alert('Sprawdź dane', 'Imię, nazwisko i 9-cyfrowy numer telefonu są wymagane.');
      return;
    }
    setIsSavingProfile(true);
    try {
      await updateUser({
        name: name.trim(),
        surname: surname.trim(),
        phoneNumber: Number(phoneNumber.trim()),
      });
      Alert.alert('Zapisano', 'Dane profilu zostały zaktualizowane.');
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Spróbuj ponownie później.';
      Alert.alert('Nie udało się zapisać', message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <Screen>
      <ThemedText type="title" style={styles.title}>
        Ustawienia
      </ThemedText>

      <Card>
        <ThemedText type="smallBold">Profil</ThemedText>
        <LabeledInput label="Imię" value={name} onChangeText={setName} autoCapitalize="words" />
        <LabeledInput label="Nazwisko" value={surname} onChangeText={setSurname} autoCapitalize="words" />
        <LabeledInput
          label="Numer telefonu"
          value={phoneNumber}
          onChangeText={(text) => setPhoneNumber(text.replace(/[^0-9]/g, ''))}
          keyboardType="number-pad"
          maxLength={9}
        />
        <PrimaryButton label="Zapisz profil" onPress={saveProfile} loading={isSavingProfile} />
      </Card>

      <Card>
        <CardRow>
          <ThemedText type="smallBold" style={styles.flexText}>
            Wołomińska Karta Mieszkańca
          </ThemedText>
          <Switch value={hasResidentCard} onValueChange={setHasResidentCard} />
        </CardRow>
        <ThemedText type="small" themeColor="textSecondary">
          Posiadacze karty mieszkańca otrzymują mnożnik x1.15 do zdobywanych punktów.
        </ThemedText>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    lineHeight: 34,
  },
  flexText: {
    flex: 1,
  },
});
