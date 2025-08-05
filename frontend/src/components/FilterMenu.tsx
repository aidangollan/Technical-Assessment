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
    <div className="bg-white rounded-xl p-4 lg:p-6 shadow-xl h-full flex flex-col overflow-hidden">
      <h3 className="m-0 mb-4 lg:mb-6 text-gray-800 text-lg lg:text-xl font-semibold">
        Background Filters
      </h3>

      <div className="flex-1 mb-4 lg:mb-6 overflow-y-auto min-h-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-4 p-2">
          {Filters.map((filter) => {
            const isSelected = selectedFilter === filter.type;
            return (
              <div
                key={filter.type}
                tabIndex={0}
                onClick={() => handleFilterSelect(filter.type)}
                className={`
                  bg-gray-50 border-2 border-transparent rounded-xl p-3 lg:p-4 cursor-pointer
                  transition-all duration-300 ease-in-out hover:border-blue-500 hover:shadow-md
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  transform hover:scale-[1.02] active:scale-[0.98]
                  ${isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/20 ring-2 ring-blue-500 scale-[1.02]'
                    : 'hover:bg-gray-100'}
                `}
              >
                <div className="relative w-full h-12 sm:h-14 lg:h-16 rounded-lg mb-2 lg:mb-3 flex-shrink-0 overflow-hidden shadow-sm">
                  <div 
                    className="absolute inset-0 transition-all duration-300"
                    style={getPreviewStyle(filter.type)} 
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-10 rounded-lg" />
                  <h4
                    className={`absolute inset-0 z-10 flex items-center justify-center text-xs sm:text-sm lg:text-sm font-semibold transition-colors duration-300 ${
                      filter.type === 'invert' ? 'text-white drop-shadow-md' : 'text-gray-800 drop-shadow-sm'
                    }`}
                  >
                    {filter.title}
                  </h4>
                </div>
                <p className="m-0 text-xs lg:text-sm text-gray-600 leading-tight text-center line-clamp-2">
                  {filter.subtitle}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="mb-4 flex-shrink-0">
          <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 rounded-full bg-red-200 flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 bg-red-500 rounded-full mx-auto mt-1"></div>
              </div>
              <div>
                <strong className="block mb-1">Error occurred:</strong>
                <span className="text-red-600">{error}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center mt-auto pt-4 border-t border-gray-200 flex-shrink-0">
        <button
          onClick={() => handleRequestVideo(selectedFilter)}
          disabled={loading}
          className={`
            mx-auto px-6 lg:px-8 py-2.5 lg:py-3 border-none rounded-lg cursor-pointer 
            text-sm lg:text-base font-medium transition-all duration-300 transform
            ${loading 
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
              : 'bg-blue-500 text-white hover:bg-blue-600 hover:shadow-lg hover:scale-105 active:scale-95'
            }
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          `}
        >
          <div className="flex items-center gap-2">
            {loading && (
              <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
            )}
            <span>{loading ? 'Applying Filter...' : 'Apply Filter'}</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default FilterMenu;