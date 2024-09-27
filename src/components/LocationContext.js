import React, { createContext, useContext, useState } from 'react';

const LocationContext = createContext();

export function useWhichLocation() {
    return useContext(LocationContext);
}

export const LocationProvider = ({ children }) => {
    const [whichLocation, setWhichLocation] = useState('hub');

    return (
        <LocationContext.Provider value={{ whichLocation, setWhichLocation }}>
            {children}
        </LocationContext.Provider>
    );
};
