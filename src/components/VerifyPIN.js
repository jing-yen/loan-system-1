import React, { useState, useEffect, useMemo, useRef } from 'react';
import '../styles/NewBorrowForm.css';

function VerifyPIN({setVerifiedByStaff, verifying, children}) {
    const [password, setPassword] = useState('');
    const [passwordLess, setPasswordLess] = useState(true);

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        const correctPassword = '003342'; // Hub's favourite password
        setVerifiedByStaff(password === correctPassword);
        if (password !== correctPassword) alert('Incorrect password');
        setPassword('');
    };

    useEffect(() => {
        if (verifying) {
            registerCredential();
        }
    }, [verifying]);

    const registerCredential = async () => {
        try {
            setPasswordLess(true);
            const publicKeyCredentialCreationOptions = {
                challenge: new Uint8Array([0x8C, 0xFA, 0xB3, 0xA9, 0x42, 0xF5, 0x89, 0xDE]), // Example challenge
                rp: { name: "Your App Name" },
                user: {
                    id: new Uint8Array(16), // User ID in Uint8Array form, must be unique per user
                    name: "Staff and Makers",
                    displayName: "User Name"
                },
                pubKeyCredParams: [
                    { alg: -7, type: "public-key" }, // ES256
                    { alg: -257, type: "public-key" } // RS256
                ],
                authenticatorSelection: {
                    authenticatorAttachment: "platform",
                    userVerification: "required"
                },
                timeout: 60000,
                attestation: "direct",
            };
    
            const credential = await navigator.credentials.create({
                publicKey: publicKeyCredentialCreationOptions
            });
    
            if (credential) {
                console.log('Credential registered:', credential);
                setVerifiedByStaff(true);
                // Store the credential ID securely for future use
                const credentialId = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
                console.log('Credential ID:', credentialId);
                // Store this credentialId in your localStorage or server
            }
        } catch (err) {
            console.error('Credential registration failed:', err);
            setPasswordLess(false);
        }
    };
    
    if (!verifying) return children;
    if (passwordLess) return <div className="password-form-container"></div>;
    
    return (
        <div className="password-form-container">
            <form className="password-form" onSubmit={handlePasswordSubmit}>
                <h2>Verify to Continue</h2>
                <input
                type="password"
                pattern="[0-9]*" inputmode="numeric"
                autoFocus
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Submit</button>
            </form>
        </div>);
}

export default VerifyPIN;