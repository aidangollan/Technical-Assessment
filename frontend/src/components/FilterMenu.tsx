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

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    filterType: FilterType
  ) => {
    e.dataTransfer.setData('filter', filterType);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="bg-white rounded-xl p-4 lg:p-6 shadow-xl h-full flex flex-col overflow-hidden">
      <h3 className="m-0 mb-4 lg:mb-6 text-gray-800 text-lg lg:text-xl font-semibold">
        Background Filters
      </h3>

      <div className="flex-1 mb-4 lg:mb-6 overflow-y-auto min-h-0">
        <div className="grid grid-cols-2 grid-rows-4 gap-3 lg:gap-4 p-2 h-fit">
          {Filters.map((filter) => {
            const isSelected = selectedFilter === filter.type;
            return (
              <div
                key={filter.type}
                draggable
                onDragStart={(e) => handleDragStart(e, filter.type)}
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
                    className={`
                      absolute inset-0 z-10 flex items-center justify-center text-xs font-semibold transition-colors duration-300 ${
                        filter.type === 'invert'
                          ? 'text-white drop-shadow-md'
                          : 'text-gray-800 drop-shadow-sm'
                      }
                    `}
                  >
                    {filter.title}
                  </h4>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FilterMenu;