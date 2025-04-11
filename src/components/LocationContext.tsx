import React, { createContext, useContext, useState, ReactNode } from 'react';
import { LocationType } from '../types';

export interface LocationContextType {
    whichLocation: LocationType;
    setWhichLocation: React.Dispatch<React.SetStateAction<LocationType>>;
}

const LocationContext = createContext<LocationContextType>({whichLocation: LocationType.HUB, setWhichLocation: () => {}});

export function useWhichLocation(): LocationContextType {
    return useContext(LocationContext);
}

interface LocationProviderProps {
    children: ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
    const [whichLocation, setWhichLocation] = useState(LocationType.HUB);

    return (
        <LocationContext.Provider value={{ whichLocation, setWhichLocation }}>
            {children}
        </LocationContext.Provider>
    );
};