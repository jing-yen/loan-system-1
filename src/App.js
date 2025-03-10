import './styles/App.css';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Catalogue from './pages/Catalogue';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import BorrowForm from './components/forms/BorrowForm';
import CollectForm from './components/forms/CollectForm';
import ReturnForm from './components/forms/ReturnForm';
import { CartProvider } from './components/context/CartContext';
import { LocationProvider } from './components/context/LocationContext';
import LoanDashboard from './pages/Dashboard';
import { useEffect, useState } from 'react';
import VerifyPIN from './components/VerifyPIN';

/**
 * Main application component that sets up routing and context providers.
 * It handles PIN verification for staff-only functionalities.
 */
function App() {
  // State to manage staff verification status and verification process
  const [verifiedByStaff, setVerifiedByStaff] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  /**
   * Initiates the PIN verification process.
   */
  const startVerificationProcess = () => {
    setVerifying(true);
  };

  /**
   * Handles the response from the PIN verification component.
   * @param {boolean} verified - Indicates if the verification was successful.
   */
  const handleVerificationResponse = (verified) => {
    console.log('Verification response:', verified);
    setVerifiedByStaff(verified);
    setVerifying(false);
    // Redirect to dashboard after successful verification from catalogue page
    if (location.pathname === '/catalogue' && verified) {
      navigate('/dashboard');
    }
  };

  // Reset verification status when location changes, except when on the dashboard
  useEffect(() => {
    console.log('Location:', location.pathname);
    if (location.pathname === '/dashboard') {
      return; // Do not reset verification if already on dashboard
    }
    setVerifiedByStaff(false);
    setVerifying(false);
  }, [location.pathname]);

  return (
    <div className="App">
      {/* Context provider for cart functionality */}
      <CartProvider>
        {/* Context provider for location (Hub/E2A) functionality */}
        <LocationProvider>
          <Navbar />
          {/* PIN verification component wrapping routes that require staff verification */}
          <VerifyPIN
            setVerifiedByStaff={handleVerificationResponse}
            verifying={verifying}
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route
                path="/catalogue"
                element={
                  <Catalogue
                    startVerification={startVerificationProcess}
                    verifiedByStaff={verifiedByStaff}
                  />
                }
              />
              <Route path="/new-borrow-form" element={<BorrowForm />} />
            </Routes>
            {/* Conditionally render staff-only routes based on host environment */}
            {window.location.host !== 'edic.vercel.app' && (
              <Routes>
                <Route
                  path="/new-collect-form"
                  element={
                    <CollectForm
                      startVerification={startVerificationProcess}
                      verifiedByStaff={verifiedByStaff}
                    />
                  }
                />
                <Route
                  path="/new-return-form"
                  element={
                    <ReturnForm
                      startVerification={startVerificationProcess}
                      verifiedByStaff={verifiedByStaff}
                    />
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <LoanDashboard
                      startVerification={() => alert('hi')} // Example, consider removing or implementing properly
                      verifiedByStaff={verifiedByStaff}
                    />
                  }
                />
              </Routes>
            )}
          </VerifyPIN>
        </LocationProvider>
      </CartProvider>
    </div>
  );
}

export default App;
