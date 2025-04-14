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
    id: number;
    item_name: string;
    item_id: number;
    brand: string;
    model?: string | null;
    size_specs?: string | null;
    requires_approval?: string | boolean; // Consider using boolean if possible
    qty_borrowed: number;
    imageUrl?: string;
    // Add other properties returned by your API or needed by the cart
}

// Interface for inventory item data (as fetched or after grouping)
export interface InventoryItemData {
    item_id: number; // Unique ID (e.g., from database)
    item_name: string;
    brand: string;
    model?: string | null;
    size_specs?: string | null;
    category?: string | null;
    requires_approval?: string | boolean;
    qty_available: number; // Should be a number after grouping
    // Add any other properties coming from your API
}