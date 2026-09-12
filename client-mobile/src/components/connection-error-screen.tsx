import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { setApiBaseUrl } from '@/api/client';
import { Card } from '@/components/card';
import { LabeledInput } from '@/components/labeled-input';
import { PrimaryButton } from '@/components/primary-button';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';

type ConnectionErrorScreenProps = {
  message: string;
  apiBaseUrl: string;
  onRetry: () => Promise<void>;
};

export function ConnectionErrorScreen({ message, apiBaseUrl, onRetry }: ConnectionErrorScreenProps) {
  const [url, setUrl] = useState(apiBaseUrl);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSaveAndRetry = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      await setApiBaseUrl(url);
      await onRetry();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Nieprawidłowy adres.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Screen>
      <ThemedText type="title" style={styles.title}>
        Brak połączenia
      </ThemedText>
      <ThemedText type="default" themeColor="textSecondary">
        {message}
      </ThemedText>

      <Card>
        <ThemedText type="smallBold">Adres serwera</ThemedText>
        <LabeledInput
          label="np. http://192.168.1.50:8080"
          value={url}
          onChangeText={setUrl}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />
        {saveError && (
          <ThemedText type="small" style={styles.errorText}>
            {saveError}
          </ThemedText>
        )}
        <PrimaryButton label="Zapisz i spróbuj ponownie" onPress={handleSaveAndRetry} loading={isSaving} />
      </Card>

      <PrimaryButton label="Spróbuj ponownie" variant="secondary" onPress={onRetry} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    lineHeight: 34,
  },
  errorText: {
    color: '#e5484d',
  },
});
