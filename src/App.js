import './styles/App.css';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Catalogue from './pages/Catalogue';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NewBorrowForm from './components/NewBorrowForm';
import NewCollectForm from './components/NewCollectForm';
import NewReturnForm from './components/NewReturnForm';
import { CartProvider } from './components/CartContext'; // Import the provider
import { LocationProvider } from './components/LocationContext';
import LoanDashboard from './pages/Dashboard';
import OutlookBooking from './pages/Booking';


function App() {
  return (
    <div className="App">
      <CartProvider>
      <LocationProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalogue" element={<Catalogue />} />
            <Route path="/new-borrow-form" element={<NewBorrowForm />} />
            <Route path="/booking" element={<OutlookBooking />} />
            {window.location.host != 'edic.vercel.app' && <>
              <Route path="/new-collect-form" element={<NewCollectForm />} />
              <Route path="/new-return-form" element={<NewReturnForm />} />
              <Route path="/dashboard" element={<LoanDashboard/>} />
            </>}
          </Routes>
        </Router>
      </LocationProvider>
      </CartProvider>
    </div>
  );
}


export default App;

