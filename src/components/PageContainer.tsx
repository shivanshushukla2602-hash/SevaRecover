import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * PageContainer provides a unified, perfectly aligned max-width container with
 * consistent left and right margins/padding across all pages in SevaRecover.
 */
export const PageContainer: React.FC<PageContainerProps> = ({ children, className = '' }) => {
  return (
    <div className={`ds-shell ${className}`}>
      {children}
    </div>
  );
};

export default PageContainer;
