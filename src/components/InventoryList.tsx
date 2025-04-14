import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Modal from './Modal';
import SearchBar from './SearchBar'; 
import { useCart } from './CartContext';
import { useWhichLocation } from './LocationContext';
import { InventoryItemData } from '../types';
import '../styles/App.css';
import { LoanService } from '../services/LoanService';

interface InventoryItemProps {
    item: InventoryItemData;
    onAddToCart: (item: InventoryItemData, quantity: number) => void;
}

const InventoryItem: React.FC<InventoryItemProps> = ({ item, onAddToCart }) => {
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [quantity, setQuantity] = useState(1);

    const handleItemClick = () => {
        setModalOpen(true);
    };

    const handleAddToCart = () => {
        onAddToCart(item, quantity);
        setModalOpen(false);
    };

    const imageName = item.item_name ? item.item_name.replace(/\//g, '_').replace(/\s+/g, '_') : 'default';
    const brandName = item.brand ? item.brand.replace(/\s+/g, '_') : 'default_brand';
    const imageUrl = item.brand ? `/assets/${imageName}-${brandName}.jpg`.toLowerCase() : `/assets/${imageName}.jpg`.toLowerCase();
    const defaultImageUrl = `/assets/default.jpg`;

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        e.currentTarget.src = defaultImageUrl;
    };

    return (
        <div>
            <div className={`inventory-item`} onClick={handleItemClick}>
                <img src={imageUrl} alt={item.item_name} onError={handleImageError} className="item-image" />
                <h3 className="item-title">{item.item_name}</h3>
                <p className="item-brand">{item.brand}&zwnj;</p>
            </div>

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
                <h2>{item.item_name}</h2>
                {item.brand && <p><strong>Brand:</strong> {item.brand}</p>}
                <p><strong>Model:</strong> {item.model || 'N/A'}</p>
                <p><strong>Size/Specs:</strong> {item.size_specs || 'N/A'}</p>
                <p><strong>Requires Approval:</strong> {item.requires_approval === 'true' ? 'Yes' : 'No'}</p>
                <img src={imageUrl} alt={`${item.item_name} view`} onError={handleImageError} className="item-modal-image" />
                <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10)))}
                    min="1"
                    max={item.qty_available}
                />
                <button onClick={handleAddToCart}>Add to Cart</button>
            </Modal>
        </div>
    );
};

const InventoryList: React.FC = () => {
    // --- Hooks ---
    const { whichLocation } = useWhichLocation();
    const { cart, setCart } = useCart(); // Get typed cart state and setter
    const [items, setItems] = useState<InventoryItemData[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);


    // --- Data Fetching ---
    useEffect(() => {
        LoanService.getInventory(whichLocation)
            .then(data => { setItems(data); })
            .catch(error => console.error('Error fetching data:', error));
    }, [whichLocation]);


    // --- Filtering & Sorting ---
    const filteredItems = useMemo(() => {
        console.log(`Filtering with term: "${searchTerm}", categories: [${selectedCategories.join(', ')}]`);
        return items
            .filter(item =>
                (selectedCategories.length === 0 || (item.category && selectedCategories.includes(item.category))) &&
                (item.item_name?.toLowerCase()).includes(searchTerm.toLowerCase()) && item.qty_available > 0
            )
            .sort((a, b) => (a.item_name).localeCompare(b.item_name));
    }, [items, searchTerm, selectedCategories]);


    // --- Event Handlers ---
    const handleSearchChange = useCallback((newSearchTerm: string) => {
        setSearchTerm(newSearchTerm);
    }, []);

    const handleCategoryChange = useCallback((category: string) => {
        if (Array.isArray(category) && category.length === 0) {
            setSelectedCategories([]);
        } else if (selectedCategories.includes(category)) {
            setSelectedCategories(selectedCategories.filter(cat => cat !== category));
        } else {
            setSelectedCategories([...selectedCategories, category]);
        }
    }, []);

    const addToCart = useCallback((itemToAdd: InventoryItemData, quantityToAdd: number) => {
        // Convert the added quantity to a number to ensure proper calculations
        const quantity = Number(quantityToAdd);
        const imageUrl = `/assets/${itemToAdd.item_name.replace(/\//g, '_').replace(/\s+/g, '_')}-${itemToAdd.brand.replace(/\s+/g, '_')}.jpg`.toLowerCase();

        // Find if the item already exists in the cart
        const existingCartItemIndex = cart.findIndex(ci => ci.item_id == itemToAdd.item_id);
        const totalQuantityAfterAdd = quantity + (existingCartItemIndex >= 0 ? cart[existingCartItemIndex].qty_borrowed : 0);

        // Check if adding the item exceeds the available quantity
        if (totalQuantityAfterAdd > itemToAdd.qty_available) {
            alert(`Cannot add ${quantity} item(s). Only ${itemToAdd.qty_available - totalQuantityAfterAdd} more available.`);
            return; // Stop execution if adding exceeds available stock
        }

        // Check if adding a new item type exceeds the limit of 5 different items
        if (existingCartItemIndex === -1 && new Set(cart.map(cartItem => cartItem.item_id)).size >= 5) {
            alert("Cannot add more than 5 different types of items to the cart.");
            return; // Stop execution if it would exceed 5 different item types
        }

        setCart(prevCart => {
            if (existingCartItemIndex >= 0) {
                // Item already exists in cart, update its quantity
                return prevCart.map((cartItem, index) =>
                    index === existingCartItemIndex ? { ...cartItem, qty_borrowed: cartItem.qty_borrowed + quantity } : cartItem
                );
            } else {
                // Item does not exist, add as a new item
                return [...cart, { ...itemToAdd, qty_borrowed: quantity, imageUrl, id: cart.length }];
            }
        });
    }, [cart, setCart]);


    return (
        <div className="">
            <SearchBar
                    onSearchChange={handleSearchChange}
                    onCategoryChange={handleCategoryChange}
                    selectedCategories={selectedCategories}
                />
                <div className="inventory-list">
                    {filteredItems.map(item => (
                        <InventoryItem
                            key={item.item_id}
                            item={item}
                            onAddToCart={addToCart}
                        />)
                    )}
                </div>
        </div>
    );
};

export default InventoryList;