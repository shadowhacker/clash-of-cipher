import { useRemoteConfig } from "../hooks/useRemoteConfig";
import React, { useEffect } from "react";
import { Crisp } from "crisp-sdk-web";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import useBackButton from "../hooks/useBackButton";

interface HowToPlayGuideProps {
  open: boolean;
  onClose: () => void;
  isFirstTime?: boolean;
}

const HowToPlayGuide: React.FC<HowToPlayGuideProps> = ({
  open,
  onClose,
  isFirstTime = false,
}) => {
  useEffect(() => {
    Crisp.configure("7f29a0e0-85c2-4352-a27e-c7943f90bb0a"); // Crisp Website ID
    Crisp.chat.hide(); // Hide default chatbox
    Crisp.chat.onChatClosed(() => {
      Crisp.chat.hide();
    });
  }, []);
  const isMobile = useIsMobile();
  const { config, loading } = useRemoteConfig();

  // Use the back button hook to handle mobile back button presses
  useBackButton(open, onClose);
  const rules = config?.rules_text || [
    "1. Watch the symbols and remember their order.",
    "2. Tap the symbols in the same order.",
    "3. Get it right to go to the next round!",
  ];

  const content = (
    <div
      className="space-y-6 py-4 px-1"
      style={{ fontFamily: "Hind Madurai, sans-serif", fontWeight: 400 }}
    >
      <div>
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
      <div className="flex justify-center mt-8">
        <button
          type="button"
          className="bg-primary text-white px-6 py-2 rounded-lg shadow hover:bg-primary/90 transition-colors duration-200"
          onClick={() => {
            Crisp.chat.show();
            Crisp.chat.open();
            onClose();
          }}
        >
          💬 Support
        </button>
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
