import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import '../styles/NewBorrowForm.css';

interface VerifyPINProps {
    setVerifiedByStaff: (isVerified: boolean) => void;
    verifying: boolean;
    children: React.ReactNode;
}

const VerifyPIN: React.FC<VerifyPINProps> = ({ setVerifiedByStaff, verifying, children }) => {
    const [password, setPassword] = useState('');
    const [passwordLess, setPasswordLess] = useState(true);

    const handlePasswordSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const correctPassword = '003342'; // Hub's favourite password
        setVerifiedByStaff(password === correctPassword);
        if (password !== correctPassword) alert('Incorrect password');
        setPassword('');
    }, [password, setVerifiedByStaff]);

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
                attestation: "direct" as AttestationConveyancePreference,
            };
    
            const credential = await navigator.credentials.create({
                publicKey: publicKeyCredentialCreationOptions as PublicKeyCredentialCreationOptions
            });
    
            if (credential) {
                console.log('Credential registered:', credential);
                setVerifiedByStaff(true);
                // Store the credential ID securely for future use
                const credentialId = credential.id;
                console.log('Credential ID:', credentialId);
                // Store this credentialId in your localStorage or server
            }
        } catch (err) {
            console.error('Credential registration failed:', err);
            setPasswordLess(false);
        }
    };
    
    return (
        <>
        { verifying && <div className="password-form-container">
            {!passwordLess &&
                <form className="password-form" onSubmit={handlePasswordSubmit}>
                    <h2>Verify to Continue</h2>
                    <input
                        type="password"
                        pattern="[0-9]*" inputMode="numeric"
                        autoFocus
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="submit">Submit</button>
                </form>
            }
        </div> }
        <div style={{display:verifying?'none':'block'}}>{children}</div>
        </>);
}

export default VerifyPIN;