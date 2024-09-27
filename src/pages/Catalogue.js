import React, { useState, useEffect } from 'react';
import '../styles/App.css';
import InventoryList from '../components/InventoryList';
import Modal from '../components/Modal';
import { useCart } from '../components/CartContext';
import { useWhichLocation } from '../components/LocationContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function Catalogue() {
  const { whichLocation, setWhichLocation } = useWhichLocation();
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { cart, setCart } = useCart(); // Use useCart here
  const navigate = useNavigate();
  
  const attemptToChangeLocation = () => {
    if (cart.length > 0) {
      setIsModalOpen(true);
    } else { 
      changeLocation();
    }
  }

  const changeLocation = () => {
    setCart([]);
    console.log(whichLocation);
    setWhichLocation(whichLocation=='e2a' ? 'hub' : 'e2a');
  
    setIsModalOpen(false);
  }

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 200) { // Adjust as needed
        setShowTopBtn(true);
      } else {
        setShowTopBtn(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);
  
  const handleCheckout = () => {
    if (cart.length > 0) {
        navigate('/new-borrow-form', { state: { selectedItems: cart, e2a: whichLocation } });
    } else {
        alert("Please select the items you wish to borrow.");
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth', // For smooth scrolling
    });
  };

  return (
    <div className="content-area">
      <div className="welcome-message">
        <h1>🧾 <span className={whichLocation=='e2a'?'other-location':''} onClick={()=>whichLocation=='e2a'&&attemptToChangeLocation()}>Hub's</span><span className={whichLocation=='e2a'?'':'other-location'} onClick={()=>whichLocation=='hub'&&attemptToChangeLocation()}> / E2A's</span> Tool Catalogue {window.location.host != 'edic.vercel.app' && <Link to='/dashboard' style={{textDecoration: 'none'}}>🔧</Link>}</h1>
        <p>Feel free to browse through the items we have for loan in {whichLocation=='e2a'?'E2A Electronics Workshop':'the Innovation & Design Hub'}, and choose any items you require.</p>
      </div>
      
      <InventoryList e2a={whichLocation=='e2a'} />
      <br/>
      <br/>
      {showTopBtn && <button className="scrollToTop-btn" onClick={scrollToTop}>Back to Top</button>}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <h2>Empty Your Cart?</h2>
          {cart.length>0 && 
            <>
              <p style={{whiteSpace:'preserve-breaks'}}>Are you sure you want to switch to {whichLocation=='e2a'?'Hub':'E2A'}?<br/>Your cart will be emptied:</p>
              <ul>
                {cart.map((item, i) => <li key={i}>{item.item_name}</li>)}
              </ul>
            </>
          }
          <button onClick={handleCheckout} style={{width:'100%'}}>Borrow these Items</button>
          <button onClick={changeLocation} style={{width:'100%'}}>Switch to {whichLocation=='e2a'?'Hub':'E2A'}</button>
      </Modal> 
    </div>
  );
}

export default Catalogue;
