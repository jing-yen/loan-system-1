// src/views/CatalogueView.tsx
import React from 'react';
import '../styles/App.css';
import InventoryList from '../components/InventoryList';
import Modal from '../components/Modal';
import { useCatalogueViewModel } from '../viewmodels/CatalogueViewModel';
import { CartItem } from '../types';

export interface CatalogueProps {
    verifiedByStaff?: boolean;
    startVerification: () => void;
}

const CatalogueView: React.FC<CatalogueProps> = ({ startVerification }) => {
    // Get all state and logic from the ViewModel
    const { cart, showTopBtn, isModalOpen, isE2aLocation, otherLocationName, currentLocationDescription, showAdminFeatures, whichLocation, attemptToChangeLocation, confirmChangeLocation, closeModal, handleCheckout, scrollToTop } = useCatalogueViewModel();

    return (
        <div className="content-area">
            <div className="welcome-message">
                <h1>
                    🧾
                    <span
                        className={!isE2aLocation ? 'other-location' : ''}
                        onClick={!isE2aLocation ? attemptToChangeLocation : undefined}
                        style={{ cursor: !isE2aLocation ? 'pointer' : 'default' }}
                    >
                        Hub's
                    </span>
                    <span style={{ margin: '0 3px' }}>/</span>
                    <span
                        className={isE2aLocation ? 'other-location' : ''}
                        onClick={isE2aLocation ? attemptToChangeLocation : undefined}
                        style={{ cursor: isE2aLocation ? 'pointer' : 'default' }}
                    >
                        E2A's
                    </span>
                    {' '}Tool Catalogue {/* Conditional Admin Icon */}
                    {showAdminFeatures && (
                        <span onClick={startVerification} style={{ textDecoration: 'none', cursor: 'pointer' }} aria-label="Admin Verification">🔧</span>
                    )}
                </h1>
                <p>
                    Feel free to browse through the items we have for loan in {currentLocationDescription},
                    and choose any items you require.
                </p>
            </div>

            <InventoryList />
            <br /><br />

            {showTopBtn && <button className="scrollToTop-btn" onClick={scrollToTop}>Back to Top</button>}

            <Modal isOpen={isModalOpen} onClose={closeModal}>
                <h2>Empty Your Cart?</h2>
                <p style={{ whiteSpace: 'pre-wrap' }}>
                    Are you sure you want to switch to {otherLocationName}?<br/>
                    Your cart will be emptied:
                </p>
                {cart.length > 0 && (
                    <ul style={{ listStyle: 'disc', marginLeft: '20px', marginBottom: '15px' }}>
                        {cart.map((item: CartItem) => (
                            <li key={item.id}>{item.item_name}</li>
                        ))}
                    </ul>
                )}
                <button onClick={handleCheckout} style={{ width: '100%', marginBottom: '10px' }}>Borrow these Items from {whichLocation === 'e2a' ? 'E2A' : 'Hub'}</button>
                <button onClick={confirmChangeLocation} style={{ width: '100%' }}>Switch to {otherLocationName} & Empty Cart</button>
            </Modal>
        </div>
    );
};

export default CatalogueView;