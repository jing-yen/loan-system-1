import React, { useState, useEffect } from 'react';
import '../styles/App.css';
import InventoryList from '../components/InventoryList';
import { useNavigate, useLocation } from 'react-router-dom';

function Home({ cart, setCart }) {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showTopBtn, setShowTopBtn] = useState(false);
  let navigate = useNavigate();
  
  const toggleCollections = () => {
    var loanID = prompt("📦 Collections: Enter Loan ID:");
    handleCollectionsOrReturns('collect', loanID);
  };

  const toggleReturns = () => {
    var loanID = prompt("↩️ Returns: Enter Loan ID:");
    handleCollectionsOrReturns('collect', loanID);
  };
  

  const handleCollectionsOrReturns = async (action, loanID) => {
    try {
      // Call the API to check loan details
      const response = await fetch(`https://express-server-1.fly.dev/api/loan-details/${loanID}`);
  
      if (response.status === 404) {
        // Loan not found, handle the error (e.g., display a message)
        alert('Loan not found');
        // You might want to display an error message to the user here
        return; // Stop further execution
      }

      // Parse the response as JSON
      const loanDetails = await response.json();

      // Now you have the loan details in the `loanDetails` variable
      console.log('Loan Details:', loanDetails);

      // If the loan items are already collected
      if (action == 'collect' && loanDetails.status != 'Reserved') {
        alert('Loan items are already collected');
        return; // Stop further execution
      }

      // If the loan items are already returned, or not collected yet
      if (action == 'return' && loanDetails.status != 'Borrowed') {
        alert('Loan items are already returned, or not collected yet');
        return; // Stop further execution
    }
  
      // If the API call is successful (status code is not 404)
      navigate(action=='collect' ? '/new-collect-form': '/new-return-form', { state: { loanDetails: loanDetails } });
  
    } catch (error) {
      // Handle any errors that occur during the API call
      console.error('Error checking loan details:', error);
      // You might want to display a generic error message to the user here
    }
};

  const handleCategoryChange = (category) => {
    if (Array.isArray(category) && category.length === 0) {
      setSelectedCategories([]);
    } else if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(cat => cat !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

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

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth', // For smooth scrolling
    });
  };

  return (
    <div className="content-area">
      <div className="action-container">
      <div
            className='action-item' onClick={toggleCollections} style={{backgroundColor: '#ffddb0'}}
            >
            <h1>📦</h1>
            <h3>Collections</h3>
            </div>
            
      <div
            className='action-item' onClick={toggleReturns} style={{backgroundColor: '#65a5f7'}}
            >
            <h1>↩️</h1>
            <h3>Returns</h3>
      </div>
      </div>
      <div className="welcome-message">
        <h1>Welcome to the Hub’s Tool Catalogue</h1>
        <p>Feel free to browse through the items we have for loan in the Innovation & Design Hub, and choose any items you require.</p>
      </div>
      <InventoryList
        cart={cart}
        setCart={setCart}
        selectedCategories={selectedCategories} />
      {showTopBtn && <button className="scrollToTop-btn" onClick={scrollToTop}>Back to Top</button>}
    </div>
  );
}

export default Home;
