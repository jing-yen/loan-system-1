import './styles/App.css';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Catalogue from './pages/Catalogue';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
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
  const location = useLocation();
  const navigate = useNavigate();

  const startVerificationProcess = () => {
    setVerifying(true);
  }

  const handleVerificationResponse = (verified) => {
    console.log('Verification response:', verified);
    setVerifiedByStaff(verified);
    setVerifying(false); 
    if (location.pathname=='/catalogue' && verified) navigate('/dashboard')
  }


  useEffect(() => {
    console.log('Location:', location.pathname);
    if (location.pathname=='/dashboard') return;
    setVerifiedByStaff(false);
    setVerifying(false);
  }, [location.pathname]);

  return (
    <div className="App">
      <CartProvider>
      <LocationProvider>
          <Navbar />
          <VerifyPIN setVerifiedByStaff={handleVerificationResponse} verifying={verifying}>\
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/catalogue" element={<Catalogue startVerification={startVerificationProcess} verifiedByStaff={verifiedByStaff}/>} />
              <Route path="/new-borrow-form" element={<NewBorrowForm />} />
              <Route path="/booking" element={<OutlookBooking /> /*not used*/} />
            </Routes>
            {window.location.host != 'edic.vercel.app' /*only on edic-vercel.app*/ && 
            <Routes>
              <Route path="/new-collect-form" element={<NewCollectForm startVerification={startVerificationProcess} verifiedByStaff={verifiedByStaff}/>} />
              <Route path="/new-return-form" element={<NewReturnForm startVerification={startVerificationProcess} verifiedByStaff={verifiedByStaff} />} />
              <Route path="/dashboard" element={<LoanDashboard startVerification={startVerificationProcess} verifiedByStaff={verifiedByStaff} />} />
            </Routes>
            }
          </VerifyPIN>
      </LocationProvider>
      </CartProvider>
    </div>
  );
}


export default App;

