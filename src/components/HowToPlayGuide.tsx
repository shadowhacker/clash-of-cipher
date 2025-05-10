
import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer';
import { X } from 'lucide-react';
import { useMobile } from '@/hooks/use-mobile';

interface HowToPlayGuideProps {
  open: boolean;
  onClose: () => void;
}

const HowToPlayGuide: React.FC<HowToPlayGuideProps> = ({ open, onClose }) => {
  const isMobile = useMobile();
  
  const content = (
    <div className="space-y-6 py-4">
      <div>
        <h3 className="font-semibold text-lg mb-2">How to Play</h3>
        <ul className="space-y-3 list-disc pl-5">
          <li>
            <span className="font-medium">Memorize the pattern</span>
            <p className="text-sm text-muted-foreground">Symbols flash for 1 second. Remember their order!</p>
          </li>
          <li>
            <span className="font-medium">Repeat the sequence</span>
            <p className="text-sm text-muted-foreground">Tap the symbols in the same order within 10 seconds.</p>
          </li>
          <li>
            <span className="font-medium">Level up</span>
            <p className="text-sm text-muted-foreground">Each level adds more symbols. Every 10 levels changes the color theme.</p>
          </li>
          <li>
            <span className="font-medium">Watch your lives</span>
            <p className="text-sm text-muted-foreground">You get 2 lives. A mistake or timeout costs one life.</p>
          </li>
          <li>
            <span className="font-medium">Set records</span>
            <p className="text-sm text-muted-foreground">Beat your personal best and share your score!</p>
          </li>
        </ul>
      </div>
      <div className="border-t pt-4">
        <p className="text-center text-muted-foreground">
          Challenge yourself to remember longer sequences<br/>and see how far you can go!
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
            <DrawerClose onClick={onClose} className="absolute right-4 top-4">
              <X className="h-4 w-4" />
            </DrawerClose>
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
          <SheetClose onClick={onClose} className="absolute right-4 top-4">
            <X className="h-4 w-4" />
          </SheetClose>
        </SheetHeader>
        {content}
      </SheetContent>
    </Sheet>
  );
};

export default HowToPlayGuide;
