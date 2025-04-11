import React, { useState, useMemo, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from './CartContext';
import Modal from './Modal';
import '../styles/Navbar.css';
import { LoanService } from '../services/LoanService';
import { LoanDetails, ActionType, LoanActionStatus } from '../types';

const defaultImageUrl = `/assets/default.jpg`;
const hubLogoUrl = `../hub_logo_white.png`;

const Navbar: React.FC = () => {
    // --- Hooks ---
    const navigate = useNavigate();
    const location = useLocation();
    const { cart, setCart } = useCart();

    // --- Component State ---
    const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

    // Modal State (using the enum pattern)
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [loanID, setLoanID] = useState<string>('');
    const [actionType, setActionType] = useState<ActionType | null>(null);
    const [loanActionStatus, setLoanActionStatus] = useState<LoanActionStatus>(LoanActionStatus.IDLE);

    // --- Derived State (for Modal) ---
    const isSubmitting = useMemo(() => loanActionStatus === LoanActionStatus.LOADING, [loanActionStatus]);
    const hasError = useMemo(() =>
        loanActionStatus === LoanActionStatus.ERROR_NOT_FOUND ||
        loanActionStatus === LoanActionStatus.ERROR_INVALID_STATUS ||
        loanActionStatus === LoanActionStatus.ERROR_API,
        [loanActionStatus]
    );
    const modalErrorMessage = useMemo((): string | null => {
        switch (loanActionStatus) {
            case LoanActionStatus.ERROR_NOT_FOUND: return 'Loan ID not found. Please check and try again.';
            case LoanActionStatus.ERROR_INVALID_STATUS:
                return actionType === 'collect'
                    ? 'Loan items are already collected or status is invalid.'
                    : 'Loan items are already returned, not collected yet, or status is invalid.';
            case LoanActionStatus.ERROR_API: return 'An unexpected error occurred.';
            default: return null;
        }
    }, [loanActionStatus, actionType]);
    const modalTitle = useMemo(() => {
        if (!actionType) return '';
        return actionType === 'collect' ? '📦 Collections' : '↩️ Returns';
    }, [actionType]);

    // Other Derived State
    const showHostSpecificButtons = useMemo(() => window.location.host !== 'edic.vercel.app', []);
    const showHomeLink = useMemo(() => location.pathname !== '/', [location.pathname]);

    // --- Callbacks / Event Handlers ---

    const openModal = useCallback((type: ActionType) => {
        setActionType(type);
        setIsModalOpen(true);
        setLoanActionStatus(LoanActionStatus.IDLE);
        setLoanID('');
        setIsCartOpen(false);
    }, []);

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
        setLoanActionStatus(LoanActionStatus.IDLE);
    }, []);

    const handleLoanIdChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setLoanID(event.target.value);
        if (hasError) {
            setLoanActionStatus(LoanActionStatus.IDLE);
        }
    }, [hasError]);

    const handleModalSubmit = useCallback(async (event?: React.FormEvent<HTMLFormElement>) => {
        event?.preventDefault();

        if (hasError) {
            closeModal();
            return;
        }

        if (!actionType || !loanID) return;

        setLoanActionStatus(LoanActionStatus.LOADING);

        try {
            const loanDetails: LoanDetails = await LoanService.getLoanDetails(loanID);
            console.log('Loan Details:', loanDetails);

            // Validation
            if (actionType === 'collect' && loanDetails.status !== 'Reserved') {
                setLoanActionStatus(LoanActionStatus.ERROR_INVALID_STATUS);
                return;
            }
            if (actionType === 'return' && loanDetails.status !== 'Borrowed') {
                setLoanActionStatus(LoanActionStatus.ERROR_INVALID_STATUS);
                return;
            }

            // Success
            setLoanActionStatus(LoanActionStatus.SUCCESS);
            const targetPath = actionType === 'collect' ? '/new-collect-form' : '/new-return-form';
            navigate(targetPath, { state: { loanDetails: loanDetails } });
            closeModal();

        } catch (error: any) {
            console.error('Error checking loan details:', error);
            if (error.message === 'Loan not found') {
                setLoanActionStatus(LoanActionStatus.ERROR_NOT_FOUND);
            } else {
                setLoanActionStatus(LoanActionStatus.ERROR_API);
            }
        }
    }, [actionType, loanID, navigate, closeModal, hasError]);

    const toggleCart = useCallback(() => {
        setIsCartOpen(prev => !prev);
        setIsModalOpen(false);
    }, []);

    const removeFromCart = useCallback((indexToRemove: number) => {
        setCart(currentCart => currentCart.filter((_, index) => index !== indexToRemove));
    }, [setCart]);

    const handleCheckout = useCallback(() => {
        if (cart.length > 0) {
            setIsCartOpen(false);
            navigate('/new-borrow-form', { state: { selectedItems: cart } });
        } else {
            alert("Please select the items you wish to borrow.");
        }
    }, [cart, navigate]);

    const submitButtonText = hasError ? 'OK' : 'Submit';

    return (
        <>
            <Modal isOpen={isModalOpen} onClose={closeModal}>
                <h2>{modalTitle}</h2>
                <form onSubmit={handleModalSubmit}>
                    {modalErrorMessage && (
                        <p className="error-message">{modalErrorMessage}</p>
                    )}
                    {!hasError && (
                        <>
                            <p>Enter the Loan ID from your email.</p>
                            <input
                                autoFocus
                                type="text"
                                value={loanID}
                                placeholder="Enter Loan ID"
                                onChange={handleLoanIdChange}
                                disabled={isSubmitting}
                                style={{ margin: 0, width: '100%' }}
                                aria-label="Loan ID Input"
                            />
                        </>
                    )}
                    <button
                        type="submit"
                        disabled={isSubmitting || (!hasError && !loanID)}
                        style={{ width: '100%' }}
                    >
                        {isSubmitting ? <div className="loader"></div> : submitButtonText}
                    </button>
                </form>
            </Modal>

            <div className="navbar">
                <div className="leftSide">
                    <Link to="/">
                        <img src={hubLogoUrl} alt="NUS EDIC Logo" /> {/* Added more specific alt text */}
                    </Link>
                </div>
                <div className="rightSide">
                    {showHomeLink && <Link to="/">🏠 Home</Link>}

                    {showHostSpecificButtons && (
                        <>
                            <div className="cart-icon" onClick={() => openModal('collect')}>
                                📦 Collect
                            </div>
                            <div className="cart-icon" onClick={() => openModal('return')}>
                                ↩️ Return
                            </div>
                        </>
                    )}

                    <div className="cart-icon" onClick={toggleCart} aria-haspopup="true" aria-expanded={isCartOpen}>
                        🛒 Cart ({cart.length})
                    </div>

                    {isCartOpen && (
                        <div className="cart-dropdown" role="dialog" aria-label="Shopping Cart">
                            <div className="cart-header">🛒 My Cart</div>
                            {cart.length > 0 ? (
                                cart.map((item, index) => (
                                    <div key={item.id ?? index} className="cart-item"> {/* Use item.id if available, fallback to index */}
                                        <img
                                            src={item.imageUrl || defaultImageUrl}
                                            alt={item.item_name} // Alt text for image
                                            style={{ width: '70px', height: '70px', borderRadius: '8px' }}
                                            onError={(e) => (e.currentTarget.src = defaultImageUrl)} // Fallback for broken image URLs
                                        />
                                        <div className="cart-item-details">
                                            <div className="cart-item-name">{item.item_name}</div>
                                            <div className="cart-item-qty">Qty: {item.qty_borrowed}</div>
                                        </div>
                                        {location.pathname !== '/new-borrow-form' && (
                                            <button
                                                onClick={() => removeFromCart(index)}
                                                className="cancel-item-button"
                                                aria-label={`Remove ${item.item_name} from cart`}
                                            >
                                                <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" fill="none" style={{width: '14px', height: '14px'}}>
                                                    <path d="M0.26 13.737C0.155 13.637 0.084 13.52 0.049 13.385C0.02 13.251 0.023 13.116 0.058 12.981C0.093 12.846 0.16 12.729 0.26 12.629L5.885 6.996L0.26 1.371C0.16 1.271 0.093 1.154 0.058 1.019C0.029 0.884 0.029 0.75 0.058 0.615C0.093 0.48 0.16 0.363 0.26 0.263C0.36 0.158 0.477 0.09 0.612 0.061C0.747 0.026 0.882 0.026 1.016 0.061C1.157 0.09 1.277 0.158 1.376 0.263L7.001 5.888L12.626 0.263C12.726 0.158 12.843 0.09 12.978 0.061C13.113 0.026 13.247 0.026 13.382 0.061C13.517 0.09 13.637 0.158 13.742 0.263C13.842 0.363 13.907 0.48 13.936 0.615C13.971 0.75 13.971 0.885 13.936 1.019C13.907 1.154 13.842 1.271 13.742 1.371L8.117 6.996L13.742 12.629C13.842 12.729 13.907 12.846 13.936 12.981C13.971 13.116 13.971 13.251 13.936 13.386C13.907 13.521 13.842 13.637 13.742 13.737C13.643 13.843 13.523 13.91 13.382 13.939C13.247 13.974 13.113 13.974 12.978 13.939C12.843 13.904 12.726 13.836 12.626 13.737L7.001 8.112L1.376 13.737C1.277 13.837 1.159 13.904 1.025 13.939C0.89 13.974 0.755 13.974 0.62 13.939C0.486 13.904 0.365 13.836 0.26 13.737Z" fill="red" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p style={{ marginTop: '1rem' }} className='cart'>No items in cart.</p> // Centered text
                            )}
                            <button
                                className="checkout-button"
                                onClick={handleCheckout}
                                disabled={cart.length === 0} // Disable checkout if cart is empty
                            >
                                Checkout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Navbar;