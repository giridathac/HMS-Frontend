// Reusable page layout template for all screens
import React, { ReactNode } from 'react';
import { Card, CardContent } from '../ui/card';

interface PageLayoutProps {
  title: string;
  description?: string;
  headerActions?: ReactNode;
  children: ReactNode;
  scrollableContent?: boolean;
  contentClassName?: string;
}

export function PageLayout({
  title,
  description,
  headerActions,
  children,
  scrollableContent = false,
  contentClassName = '',
}: PageLayoutProps) {
  return (
    <div className="px-4 pt-4 pb-0 bg-blue-100 h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h1 className="text-gray-900 mb-0 text-xl">{title}</h1>
          {description && (
            <p className="text-gray-500 text-sm">{description}</p>
          )}
        </div>
        {headerActions && <div className="flex-shrink-0">{headerActions}</div>}
      </div>

      {scrollableContent ? (
        <Card className="flex-1 flex flex-col overflow-hidden min-h-0">
          <CardContent className={`p-1 flex-1 overflow-hidden flex flex-col min-h-0 ${contentClassName}`}>
            <div className="overflow-x-auto overflow-y-scroll border border-gray-200 rounded flex-1" style={{ maxHeight: 'calc(100vh - 80px)' }}>
              {children}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="flex-1 flex flex-col overflow-hidden min-h-0">
          <CardContent className={`p-1 flex-1 overflow-hidden flex flex-col min-h-0 ${contentClassName}`}>
            {children}
          </CardContent>
        </Card>
      )}
    </div>
  );
}


