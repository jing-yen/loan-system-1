import React, { useCallback, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faTimes } from '@fortawesome/free-solid-svg-icons';
import "../styles/SearchBar.css"

interface SearchBarProps {
    onSearchChange: (searchTerm: string) => void;
    onCategoryChange: (category: string) => void;
    selectedCategories: string[];
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearchChange, onCategoryChange, selectedCategories }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const categories = [
        'Electrical Tools',
        'Electronics',
        'Fabrication Tools',
        'Measurement Tools',
        'Other Equipment',
        'Power Tools'
    ];
    
    const handleSearchInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const newSearchTerm = event.target.value;
        setSearchTerm(newSearchTerm);
        onSearchChange(newSearchTerm);
    }, [onSearchChange]);

    const clearSearch = useCallback(() => {
        setSearchTerm('');
        onSearchChange('');
    }, [onSearchChange]);

    const handleCategorySelect = useCallback((category: string) => {
        onCategoryChange(category);
    }, [onCategoryChange]);

    return (
        <div>
            <div className="search-bar">
                <FontAwesomeIcon icon={faMagnifyingGlass} className='search-icon' />
                <input
                    type="text"
                    placeholder="Search for equipment..."
                    value={searchTerm}
                    onChange={handleSearchInputChange}
                />
                {searchTerm && (
                    <button onClick={clearSearch} className="clear-search">
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                )}
            </div>
            <div className="category-picker">
                {categories.map(category => (
                    <button
                        key={category}
                        className={`category-btn ${selectedCategories.includes(category) ? 'selected' : ''}`}
                        onClick={() => handleCategorySelect(category)}
                    >
                        {category}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default SearchBar;
