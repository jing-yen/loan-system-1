import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../components/CartContext';
import { useWhichLocation } from '../components/LocationContext';
import { CartItem, LocationType } from '../types';

export interface ICatalogueViewModel {
    // State & Derived State
    whichLocation: LocationType;
    cart: CartItem[];
    showTopBtn: boolean;
    isModalOpen: boolean;
    isE2aLocation: boolean;
    otherLocationName: string;
    currentLocationDescription: string;
    showAdminFeatures: boolean;

    // Actions
    attemptToChangeLocation: () => void;
    confirmChangeLocation: () => void;
    closeModal: () => void;
    handleCheckout: () => void;
    scrollToTop: () => void;
}

export function useCatalogueViewModel(): ICatalogueViewModel {
    // --- Hooks ---
    const { whichLocation, setWhichLocation } = useWhichLocation();
    const { cart, setCart } = useCart();
    const navigate = useNavigate();

    // --- State ---
    const [showTopBtn, setShowTopBtn] = useState<boolean>(false);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    // --- Scroll Effect ---
    const handleScroll = useCallback(() => {
        setShowTopBtn(window.scrollY > 200);
    }, []);

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [handleScroll]);

    // --- Actions ---
    const scrollToTop = useCallback(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
    }, []);

    const confirmChangeLocation = useCallback(() => {
        setCart([]);
        const newLocation: LocationType = whichLocation === LocationType.E2A ? LocationType.HUB : LocationType.E2A;
        setWhichLocation(newLocation);
        closeModal();
    }, [whichLocation, setWhichLocation, setCart, closeModal]);

    const attemptToChangeLocation = useCallback(() => {
        if (cart.length > 0) {
            setIsModalOpen(true);
        } else {
            confirmChangeLocation();
        }
    }, [cart, confirmChangeLocation]);

    const handleCheckout = useCallback(() => {
        if (cart.length > 0) {
            navigate('/new-borrow-form', { state: { selectedItems: cart, e2a: whichLocation === LocationType.E2A } });
        } else {
            alert("Please select the items you wish to borrow.");
        }
    }, [cart, navigate, whichLocation]);

    // --- Derived State for View ---
    const isE2aLocation = useMemo(() => whichLocation === LocationType.E2A, [whichLocation]);
    const otherLocationName = useMemo(() => (whichLocation === LocationType.E2A ? 'Hub' : 'E2A'), [whichLocation]);
    const currentLocationDescription = useMemo(() => (whichLocation === LocationType.E2A ? 'E2A Electronics Workshop' : 'the Innovation & Design Hub'), [whichLocation]);
    const showAdminFeatures = useMemo(() => window.location.host !== 'edic.vercel.app', []);

    // --- Expose state and actions ---
    return {
        // State & Derived State
        whichLocation, // Expose for direct use if needed, or rely on isE2aLocation
        cart,
        showTopBtn,
        isModalOpen,
        isE2aLocation,
        otherLocationName,
        currentLocationDescription,
        showAdminFeatures,

        // Actions
        attemptToChangeLocation,
        confirmChangeLocation,
        closeModal,
        handleCheckout,
        scrollToTop,
    };
}