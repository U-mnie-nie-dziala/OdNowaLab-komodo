import { useRouter } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { StyleSheet, View } from 'react-native';

import { Badge } from '@/components/badge';
import { Card, CardRow } from '@/components/card';
import { PrimaryButton } from '@/components/primary-button';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { COINS_PER_ZLOTY, RESIDENT_CARD_MULTIPLIER } from '@/constants/config';
import { Fonts, Spacing } from '@/constants/theme';
import { useSession } from '@/context/session-context';
import { useTheme } from '@/hooks/use-theme';

export default function HomeScreen() {
  const { user, hasResidentCard } = useSession();
  const theme = useTheme();
  const router = useRouter();

  if (!user) return null;

  const qrPayload = JSON.stringify({ type: 'wolomin-blisko-user', userId: user.id });

  return (
    <Screen >
      <ThemedText type="pageHeader">Cześć, {user.name}!</ThemedText>

      <Card style={{ alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        <ThemedText type="small" themeColor="textSecondary">
          Twoje monety
        </ThemedText>
        <ThemedText type="title" style={styles.balance}>
          {user.coins} pkt
        </ThemedText>
        {hasResidentCard && (
          <Badge label={`Karta Mieszkańca: x${RESIDENT_CARD_MULTIPLIER} punktów`} tone="positive" />
        )}
      </Card>

      <Card style={styles.qrCard}>
        <ThemedText type="smallBold">Pokaż ten kod przy kasie</ThemedText>
        <QRCode value={qrPayload} size={180} backgroundColor={theme.backgroundElement} color={theme.text} />
        <ThemedText type="subtitle" style={styles.phone}>
          {user.phoneNumber}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
          Możesz też po prostu podać ten numer telefonu obsłudze u partnera programu.
        </ThemedText>
      </Card>

      <Card>
        <CardRow>
          <ThemedText type="smallBold">Jak działają punkty?</ThemedText>
        </CardRow>
        <ThemedText type="small" themeColor="textSecondary">
          1 zł wydane w sklepach ze strefy rewitalizacji to {COINS_PER_ZLOTY} punkty. Punkty
          naliczane są wyłącznie u przedsiębiorstw znajdujących się w strefie rewitalizacji.
        </ThemedText>
      </Card>

      <ThemedText type="smallBold">Skróty</ThemedText>
      <View style={styles.shortcuts}>
        <View style={styles.shortcutButton}>
          <PrimaryButton
            label="Zobacz oferty"
            variant="secondary"
            onPress={() => router.push('/offers')}
          />
        </View>
        <View style={styles.shortcutButton}>
          <PrimaryButton
            label="Firmy w programie"
            variant="secondary"
            onPress={() => router.push('/businesses')}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  balance: {
    fontFamily: Fonts.mono,
  },
  qrCard: {
    alignItems: 'center',
    alignSelf: 'center',
    // justifyContent: 'center',
    width: '100%',
    maxWidth: 300,
    paddingVertical: Spacing.four,
  },
  phone: {
    marginTop: Spacing.two,
    letterSpacing: 2,
  },
  center: {
    textAlign: 'center',
  },
  shortcuts: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  shortcutButton: {
    flex: 1,
  },
});
