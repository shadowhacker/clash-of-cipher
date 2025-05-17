import { useRemoteConfig } from '../hooks/useRemoteConfig';
import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';

interface HowToPlayGuideProps {
  open: boolean;
  onClose: () => void;
  isFirstTime?: boolean;
}

const HowToPlayGuide: React.FC<HowToPlayGuideProps> = ({ open, onClose, isFirstTime = false }) => {
  const isMobile = useIsMobile();
  const { config, loading } = useRemoteConfig();
  const rules = config?.rules_text || [
    '1. Watch the symbols and remember their order.',
    '2. Tap the symbols in the same order.',
    '3. Get it right to go to the next round!'
  ];

  const content = (
    <div className="space-y-6 py-4 px-1" style={{ fontFamily: 'Hind Madurai, sans-serif', fontWeight: 400 }}>
      <div>
        <h3 className="font-bold text-xl mb-4 text-center text-primary">How to Play</h3>
        <div className="space-y-5">
          {loading ? (
            <div className="text-amber-900">Loading rules...</div>
          ) : (
            <ul className="text-base text-amber-900 space-y-2">
              {rules.map((rule: string, idx: number) => (
                <li key={idx}>{rule}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onClose}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>How to Play</DrawerTitle>
          </DrawerHeader>
          {content}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="max-w-md">
        <SheetHeader>
          <SheetTitle>How to Play</SheetTitle>
        </SheetHeader>
        {content}
      </SheetContent>
    </Sheet>
  );
};

export default HowToPlayGuide;
