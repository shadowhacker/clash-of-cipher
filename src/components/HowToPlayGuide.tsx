import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface HowToPlayGuideProps {
  open: boolean;
  onClose: () => void;
}

const HowToPlayGuide: React.FC<HowToPlayGuideProps> = ({ open, onClose }) => {
  const isMobile = useIsMobile();

  const content = (
    <div className="space-y-6 py-4">
      <div>
        <h3 className="font-semibold text-lg mb-2">How to Play</h3>
        <ul className="space-y-3 list-disc pl-5">
          <li>
            <span className="font-medium">Memorise the symbols</span>
            <p className="text-sm text-muted-foreground">Symbols flash briefly. Focus and remember their order!</p>
          </li>
          <li>
            <span className="font-medium">Repeat the sequence</span>
            <p className="text-sm text-muted-foreground">Tap the symbols in the same order within 10 seconds.</p>
          </li>
          <li>
            <span className="font-medium">Earn points each round</span>
            <p className="text-sm text-muted-foreground">
              – Higher rounds = bigger base points<br />
              – Finish faster = x1–x2 speed bonus<br />
              – Keep a perfect streak = +25% per flawless round
            </p>
          </li>
          <li>
            <span className="font-medium">Watch your lives</span>
            <p className="text-sm text-muted-foreground">You get 2 lives. A mistake or timeout costs one life.</p>
          </li>
          <li>
            <span className="font-medium">Collect gems</span>
            <p className="text-sm text-muted-foreground">Gems drop every 10 rounds. Jackpot every 20!</p>
          </li>
          <li>
            <span className="font-medium">Set records</span>
            <p className="text-sm text-muted-foreground">Share your score and climb the Hall of Heroes.</p>
          </li>
        </ul>
      </div>
      <div className="border-t pt-4">
        <p className="text-center text-muted-foreground">
          Challenge yourself to remember longer sequences<br />and see how far you can go!
        </p>
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
      <SheetContent side="right" className="w-[280px]">
        <SheetHeader>
          <SheetTitle>How to Play</SheetTitle>
        </SheetHeader>
        {content}
      </SheetContent>
    </Sheet>
  );
};

export default HowToPlayGuide;
