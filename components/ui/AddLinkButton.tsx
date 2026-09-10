import React from 'react';
import { useRouter } from 'expo-router';
import FAB from '@/components/ui/FAB';

export default function AddLinkButton() {
  const router = useRouter();

  return (
    <FAB
      onPress={() => router.push('/share')}
      accessibilityLabel="Adicionar item"
    />
  );
}
