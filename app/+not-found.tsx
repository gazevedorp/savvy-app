import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

export default function NotFoundScreen() {
  const { colors, typography, spacing } = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: 'Página não encontrada' }} />
      <View style={[styles.container, { backgroundColor: colors.background, padding: spacing.lg }]}>
        <Text style={[typography.title, { color: colors.text }]}>Esta tela não existe.</Text>
        <Link href="/" style={{ marginTop: spacing.md, paddingVertical: spacing.md }}>
          <Text style={[typography.label, { color: colors.primary }]}>Voltar ao início</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
