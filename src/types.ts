// src/types.ts
export interface LoanDetails {
    id: string; // Assuming Loan ID is a string
    status: 'Reserved' | 'Borrowed' | 'Returned' | string; // Add other possible statuses
    // Add other relevant properties from your actual API response
    // e.g., borrowerName?: string; items?: { name: string }[]; dueDate?: string;
}

export enum LocationType {
    E2A = 'e2a',
    HUB = 'hub',
}

export type ActionType = 'collect' | 'return';

export interface IHomeViewModel {
    // State properties directly exposed
    state: {
        isModalOpen: boolean;
        loanID: string;
        isLoading: boolean;
        errorMessage: string;
        whichLocation: LocationType; // Expose original location if needed by View logic
    };
    // Derived or computed state properties
    derivedState: {
        isE2aLocation: boolean;
        modalTitle: string;
        showHostSpecificButtons: boolean;
        isSubmitDisabled: boolean; // Add derived state for button disabled logic
    };
    // Actions (functions) the View can call
    actions: {
        openCollectModal: () => void;
        openReturnModal: () => void;
        closeModal: () => void;
        handleLoanIdChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
        submitLoanAction: () => Promise<void>; // Mark as async if needed for clarity
        handleModalFormSubmit: (event: React.FormEvent<HTMLFormElement>) => void; // Add form submit handler
        changeLocation: () => void;
        navigateToCatalogue: () => void;
        openConsultationBooking: () => void;
        openJobRequest: () => void;
    };
}