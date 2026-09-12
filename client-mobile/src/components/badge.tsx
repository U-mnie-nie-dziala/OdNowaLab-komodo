import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

type BadgeTone = 'positive' | 'neutral';

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: BadgeTone }) {
  return (
    <View style={[styles.badge, tone === 'positive' ? styles.positive : styles.neutral]}>
      <ThemedText type="small" style={tone === 'positive' ? styles.positiveText : undefined}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: Spacing.four,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    alignSelf: 'flex-start',
  },
  positive: {
    backgroundColor: '#1e8e5a22',
  },
  positiveText: {
    color: '#1e8e5a',
  },
  neutral: {
    backgroundColor: '#8888881f',
  },
});
