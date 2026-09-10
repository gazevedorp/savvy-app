import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import FAB from '@/components/ui/FAB';
import AddTypeSheet from '@/components/ui/AddTypeSheet';
import { LinkType } from '@/types';

interface AddLinkButtonProps {
  visible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
}

export default function AddLinkButton({
  visible,
  onVisibleChange,
}: AddLinkButtonProps) {
  const router = useRouter();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = visible !== undefined;
  const open = isControlled ? visible : uncontrolledOpen;

  const setOpen = (next: boolean) => {
    if (!isControlled) setUncontrolledOpen(next);
    onVisibleChange?.(next);
  };

  const handleSelect = (type: LinkType) => {
    setOpen(false);
    router.push({ pathname: '/share', params: { type } });
  };

  return (
    <>
      <FAB onPress={() => setOpen(true)} accessibilityLabel="Adicionar item" />
      <AddTypeSheet
        visible={open}
        onClose={() => setOpen(false)}
        onSelect={handleSelect}
      />
    </>
  );
}
