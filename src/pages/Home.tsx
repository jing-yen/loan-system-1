import React from 'react';
import '../styles/App.css';
import Modal from '../components/Modal';
import { useHomeViewModel } from '../viewmodels/HomeViewModel';
import { IHomeViewModel } from '../types';

function HomeView(): JSX.Element {
    // Get the entire ViewModel object
    const viewModel: IHomeViewModel = useHomeViewModel();

    // Destructure for easier access in JSX, matching the IHomeViewModel structure
    const { state, derivedState, actions } = viewModel;

    return (
        <div className="content-area">

            {/* --- Modal --- */}
            <Modal isOpen={state.isModalOpen} onClose={actions.closeModal}>
                <h2>{derivedState.modalTitle}</h2>
                <form onSubmit={actions.handleModalFormSubmit}>
                    {state.errorMessage ? (<p className="error-message">{state.errorMessage}</p>) : (
                        <>
                            <p>Enter the Loan ID from your email.</p>
                            <input
                                autoFocus
                                type="text"
                                value={state.loanID}
                                placeholder="Enter Loan ID"
                                onChange={actions.handleLoanIdChange}
                                disabled={state.isLoading}
                                style={{ margin: 0, width: '100%' }}
                                aria-label="Loan ID Input"
                            />
                        </>
                    )}
                    <button type="submit" disabled={derivedState.isSubmitDisabled} style={{ width: '100%' }}>
                        {state.isLoading ? <div className="loader"></div> : state.errorMessage ? 'OK' : 'Submit'}
                    </button>
                </form>
            </Modal>

            {/* --- Main Content --- */}
            <img className='cover-image'
                src={derivedState.isE2aLocation ? "/e2a.jpg" : "/hub.jpg"}
                alt={derivedState.isE2aLocation ? "Electronics Workshop EDIC" : "Innovation Design Hub"}
            />

            <div className="welcome-message">
                <h1>
                    <span
                        className={derivedState.isE2aLocation ? 'other-location' : ''}
                        onClick={derivedState.isE2aLocation ? actions.changeLocation : undefined}
                        style={{ cursor: derivedState.isE2aLocation ? 'pointer' : 'default' }}
                        role="button"
                        tabIndex={derivedState.isE2aLocation ? 0 : -1}
                        onKeyDown={derivedState.isE2aLocation ? (e) => e.key === 'Enter' && actions.changeLocation() : undefined}
                    >
                        📍 The Hub
                    </span>
                    <span style={{ margin: '0 5px' }}>/</span>
                    <span
                        className={!derivedState.isE2aLocation ? 'other-location' : ''}
                        onClick={!derivedState.isE2aLocation ? actions.changeLocation : undefined}
                        style={{ cursor: !derivedState.isE2aLocation ? 'pointer' : 'default' }}
                        role="button"
                        tabIndex={!derivedState.isE2aLocation ? 0 : -1}
                        onKeyDown={!derivedState.isE2aLocation ? (e) => e.key === 'Enter' && actions.changeLocation() : undefined}
                    >
                         📍 Electronics Workshop
                    </span>
                </h1>
                <p>{derivedState.isE2aLocation ? 'E2A Laboratory' : 'Innovation & Design Hub, or The Hub in short,'} is a space to create, tinker and pursue exciting ideas to spur innovation.</p>
            </div>

            {/* --- Buttons --- */}
            <div className='home-button-row'>
                {!derivedState.isE2aLocation && <button className='home-button' onClick={actions.openConsultationBooking}>📅 Book a Consultation</button>}
                {!derivedState.isE2aLocation && <button className='home-button' onClick={actions.openJobRequest}>👷‍♂️ Job Request</button>}
            </div><br />
            <fieldset className='home-button-fieldset'>
                <legend>Loan System</legend>
                <button className='home-button' onClick={actions.navigateToCatalogue}>🛒 Look at the Catalogue</button>
                {derivedState.showHostSpecificButtons && (
                    <>
                        <button className='home-button' onClick={actions.openCollectModal}>📦 Collect</button>
                        <button className='home-button' onClick={actions.openReturnModal}>↩️ Return</button>
                    </>
                )}
            </fieldset><br />

            <footer>
                <p style={{ textAlign: 'center', fontSize: '12px', color: '#666' }}>
                    © 2025 EDIC. To access/update/delete your personal data, <a href="mailto:cdebox51@nus.edu.sg">email us here</a>.
                </p>
            </footer>
        </div>
    );
}

export default HomeView;