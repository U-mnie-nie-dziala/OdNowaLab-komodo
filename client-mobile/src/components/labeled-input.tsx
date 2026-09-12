import { useState } from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Brand, Neutral, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function LabeledInput({ label, style, onFocus, onBlur, ...rest }: TextInputProps & { label: string }) {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <TextInput
        placeholderTextColor={Neutral[400]}
        onFocus={(event) => {
          setIsFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setIsFocused(false);
          onBlur?.(event);
        }}
        style={[
          styles.input,
          { color: theme.text, backgroundColor: theme.backgroundElement },
          isFocused && styles.inputFocused,
          style,
        ]}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  input: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Neutral[200],
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  inputFocused: {
    borderColor: Brand[400],
  },
});
