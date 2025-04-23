// src/types.ts
export interface LoanDetails {
    id: string; // Assuming Loan ID is a string
    status: 'Reserved' | 'Borrowed' | 'Returned' | 'Rejected' | string; // Add other possible statuses
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
// --- Loan Transaction Related Types ---

/** Represents a single item within a loan transaction */
export interface LoanItem {
    item_name: string;
    quantity: number;
}

/** Represents a full loan transaction record */
export interface LoanTransaction {
    transaction_id: number;
    student_name: string;
    student_email: string;
    student_phone: string;
    remarks: string;
    updated_by: string;
    start_usage_date: string;
    end_usage_date: string;
    status: LoanDetails;
    location: LocationType;
    loan_items: LoanItem[];
}

// --- Dashboard Inventory Related Types ---

/** Represents inventory item data structured for the dashboard view */
export interface DashboardInventoryItem {
    item_id: string;
    item_name: string;
    total_qty: string;          // JSON shows string ("32", "20") - needs parseInt later
    qty_available: string;      // JSON shows string ("25", "19") - needs parseInt later
    qty_reserved: string;       // JSON shows string ("7", "1") - needs parseInt later
    qty_borrowed: string;       // JSON shows string ("0"), make optional/nullable
    loanable: 'true' | 'false';
    requires_approval: 'true' | 'false';
    brand: string;
    category: string;
    size_specs: string;
    model: string;
    location: LocationType;
}