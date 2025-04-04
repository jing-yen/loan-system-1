import { LoanDetails } from '../types';
import { API_BASE_URL } from '../config';

export const LoanService = {
    /**
     * Fetches loan details by ID.
     * @param loanID The ID of the loan to fetch.
     * @returns A Promise resolving to LoanDetails.
     * @throws An error if the fetch fails or the loan is not found (status 404).
     */
    async getLoanDetails(loanID: string): Promise<LoanDetails> {
        const response = await fetch(`${API_BASE_URL}/api/loan-details/${loanID}`);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Loan not found'); // Specific error for 404
            }
            // Throw a generic error for other HTTP issues
            throw new Error(`Failed to fetch loan details: ${response.statusText}`);
        }

        const data: LoanDetails = await response.json();
        return data;
    }

    // Add other loan-related API calls here if needed (e.g., updateLoanStatus)
};