import { InventoryItemData, LoanDetails, LocationType } from '../types';
import { API_BASE_URL } from '../config';

const groupAndSumItems = (items: InventoryItemData[]): InventoryItemData[] => {
    const groupedItems: { [key: string]: InventoryItemData } = {};
    items.forEach((item) => {
        const key = `${item.item_name}_${item.brand}`;
        const qty = parseInt(String(item.qty_available), 10);
        if (groupedItems[key]) {
            groupedItems[key].qty_available += qty;
        } else {
            groupedItems[key] = { ...item, qty_available: qty };
        }
    });
    return Object.values(groupedItems);
};


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
    },

    async getInventory(whichLocation: LocationType): Promise<InventoryItemData[]> {
        const locationParam = whichLocation === LocationType.E2A ? 'E2A' : '';
        const response = await fetch(`${API_BASE_URL}/api/inventory${locationParam}`);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Inventory not found'); // Specific error for 404
            }
            // Throw a generic error for other HTTP issues
            throw new Error(`Failed to fetch inventory: ${response.statusText}`);
        }

        const data: InventoryItemData[] = await response.json();
        if (!Array.isArray(data)) {
            console.error('Fetched data is not an array:', data);
            throw new Error('Invalid data format received from server.');
        }
        console.log('Raw data:', data);
        const grouped = groupAndSumItems(data);
        console.log('Grouped data:', grouped);
        return grouped;
    }
}