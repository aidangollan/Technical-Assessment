import React, { useState } from 'react';
import { Filters } from '../constants/filter';
import { FilterType } from '../types/filter';
import { getPreviewStyle } from '../utils/filter';

interface FilterMenuProps {
  loading: boolean;
  handleRequestVideo: (filterType: FilterType) => void;
  error?: string | null;
}

const FilterMenu: React.FC<FilterMenuProps> = ({
  loading,
  handleRequestVideo,
  error,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('gray');

  const handleFilterSelect = (filterType: FilterType) => {
    setSelectedFilter(filterType);
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-xl h-full flex flex-col overflow-hidden">
      <h3 className="m-0 mb-5 text-gray-800 text-xl font-semibold">Background Filters</h3>

      <div className="grid grid-cols-2 gap-3 flex-1 mb-5 overflow-y-auto min-h-0 auto-rows-fr p-4">
        {Filters.map((filter) => {
          const isSelected = selectedFilter === filter.type;
          return (
            <div
              key={filter.type}
              tabIndex={0}
              onClick={() => handleFilterSelect(filter.type)}
              className={`
                bg-gray-50 border-2 border-transparent rounded-xl p-3 cursor-pointer
                transition-all duration-300 ease-in-out hover:border-blue-500
                focus:outline-none focus:ring-2 focus:ring-blue-500
                ${isSelected
                  ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/20 ring-2 ring-blue-500'
                  : ''}
              `}
            >
              <div className="relative w-full h-16 rounded-md mb-2 flex-shrink-0 overflow-hidden">
                <div style={getPreviewStyle(filter.type)} />
                <h4
                  className={`absolute inset-0 z-10 flex items-center justify-center text-sm font-semibold ${
                    filter.type === 'invert' ? 'text-white' : 'text-gray-800'
                  }`}
                >
                  {filter.title}
                </h4>
              </div>
              <p className="m-0 text-xs text-gray-600 leading-tight overflow-hidden line-clamp-2 text-center">
                {filter.subtitle}
              </p>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-md text-sm">
          <div className="bg-red-50 text-red-700 border border-red-200 rounded p-2 mb-2">
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}

      <div className="flex items-center mt-auto pt-4 border-t border-gray-200 flex-shrink-0">
        <button
          onClick={() => handleRequestVideo(selectedFilter)}
          disabled={loading}
          className="mx-auto px-5 py-2.5 border-none rounded-md cursor-pointer text-sm transition-colors duration-300 bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Applying...' : 'Apply Filter'}
        </button>
      </div>
    </div>
  );
};

export default FilterMenu;
