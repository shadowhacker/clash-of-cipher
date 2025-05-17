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

  const content = (
    <div className="space-y-6 py-4 px-1">
      <div>
        <h3 className="font-bold text-xl mb-4 text-center text-primary">How to Play</h3>
        <div className="space-y-5">
          <div className="bg-primary/10 p-3 rounded-lg">
            <h4 className="font-bold mb-2">1. Watch</h4>
            <p>Symbols will flash on the screen one by one. Pay close attention!</p>
          </div>
          <div className="bg-primary/10 p-3 rounded-lg">
            <h4 className="font-bold mb-2">2. Memorize</h4>
            <p>Remember the order in which the symbols appear.</p>
          </div>
          <div className="bg-primary/10 p-3 rounded-lg">
            <h4 className="font-bold mb-2">3. Repeat</h4>
            <p>Tap the symbols in the <b>EXACT SAME ORDER</b> as you saw them.</p>
          </div>
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
