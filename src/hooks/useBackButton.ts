import { useEffect, useRef } from 'react';
import logger from '../utils/logger';

type BackButtonHandler = () => void;

/**
 * A hook to handle mobile back button presses for dialogs and modals
 * 
 * @param isOpen - Whether the dialog/modal is currently open
 * @param onClose - Function to call when back button is pressed while dialog is open
 */
const useBackButton = (isOpen: boolean, onClose: BackButtonHandler): void => {
    // Keep track of whether we've added a history entry for this dialog
    const hasAddedHistoryEntry = useRef(false);

    useEffect(() => {
        // Only add history entry when dialog opens
        if (isOpen && !hasAddedHistoryEntry.current) {
            // Push a new history entry when dialog opens
            window.history.pushState({ dialogOpen: true }, '');
            hasAddedHistoryEntry.current = true;
            logger.debug('Added history entry for dialog');
        } else if (!isOpen && hasAddedHistoryEntry.current) {
            // Reset the flag when dialog closes normally
            hasAddedHistoryEntry.current = false;
        }

        // Handle popstate event (back button press)
        const handlePopState = (event: PopStateEvent) => {
            if (isOpen) {
                logger.debug('Back button pressed while dialog open');
                onClose();
            }
        };

        // Add event listener for back button
        window.addEventListener('popstate', handlePopState);

        // Clean up event listener
        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [isOpen, onClose]);
};

export default useBackButton;