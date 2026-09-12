import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Brand, Neutral, Radius, Spacing } from '@/constants/theme';

type BadgeTone = 'positive' | 'neutral';

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: BadgeTone }) {
  return (
    <View style={[styles.badge, tone === 'positive' ? styles.positive : styles.neutral]}>
      <ThemedText type="small" style={tone === 'positive' ? styles.positiveText : styles.neutralText}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    alignSelf: 'flex-start',
  },
  positive: {
    backgroundColor: Brand[100],
  },
  positiveText: {
    color: Brand[800],
  },
  neutral: {
    backgroundColor: Neutral[100],
  },
  neutralText: {
    color: Neutral[500],
  },
});
