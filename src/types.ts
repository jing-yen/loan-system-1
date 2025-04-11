// src/types.ts
export interface LoanDetails {
    id: string; // Assuming Loan ID is a string
    status: 'Reserved' | 'Borrowed' | 'Returned' | string; // Add other possible statuses
}

export enum LocationType {
    E2A = 'e2a',
    HUB = 'hub',
}

export type ActionType = 'collect' | 'return';

export enum LoanActionStatus {
    IDLE,
    LOADING,
    SUCCESS, // Usually brief before modal closes/navigates
    ERROR_NOT_FOUND,
    ERROR_INVALID_STATUS,
    ERROR_API,
}

// Define a type for cart items (adjust properties as needed)
export interface CartItem {
    id: string | number; // Or whatever identifies the item uniquely
    item_name: string;
    qty_borrowed: number;
    imageUrl?: string;
    // Add other properties returned by your API or needed by the cart
}

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