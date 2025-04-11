import React from 'react';
import '../styles/Modal.css';
import { useRef, useEffect } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            // Set focus to the modal when it opens
            modalRef.current?.focus();
            document.addEventListener('keydown', handleKeyDown);
        }

        // Cleanup function
        return () => { 
            document.removeEventListener('keydown', handleKeyDown); 
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose} tabIndex={-1} ref={modalRef}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                {children}
                <button className="close-modal" onClick={onClose} aria-label="Close modal">X</button>
            </div>
        </div>
    );
};

export default Modal;