import React, { useState, useEffect } from 'react';
import '../styles/App.css';
import Modal from '../components/Modal';
import { useNavigate } from 'react-router-dom';
import { useWhichLocation } from '../components/LocationContext';

function Home() {
  const { whichLocation, setWhichLocation } = useWhichLocation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loanID, setLoanID] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionType, setActionType] = useState(null);

  let navigate = useNavigate();

  const toggleCollections = () => {
      setActionType('collect');
      setIsModalOpen(true);
      setError('');
      setLoanID('');
  };

  const toggleReturns = () => {
      setActionType('return');
      setIsModalOpen(true);
      setError('');
      setLoanID('');
  };

  const handleCollectionsOrReturns = async (action, loanID) => {
      try {
      // Set loading state to true
      setLoading(true);

      // Call the API to check loan details
      const response = await fetch(`https://express-server-1.fly.dev/api/loan-details/${loanID}`);
      setLoading(false);
  
      if (response.status === 404) {
          // Loan not found, handle the error (e.g., display a message)
          setError('Loan not found');
          // You might want to display an error message to the user here
          return; // Stop further execution
      }

      // Parse the response as JSON
      const loanDetails = await response.json();

      // Now you have the loan details in the `loanDetails` variable
      console.log('Loan Details:', loanDetails);

      // If the loan items are already collected
      if (action == 'collect' && loanDetails.status != 'Reserved') {
          setError('Loan items are already collected.');
          return; // Stop further execution
      }

      // If the loan items are already returned, or not collected yet
      if (action == 'return' && loanDetails.status != 'Borrowed') {
          setError('Loan items are already returned / not collected yet.');
          return; // Stop further execution
      }
  
      // If the API call is successful (status code is not 404)
      navigate(action=='collect' ? '/new-collect-form': '/new-return-form', { state: { loanDetails: loanDetails } });
      setIsModalOpen(false);
  
      } catch (error) {
      // Handle any errors that occur during the API call
      console.error('Error checking loan details:', error);
      // You might want to display a generic error message to the user here
      }
  };

  const changeLocation = () => {
    setWhichLocation(whichLocation === 'e2a' ? 'hub' : 'e2a');
  }

  const isE2a = () => {
    return whichLocation === 'e2a';
  }

  return (
    <div className="content-area">     
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <h2>{actionType === 'collect' ? '📦 Collections' : '↩️ Returns'}</h2>
          <form>
              {error ? <p className="error-message">{error}</p>:
                  <><p>Enter the Loan ID from your email.</p>
                  <input autoFocus
                      type="text"
                      value={loanID}
                      placeholder="Enter Loan ID"
                      onChange={(e) => setLoanID(e.target.value)}
                      disabled={loading}
                      style={{margin:0, width:'100%'}}
                      /></>}
              <button onClick={()=>{error ? setIsModalOpen(false) : handleCollectionsOrReturns(actionType, loanID)}} disabled={loading} style={{width:'100%'}}>
                  {loading ? <div class="loader"></div> : error ? 'OK' : 'Submit'}
              </button>
          </form>
      </Modal>   
      <img className='cover-image' src="https://cdn.prod.website-files.com/65ee59f949d5783be9a28afa/6600dd49fe28188d945174be_DSC00273-p-1080.webp"></img>

      <div className="welcome-message">
        <h1><span className={isE2a()?'other-location':''} onClick={()=>isE2a()&&changeLocation()}>📍 The Hub</span><span className={isE2a()?'':'other-location'} onClick={()=>!isE2a()&&changeLocation()}> / 📍 Electronics Workshop</span></h1>
        <p>{isE2a()?'E2A Laboratory':'Innovation & Design Hub, or The Hub in short,'} is a space to create, tinker and pursue exciting ideas to spur innovation.</p>
      </div>
      <div className='home-button-row'>
        {!isE2a() && <button className='home-button' onClick={()=>window.open("https://outlook.office365.com/book/InnovationDesignHubMediaRoom@nusu.onmicrosoft.com")}>📅 Book a Consultation</button>}
        {!isE2a() && <button className='home-button' onClick={()=>window.open("https://forms.office.com/r/T7x6UZRvqY")}>👷‍♂️ Job Request</button>}
      </div>
      <br/>
      <fieldset className='home-button-fieldset'>
        <legend>  Loan System  </legend>
        <button className='home-button' onClick={()=>navigate('/catalogue')}>🛒 Look at the Catalogue</button>
        <button className='home-button'onClick={toggleCollections}>📦 Collect</button>
        <button className='home-button' onClick={toggleReturns}>↩️ Return</button>
      </fieldset>
    </div>
  );
}

export default Home;
