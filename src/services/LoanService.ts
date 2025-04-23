import { DashboardInventoryItem, InventoryItemData, LoanDetails, LoanTransaction, LocationType } from '../types';
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
    },

    /**
     * Fetches all loan transactions.
     */
    async getLoanTransactions(): Promise<LoanTransaction[]> {
        const url = `${API_BASE_URL}/api/loan-transactions`; // Use API_BASE_URL if needed, else relative /api/...
        console.log(`LoanService: Fetching loan transactions from ${url}`);
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            if (!Array.isArray(data)) throw new Error("Invalid transaction data format.");
            return data as LoanTransaction[];
        } catch (error) {
            console.error(`LoanService: Error fetching loan transactions from ${url} -`, error);
            throw error instanceof Error ? error : new Error("Unknown error fetching transactions.");
        }
    },

    /**
     * Fetches HUB inventory data specifically for the dashboard.
     * (Assumes `/api/inventory` returns data suitable for DashboardInventoryItem)
     */
    async getHubDashboardInventory(): Promise<DashboardInventoryItem[]> {
        const url = `${API_BASE_URL}/api/inventory`;
        console.log(`LoanService: Fetching HUB dashboard inventory from ${url}`);
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            if (!Array.isArray(data)) throw new Error("Invalid inventory data format.");
            // Add location property for later filtering if API doesn't provide it
            return (data as DashboardInventoryItem[]).map(item => ({ ...item, location: LocationType.HUB }));
        } catch (error) {
            console.error(`LoanService: Error fetching HUB inventory from ${url} -`, error);
            throw error instanceof Error ? error : new Error("Unknown error fetching HUB inventory.");
        }
    },

    /**
     * Fetches E2A inventory data specifically for the dashboard.
     * (Assumes `/api/inventoryE2A` returns data suitable for DashboardInventoryItem)
     */
    async getE2ADashboardInventory(): Promise<DashboardInventoryItem[]> {
        const url = `${API_BASE_URL}/api/inventoryE2A`;
        console.log(`LoanService: Fetching E2A dashboard inventory from ${url}`);
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            if (!Array.isArray(data)) throw new Error("Invalid inventory data format.");
             // Add location property for later filtering if API doesn't provide it
            return (data as DashboardInventoryItem[]).map(item => ({ ...item, location: LocationType.E2A }));
        } catch (error) {
            console.error(`LoanService: Error fetching E2A inventory from ${url} -`, error);
            throw error instanceof Error ? error : new Error("Unknown error fetching E2A inventory.");
        }
    },
}