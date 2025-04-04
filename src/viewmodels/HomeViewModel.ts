// src/viewmodels/useHomeViewModel.ts
import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWhichLocation } from '../components/LocationContext';
import { LoanService } from '../services/LoanService';
import { ActionType, LocationType, IHomeViewModel } from '../types'; // Import IHomeViewModel

export function useHomeViewModel(): IHomeViewModel {
    // --- Hooks ---
    const navigate = useNavigate();
    const { whichLocation, setWhichLocation } = useWhichLocation();

    // --- Raw State ---
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [loanID, setLoanID] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [actionType, setActionType] = useState<ActionType | null>(null);

    // --- Derived State ---
    const isE2aLocation = useMemo(() => whichLocation === 'e2a', [whichLocation]);

    const modalTitle = useMemo(() => {
        if (!actionType) return '';
        return actionType === 'collect' ? '📦 Collections' : '↩️ Returns';
    }, [actionType]);

    const showHostSpecificButtons = useMemo(() => window.location.host !== 'edic.vercel.app', []);

    // Calculate if the modal submit button should be disabled
    const isSubmitDisabled = useMemo(() => {
        // Disable if loading OR if there's no error message and no loan ID entered
        return isLoading || (!errorMessage && !loanID);
    }, [isLoading, errorMessage, loanID]);


    // --- Actions ---
    const openModal = useCallback((type: ActionType) => {
        setActionType(type);
        setIsModalOpen(true);
        setErrorMessage('');
        setLoanID('');
    }, []); // No dependencies needed here for stable setters

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
        // Optional: Reset related state on close
        // setActionType(null);
        // setLoanID('');
        // setErrorMessage('');
    }, []);

    const handleLoanIdChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setLoanID(event.target.value);
        if (errorMessage) {
            setErrorMessage(''); // Clear error when user types
        }
    }, [errorMessage]); // Dependency: errorMessage

    const submitLoanAction = useCallback(async () => {
        // Guard clause if called inappropriately (though button disabled state should prevent this)
        if (!actionType || !loanID || isLoading) return;

        // Handle the 'OK' button case when an error is already displayed
        if (errorMessage) {
            closeModal();
            return;
        }

        setIsLoading(true);
        setErrorMessage('');

        try {
            const loanDetails = await LoanService.getLoanDetails(loanID);
            console.log('Loan Details:', loanDetails);

            // Validation Logic
            if (actionType === 'collect' && loanDetails.status !== 'Reserved') {
                throw new Error('Loan items are already collected or status is invalid.');
            }
            if (actionType === 'return' && loanDetails.status !== 'Borrowed') {
                throw new Error('Loan items are already returned, not collected yet, or status is invalid.');
            }

            // Success: Navigate
            const targetPath = actionType === 'collect' ? '/new-collect-form' : '/new-return-form';
            navigate(targetPath, { state: { loanDetails } });
            closeModal(); // Close modal on success

        } catch (error: any) {
            console.error('Error processing loan action:', error);
            if (error.message === 'Loan not found') {
                setErrorMessage('Loan ID not found. Please check and try again.');
            } else {
                 // Use the message from the thrown error or a generic fallback
                 setErrorMessage(error.message || 'An unexpected error occurred processing the loan.');
            }
        } finally {
            setIsLoading(false);
        }
        // Note: No return value needed for async void in this pattern
    }, [actionType, loanID, isLoading, errorMessage, navigate, closeModal]); // Dependencies

    // Specific handler for the form submission to prevent default browser behavior
    const handleModalFormSubmit = useCallback((event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // Prevent default form submission
        submitLoanAction(); // Call the core action logic
    }, [submitLoanAction]); // Dependency: submitLoanAction

    const changeLocation = useCallback(() => {
        const newLocation: LocationType = whichLocation === LocationType.E2A ? LocationType.HUB : LocationType.E2A;
        setWhichLocation(newLocation);
    }, [whichLocation, setWhichLocation]);

    const navigateToCatalogue = useCallback(() => {
        navigate('/catalogue');
    }, [navigate]);

    const openConsultationBooking = useCallback(() => {
        window.open("https://outlook.office365.com/book/InnovationDesignHubMediaRoom@nusu.onmicrosoft.com", "_blank", "noopener,noreferrer");
    }, []);

    const openJobRequest = useCallback(() => {
        window.open("https://forms.office.com/r/T7x6UZRvqY", "_blank", "noopener,noreferrer");
    }, []);


    // --- Return object conforming to IHomeViewModel ---
    return {
        state: {
            isModalOpen,
            loanID,
            isLoading,
            errorMessage,
            whichLocation, // Pass through the raw location state
        },
        derivedState: {
            isE2aLocation,
            modalTitle,
            showHostSpecificButtons,
            isSubmitDisabled, // Expose the calculated disabled state
        },
        actions: {
            openCollectModal: () => openModal('collect'),
            openReturnModal: () => openModal('return'),
            closeModal,
            handleLoanIdChange,
            submitLoanAction, // Expose the core async action
            handleModalFormSubmit, // Expose the form handler
            changeLocation,
            navigateToCatalogue,
            openConsultationBooking,
            openJobRequest,
        },
    };
}