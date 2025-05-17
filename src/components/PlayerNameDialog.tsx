import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import logger from '../utils/logger';
import useBackButton from '../hooks/useBackButton';

interface PlayerNameDialogProps {
  open: boolean;
  onSubmit: (name: string) => void;
  onClose: () => void; // Added onClose prop
}

const PlayerNameDialog: React.FC<PlayerNameDialogProps> = ({ open, onSubmit, onClose }) => {
  const [name, setName] = useState('');

  // Use the back button hook to handle mobile back button presses
  useBackButton(open, onClose);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      logger.debug('Dialog form submitted with name:', name);
      onSubmit(name);
      // Reset name field after submission
      setName('');
    }
  };

  // This will be called when the dialog is closed without form submission
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      logger.debug('Dialog closed via escape/click outside');
      onClose();
      // Reset name field
      setName('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Enter Your Name</DialogTitle>
          <DialogDescription className="text-center">
            Enter a name or nickname to identify yourself in the game.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="py-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">How should we call you?</Label>
              <Input
                id="name"
                placeholder="Your name or nickname"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                maxLength={20}
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button type="submit" disabled={!name.trim()}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PlayerNameDialog;
