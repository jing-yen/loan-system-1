import './styles/App.css';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Catalogue from './pages/Catalogue';
import { Route, Routes, useLocation } from 'react-router-dom';
import NewBorrowForm from './components/NewBorrowForm';
import NewCollectForm from './components/NewCollectForm';
import NewReturnForm from './components/NewReturnForm';
import { CartProvider } from './components/CartContext'; // Import the provider
import { LocationProvider } from './components/LocationContext';
import LoanDashboard from './pages/Dashboard';
import OutlookBooking from './pages/Booking';
import { useEffect, useState } from 'react';
import VerifyPIN from './components/VerifyPIN';

function App() {
  // Verify PIN logic for all situations
  const [verifiedByStaff, setVerifiedByStaff] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const startVerificationProcess = () => {
    setVerifying(true);
  }

  const handleVerificationResponse = (verified) => {
    console.log('Verification response:', verified);
    setVerifiedByStaff(verified);
    setVerifying(false);
  }

  const location = useLocation();

  useEffect(() => {
    console.log('Location changed:', location, location.pathname=='/dashboard');
    setVerifiedByStaff(false);
    if (location.pathname=='/dashboard') startVerificationProcess();
    else setVerifying(false);
  }, [location.pathname]);

  return (
    <div className="App">
      <CartProvider>
      <LocationProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalogue" element={<Catalogue />} />
            <Route path="/new-borrow-form" element={<NewBorrowForm />} />
            <Route path="/booking" element={<OutlookBooking /> /*not used*/} />
          </Routes>
        {window.location.host != 'edic.vercel.app' /*only on edic-vercel.app*/ && 
          <VerifyPIN setVerifiedByStaff={handleVerificationResponse} verifying={verifying}>
            <Routes>
              <Route path="/new-collect-form" element={<NewCollectForm startVerification={startVerificationProcess} verifiedByStaff={verifiedByStaff}/>} />
              <Route path="/new-return-form" element={<NewReturnForm startVerification={startVerificationProcess} verifiedByStaff={verifiedByStaff} />} />
              <Route path="/dashboard" element={<LoanDashboard startVerification={startVerificationProcess} verifiedByStaff={verifiedByStaff} />} />
            </Routes>
          </VerifyPIN>
        }
      </LocationProvider>
      </CartProvider>
    </div>
  );
}


export default App;

