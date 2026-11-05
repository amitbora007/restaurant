import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

export const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  totalItems,
  pageSize,
  itemLabel = 'items',
  className = '',
}) => {
  if (!totalItems || totalItems === 0) return null;

  const startItem = (currentPage - 1) * (pageSize || 1) + 1;
  const endItem = Math.min(currentPage * (pageSize || 1), totalItems);

  // Generate page numbers with smart ellipsis windowing
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }

    if (currentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  const pages = getPageNumbers();

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-4 ${className}`}
      aria-label="Pagination Navigation"
    >
      {/* Range and Total Counter */}
      <div className="text-xs text-muted-foreground order-2 sm:order-1 font-medium">
        Showing <span className="text-foreground font-semibold">{startItem}</span>–
        <span className="text-foreground font-semibold">{endItem}</span> of{' '}
        <span className="text-foreground font-semibold">{totalItems}</span> {itemLabel}
      </div>

      {/* Page Navigation Controls */}
      {totalPages > 1 && (
        <nav
          className="flex items-center gap-1.5 order-1 sm:order-2"
          role="navigation"
          aria-label="Page selection"
        >
          {/* Previous Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            aria-label="Go to previous page"
            className="h-8 px-2.5 text-xs gap-1 border-border/80 hover:bg-secondary hover:text-foreground hover:border-primary/50 disabled:opacity-40"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Prev</span>
          </Button>

          {/* Numbered Page Buttons */}
          <div className="flex items-center gap-1">
            {pages.map((p, idx) => {
              if (p === '...') {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="w-7 h-8 flex items-center justify-center text-xs text-muted-foreground select-none"
                    aria-hidden="true"
                  >
                    &hellip;
                  </span>
                );
              }

              const isActive = p === currentPage;
              return (
                <button
                  key={`page-${p}`}
                  type="button"
                  onClick={() => onPageChange(p)}
                  aria-label={`Page ${p}`}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-8 h-8 rounded-md text-xs font-semibold flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20 pointer-events-none'
                      : 'border border-border/80 bg-card text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-secondary'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>

          {/* Next Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            aria-label="Go to next page"
            className="h-8 px-2.5 text-xs gap-1 border-border/80 hover:bg-secondary hover:text-foreground hover:border-primary/50 disabled:opacity-40"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </nav>
      )}
    </div>
  );
};

export default Pagination;
