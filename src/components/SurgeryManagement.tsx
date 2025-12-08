import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Activity } from 'lucide-react';

export function SurgeryManagement() {
  return (
    <div className="px-4 pt-4 pb-4 bg-blue-100 h-screen flex flex-col overflow-hidden">
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div>
            <h1 className="text-gray-900 mb-0 text-xl">Surgery Procedures Mgmt</h1>
            <p className="text-gray-500 text-sm">Manage surgeries and surgical procedures</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        <Card className="flex-1 flex flex-col overflow-hidden min-h-0 mb-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="size-5" />
              Surgery Procedures Mgmt
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            <div className="text-center py-12 text-gray-500">
              Surgery Management content will be implemented here.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
