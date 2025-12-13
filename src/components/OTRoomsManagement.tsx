import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Scissors, Plus, Clock, Edit, Trash2, CheckCircle2, XCircle, ArrowLeft, Search } from 'lucide-react';
import { useOTRooms } from '../hooks/useOTRooms';
import { useOTSlots } from '../hooks/useOTSlots';
import { OTRoom, OTSlot } from '../types';

export function OTRoomsManagement() {
  // Fixed limit: load 5 records per page
  const initialLimit = 5;
  const { otRooms, loading, loadingMore, error, hasMore, total, createOTRoom, updateOTRoom, deleteOTRoom, loadMore } = useOTRooms(initialLimit);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedOTRoom, setSelectedOTRoom] = useState<OTRoom | null>(null);
  const [selectedOTId, setSelectedOTId] = useState<string | null>(null);
  const [tableSearchTerm, setTableSearchTerm] = useState('');
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Check URL for otId parameter (for opening in new tab)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const otIdFromUrl = urlParams.get('otId');
    if (otIdFromUrl) {
      setSelectedOTId(otIdFromUrl);
    }
  }, []);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    // Find the scrollable container (parent with ot-rooms-scrollable class)
    const scrollContainer = document.querySelector('.ot-rooms-scrollable') as HTMLElement;
    
    if (!scrollContainer) {
      console.warn('Scroll container not found');
      return;
    }

    const handleScroll = () => {
      if (!hasMore || loadingMore || loading) return;
      
      const container = scrollContainer;
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;
      const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
      
      // Load more when within 100px of bottom
      if (distanceFromBottom < 100) {
        console.log('Scroll detected near bottom - Loading more...', { distanceFromBottom, hasMore, loadingMore });
        loadMore();
      }
    };

    // Try Intersection Observer first
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && hasMore && !loadingMore && !loading) {
          console.log('Intersection detected - Loading more OT rooms...');
          loadMore();
        }
      },
      {
        root: scrollContainer,
        rootMargin: '50px',
        threshold: 0.1,
      }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    // Fallback: scroll event listener
    scrollContainer.addEventListener('scroll', handleScroll);

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, [hasMore, loadingMore, loading, loadMore]);
  const [formData, setFormData] = useState({
    otNo: '',
    otType: 'General',
    otName: '',
    otDescription: '',
    startTimeofDay: '08:00',
    endTimeofDay: '20:00',
    // createdBy will be auto-filled
    status: 'active' as OTRoom['status'],
  });

  const otTypeOptions = ['General', 'Cardiac', 'Orthopedic', 'Emergency', 'Neurosurgery', 'Pediatric'];

  const handleCreateOTRoom = async (data: {
    otNo: string;
    otType: string;
    otName: string;
    otDescription?: string;
    startTimeofDay: string;
    endTimeofDay: string;
    createdBy: string;
    status?: 'active' | 'inactive';
  }) => {
    try {
      await createOTRoom(data);
    } catch (err) {
      console.error('Failed to create OT room:', err);
      throw err;
    }
  };

  const handleUpdateOTRoom = async (id: number, data: Partial<{
    otNo: string;
    otType: string;
    otName: string;
    otDescription?: string;
    startTimeofDay: string;
    endTimeofDay: string;
    createdBy: string;
    status?: 'active' | 'inactive';
  }>) => {
    try {
      await updateOTRoom({ id, ...data });
    } catch (err) {
      console.error('Failed to update OT room:', err);
      throw err;
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this OT room? This action cannot be undone.')) {
      try {
        await deleteOTRoom(id);
      } catch (err) {
        console.error('Failed to delete OT room:', err);
      }
    }
  };

  const handleAddSubmit = async () => {
    if (!formData.otNo || !formData.otName || !formData.startTimeofDay || !formData.endTimeofDay) {
      alert('Please fill in all required fields.');
      return;
    }
    try {
      await handleCreateOTRoom({
        otNo: formData.otNo,
        otType: formData.otType,
        otName: formData.otName,
        otDescription: formData.otDescription || undefined,
        startTimeofDay: formData.startTimeofDay,
        endTimeofDay: formData.endTimeofDay,
        createdBy: '1', // Auto-filled from current user
        status: formData.status,
      });
      setIsAddDialogOpen(false);
      setFormData({
        otNo: '',
        otType: 'General',
        otName: '',
        otDescription: '',
        startTimeofDay: '08:00',
        endTimeofDay: '20:00',
        // createdBy will be auto-filled,
        status: 'active',
      });
    } catch (err) {
      // Error handled in parent
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedOTRoom) return;
    if (!formData.otNo || !formData.otName || !formData.startTimeofDay || !formData.endTimeofDay) {
      alert('Please fill in all required fields.');
      return;
    }
    try {
      await handleUpdateOTRoom(selectedOTRoom.id, {
        otNo: formData.otNo,
        otType: formData.otType,
        otName: formData.otName,
        otDescription: formData.otDescription || undefined,
        startTimeofDay: formData.startTimeofDay,
        endTimeofDay: formData.endTimeofDay,
        createdBy: selectedOTRoom.createdBy, // Keep original value
        status: formData.status,
      });
      setIsEditDialogOpen(false);
      setSelectedOTRoom(null);
      setFormData({
        otNo: '',
        otType: 'General',
        otName: '',
        otDescription: '',
        startTimeofDay: '08:00',
        endTimeofDay: '20:00',
        // createdBy will be auto-filled,
        status: 'active',
      });
    } catch (err) {
      // Error handled in parent
    }
  };

  const handleEdit = (otRoom: OTRoom) => {
    setSelectedOTRoom(otRoom);
    setFormData({
      otNo: otRoom.otNo,
      otType: otRoom.otType,
      otName: otRoom.otName,
      otDescription: otRoom.otDescription || '',
      startTimeofDay: otRoom.startTimeofDay,
      endTimeofDay: otRoom.endTimeofDay,
      createdBy: otRoom.createdBy,
      status: otRoom.status,
    });
    setIsEditDialogOpen(true);
  };

  const getStatusBadge = (status: OTRoom['status']) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"><CheckCircle2 className="size-3" />Active</span>;
      case 'inactive':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"><XCircle className="size-3" />Inactive</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 flex flex-col overflow-hidden min-h-0 dashboard-scrollable" style={{ maxHeight: '100vh', minHeight: 0 }}>
        <div className="overflow-y-auto overflow-x-hidden flex-1 flex flex-col min-h-0">
          <div className="px-6 pt-6 pb-0 flex-shrink-0">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <div>
                <h1 className="text-gray-900 mb-2 text-2xl">OT Rooms Management</h1>
                <p className="text-gray-500 text-base">Manage operation theater rooms and their configurations</p>
              </div>
            </div>
          </div>
          <div className="px-6 pt-4 pb-4 flex-1">
            <div className="text-center py-12 text-gray-600">Loading OT rooms...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 bg-gray-50 flex flex-col overflow-hidden min-h-0 dashboard-scrollable" style={{ maxHeight: '100vh', minHeight: 0 }}>
        <div className="overflow-y-auto overflow-x-hidden flex-1 flex flex-col min-h-0">
          <div className="px-6 pt-6 pb-0 flex-shrink-0">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <div>
                <h1 className="text-gray-900 mb-2 text-2xl">OT Rooms Management</h1>
                <p className="text-gray-500 text-base">Manage operation theater rooms and their configurations</p>
              </div>
            </div>
          </div>
          <div className="px-6 pt-4 pb-4 flex-1">
            <div className="text-center py-12 text-red-600">Error: {error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 flex flex-col overflow-hidden min-h-0 dashboard-scrollable" style={{ maxHeight: '100vh', minHeight: 0 }}>
      <div className="overflow-y-auto overflow-x-hidden flex-1 flex flex-col min-h-0">
        <div className="px-6 pt-6 pb-0 flex-shrink-0">
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <div>
              <h1 className="text-gray-900 mb-2 text-2xl">OT Rooms Management</h1>
              <p className="text-gray-500 text-base">Manage operation theater rooms and their configurations</p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="size-4" />
                  Add OT Room
                </Button>
              </DialogTrigger>
              <DialogContent className="p-0 gap-0 large-dialog bg-white">
                <DialogHeader className="px-6 pt-4 pb-3 flex-shrink-0 bg-white">
                  <DialogTitle className="text-gray-700">Add New OT Room</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto px-6 pb-1 patient-list-scrollable min-h-0 bg-white">
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="otNo" className="text-gray-600">OT No</Label>
                        <Input
                          id="otNo"
                          placeholder="e.g., OT001"
                          value={formData.otNo}
                          onChange={(e) => setFormData({ ...formData, otNo: e.target.value })}
                          className="text-gray-700"
                        />
                      </div>
                      <div>
                        <Label htmlFor="otType" className="text-gray-600">OT Type</Label>
                        <select
                          id="otType"
                          aria-label="OT Type"
                          className="w-full px-3 py-2 border border-gray-200 rounded-md text-gray-700"
                          value={formData.otType}
                          onChange={(e) => setFormData({ ...formData, otType: e.target.value })}
                        >
                          {otTypeOptions.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="otName" className="text-gray-600">OT Name</Label>
                      <Input
                        id="otName"
                        placeholder="e.g., General Operation Theater 1"
                        value={formData.otName}
                        onChange={(e) => setFormData({ ...formData, otName: e.target.value })}
                        className="text-gray-700"
                      />
                    </div>
                    <div>
                      <Label htmlFor="otDescription" className="text-gray-600">OT Description</Label>
                      <Textarea
                        id="otDescription"
                        placeholder="Enter OT room description..."
                        value={formData.otDescription}
                        onChange={(e) => setFormData({ ...formData, otDescription: e.target.value })}
                        rows={3}
                        className="text-gray-700"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div>
                        <Label htmlFor="startTimeofDay" className="flex items-center gap-2 text-gray-600">
                          <Clock className="size-4" />
                          Start Time of Day
                        </Label>
                        <Input
                          id="startTimeofDay"
                          type="time"
                          value={formData.startTimeofDay}
                          onChange={(e) => setFormData({ ...formData, startTimeofDay: e.target.value })}
                          className="text-gray-700"
                        />
                      </div>
                      <div>
                        <Label htmlFor="endTimeofDay" className="flex items-center gap-2 text-gray-600">
                          <Clock className="size-4" />
                          End Time of Day
                        </Label>
                        <Input
                          id="endTimeofDay"
                          type="time"
                          value={formData.endTimeofDay}
                          onChange={(e) => setFormData({ ...formData, endTimeofDay: e.target.value })}
                          className="text-gray-700"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="status" className="text-gray-600">Status</Label>
                      <select
                        id="status"
                        aria-label="Status"
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-gray-700"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as OTRoom['status'] })}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 px-6 py-2 border-t bg-white flex-shrink-0">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="py-1">Cancel</Button>
                  <Button onClick={handleAddSubmit} className="py-1">Add OT Room</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="px-6 pt-4 pb-4 flex-1">
        {/* OT Rooms Cards */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Operating Rooms</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {otRooms.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-500 text-sm">
                No OT rooms found. Add a new OT room to get started.
              </div>
            ) : (
              otRooms.map((otRoom) => (
                <Card
                  key={otRoom.id}
                  className="bg-white border border-gray-200 shadow-sm rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedOTId(otRoom.otId)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">{otRoom.otNo}</h3>
                        <p className="text-xs text-gray-500">{otRoom.otName}</p>
                      </div>
                      {getStatusBadge(otRoom.status)}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-600 font-medium">Type:</span>
                        <span className="text-gray-900">{otRoom.otType}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="size-4 text-gray-600" />
                        <span className="text-gray-700">
                          {otRoom.startTimeofDay} - {otRoom.endTimeofDay}
                        </span>
                      </div>
                      
                      {otRoom.otDescription && (
                        <p className="text-xs text-gray-600 line-clamp-2 mt-2">
                          {otRoom.otDescription}
                        </p>
                      )}
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOTId(otRoom.otId);
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View Slots →
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* OT Rooms Table */}
        <Card className="bg-white border border-gray-200 shadow-sm rounded-lg mb-4">
          <CardContent className="p-6">
            {/* Search Filter */}
            <Card className="mb-6 bg-white">
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                  <Input
                    placeholder="Search by OT ID, OT No, type, name, description, time, or status..."
                    value={tableSearchTerm}
                    onChange={(e) => setTableSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-50"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-6 text-gray-700">OT ID</th>
                    <th className="text-left py-4 px-6 text-gray-700">OT No</th>
                    <th className="text-left py-4 px-6 text-gray-700">Type</th>
                    <th className="text-left py-4 px-6 text-gray-700">OT Name</th>
                    <th className="text-left py-4 px-6 text-gray-700">Description</th>
                    <th className="text-left py-4 px-6 text-gray-700">Start Time</th>
                    <th className="text-left py-4 px-6 text-gray-700">End Time</th>
                    <th className="text-left py-4 px-6 text-gray-700">Status</th>
                    <th className="text-left py-4 px-6 text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    // Filter rooms based on search term
                    const filteredRooms = tableSearchTerm.trim()
                      ? otRooms.filter((otRoom) => {
                          const searchLower = tableSearchTerm.toLowerCase().trim();
                          
                          // Search in all relevant fields
                          const otId = otRoom.otId ? String(otRoom.otId).toLowerCase() : '';
                          const otNo = otRoom.otNo ? String(otRoom.otNo).toLowerCase() : '';
                          const otType = otRoom.otType ? String(otRoom.otType).toLowerCase() : '';
                          const otName = otRoom.otName ? String(otRoom.otName).toLowerCase() : '';
                          const otDescription = otRoom.otDescription ? String(otRoom.otDescription).toLowerCase() : '';
                          const startTime = otRoom.startTimeofDay ? String(otRoom.startTimeofDay).toLowerCase() : '';
                          const endTime = otRoom.endTimeofDay ? String(otRoom.endTimeofDay).toLowerCase() : '';
                          const status = otRoom.status ? String(otRoom.status).toLowerCase() : '';
                          
                          // Check if search term matches any field
                          return otId.includes(searchLower) ||
                                 otNo.includes(searchLower) ||
                                 otType.includes(searchLower) ||
                                 otName.includes(searchLower) ||
                                 otDescription.includes(searchLower) ||
                                 startTime.includes(searchLower) ||
                                 endTime.includes(searchLower) ||
                                 status.includes(searchLower);
                        })
                      : otRooms;
                    
                    if (filteredRooms.length === 0) {
                      return (
                        <tr>
                          <td colSpan={9} className="text-center py-8 text-gray-500 text-sm">
                            {tableSearchTerm.trim()
                              ? `No OT rooms found matching "${tableSearchTerm}"`
                              : "No OT rooms found. Add a new OT room to get started."}
                          </td>
                        </tr>
                      );
                    }
                    
                    return filteredRooms.map((otRoom) => (
                      <tr key={otRoom.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-6 text-gray-900 font-mono font-medium whitespace-nowrap">
                          <a
                            href={`#otrooms?otId=${encodeURIComponent(otRoom.otId)}`}
                            onClick={(e) => {
                              e.preventDefault();
                              setSelectedOTId(otRoom.otId);
                            }}
                            className="text-blue-600 hover:text-blue-800 hover:underline font-medium cursor-pointer"
                          >
                            {otRoom.otId}
                          </a>
                        </td>
                        <td className="py-4 px-6 text-gray-900 font-medium whitespace-nowrap">{otRoom.otNo}</td>
                        <td className="py-4 px-6 text-gray-600 whitespace-nowrap">{otRoom.otType}</td>
                        <td className="py-4 px-6 text-gray-600 whitespace-nowrap min-w-[150px]">{otRoom.otName}</td>
                        <td className="py-4 px-6 text-gray-600 max-w-xs break-words whitespace-normal">{otRoom.otDescription || '-'}</td>
                        <td className="py-4 px-6 text-gray-600 whitespace-nowrap">{otRoom.startTimeofDay}</td>
                        <td className="py-4 px-6 text-gray-600 whitespace-nowrap">{otRoom.endTimeofDay}</td>
                        <td className="py-4 px-6 whitespace-nowrap">{getStatusBadge(otRoom.status)}</td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(otRoom)}
                              className="h-7 w-7 p-0"
                              title="Edit OT Room"
                            >
                              <Edit className="size-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(otRoom.id)}
                              className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                              title="Delete OT Room"
                            >
                              <Trash2 className="size-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
              {/* Infinite scroll trigger */}
              {hasMore && (
                <div ref={loadMoreRef} className="py-4 text-center">
                  {loadingMore ? (
                    <div className="text-blue-600">Loading more rooms...</div>
                  ) : (
                    <div className="text-gray-400 text-sm">Scroll for more</div>
                  )}
                </div>
              )}
              {!hasMore && otRooms.length > 0 && (
                <div className="py-4 text-center text-gray-500 text-sm">
                  All {total} rooms loaded
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="p-0 gap-0 large-dialog bg-white">
            <DialogHeader className="px-6 pt-4 pb-3 flex-shrink-0 bg-white">
              <DialogTitle className="text-gray-700">Edit OT Room</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-6 pb-1 patient-list-scrollable min-h-0 bg-white">
              <div className="space-y-4 py-4">
                {selectedOTRoom && (
                  <div>
                    <Label className="text-gray-600">OT ID</Label>
                    <Input
                      value={selectedOTRoom.otId}
                      disabled
                      className="bg-gray-50 text-gray-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">OT ID is auto-generated and cannot be changed</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-otNo" className="text-gray-600">OT No</Label>
                    <Input
                      id="edit-otNo"
                      placeholder="e.g., OT001"
                      value={formData.otNo}
                      onChange={(e) => setFormData({ ...formData, otNo: e.target.value })}
                      className="text-gray-700"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-otType" className="text-gray-600">OT Type</Label>
                    <select
                      id="edit-otType"
                      aria-label="OT Type"
                      className="w-full px-3 py-2 border border-gray-200 rounded-md text-gray-700"
                      value={formData.otType}
                      onChange={(e) => setFormData({ ...formData, otType: e.target.value })}
                    >
                      {otTypeOptions.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-otName" className="text-gray-600">OT Name</Label>
                  <Input
                    id="edit-otName"
                    placeholder="e.g., General Operation Theater 1"
                    value={formData.otName}
                    onChange={(e) => setFormData({ ...formData, otName: e.target.value })}
                    className="text-gray-700"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-otDescription" className="text-gray-600">OT Description</Label>
                  <Textarea
                    id="edit-otDescription"
                    placeholder="Enter OT room description..."
                    value={formData.otDescription}
                    onChange={(e) => setFormData({ ...formData, otDescription: e.target.value })}
                    rows={3}
                    className="text-gray-700"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div>
                    <Label htmlFor="edit-startTimeofDay" className="flex items-center gap-2 text-gray-600">
                      <Clock className="size-4" />
                      Start Time of Day
                    </Label>
                    <Input
                      id="edit-startTimeofDay"
                      type="time"
                      value={formData.startTimeofDay}
                      onChange={(e) => setFormData({ ...formData, startTimeofDay: e.target.value })}
                      className="text-gray-700"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-endTimeofDay" className="flex items-center gap-2 text-gray-600">
                      <Clock className="size-4" />
                      End Time of Day
                    </Label>
                    <Input
                      id="edit-endTimeofDay"
                      type="time"
                      value={formData.endTimeofDay}
                      onChange={(e) => setFormData({ ...formData, endTimeofDay: e.target.value })}
                      className="text-gray-700"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-status" className="text-gray-600">Status</Label>
                  <select
                    id="edit-status"
                    aria-label="Status"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-gray-700"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as OTRoom['status'] })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-2 border-t bg-white flex-shrink-0">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="py-1">Cancel</Button>
              <Button onClick={handleEditSubmit} className="py-1">Update OT Room</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* OT Slots Dialog */}
        {selectedOTId && (
          <OTSlotsManagement 
            otId={selectedOTId}
            otRoom={otRooms.find(r => r.otId === selectedOTId) || null}
            onClose={() => setSelectedOTId(null)} 
          />
        )}
      </div>
    </div>
  );
}

function OTSlotsManagement({ otId, otRoom, onClose }: { otId: string; otRoom: OTRoom | null; onClose: () => void }) {
  const { otSlots, loading, error, createOTSlot, updateOTSlot, deleteOTSlot } = useOTSlots(otId);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedOTSlot, setSelectedOTSlot] = useState<OTSlot | null>(null);
  const [formData, setFormData] = useState({
    otSlotNo: '',
    slotStartTime: '',
    slotEndTime: '',
    status: 'Active' as OTSlot['status'],
  });

  const handleCreateOTSlot = async (data: {
    otId: string;
    otSlotNo: string;
    slotStartTime: string;
    slotEndTime: string;
    status?: 'Active' | 'Inactive';
  }) => {
    try {
      await createOTSlot(data);
    } catch (err) {
      console.error('Failed to create OT slot:', err);
      throw err;
    }
  };

  const handleUpdateOTSlot = async (id: number, data: Partial<{
    otSlotNo: string;
    slotStartTime: string;
    slotEndTime: string;
    status?: 'Active' | 'Inactive';
  }>) => {
    try {
      await updateOTSlot({ id, ...data });
    } catch (err) {
      console.error('Failed to update OT slot:', err);
      throw err;
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this OT slot? This action cannot be undone.')) {
      try {
        await deleteOTSlot(id);
      } catch (err) {
        console.error('Failed to delete OT slot:', err);
      }
    }
  };

  const handleAddSubmit = async () => {
    if (!formData.otSlotNo || !formData.slotStartTime || !formData.slotEndTime) {
      alert('Please fill in all required fields.');
      return;
    }
    try {
      await handleCreateOTSlot({
        otId: otId,
        otSlotNo: formData.otSlotNo,
        slotStartTime: formData.slotStartTime,
        slotEndTime: formData.slotEndTime,
        status: formData.status,
      });
      setIsAddDialogOpen(false);
      setFormData({
        otSlotNo: '',
        slotStartTime: '',
        slotEndTime: '',
        status: 'Active',
      });
    } catch (err) {
      // Error handled in parent
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedOTSlot) return;
    if (!formData.otSlotNo || !formData.slotStartTime || !formData.slotEndTime) {
      alert('Please fill in all required fields.');
      return;
    }
    try {
      await handleUpdateOTSlot(selectedOTSlot.id, {
        otSlotNo: formData.otSlotNo,
        slotStartTime: formData.slotStartTime,
        slotEndTime: formData.slotEndTime,
        status: formData.status,
      });
      setIsEditDialogOpen(false);
      setSelectedOTSlot(null);
      setFormData({
        otSlotNo: '',
        slotStartTime: '',
        slotEndTime: '',
        status: 'Active',
      });
    } catch (err) {
      // Error handled in parent
    }
  };

  const handleEdit = (otSlot: OTSlot) => {
    setSelectedOTSlot(otSlot);
    setFormData({
      otSlotNo: otSlot.otSlotNo,
      slotStartTime: otSlot.slotStartTime,
      slotEndTime: otSlot.slotEndTime,
      status: otSlot.status,
    });
    setIsEditDialogOpen(true);
  };

  const getStatusBadge = (status: OTSlot['status']) => {
    switch (status) {
      case 'Active':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"><CheckCircle2 className="size-3" />Active</span>;
      case 'Inactive':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"><XCircle className="size-3" />Inactive</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  if (loading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="p-0 gap-0 large-dialog max-w-4xl max-h-[90vh]">
          <DialogHeader className="px-6 pt-4 pb-3 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                  <ArrowLeft className="size-4" />
                </Button>
                <DialogTitle>
                  {otRoom ? `OT Slots for ${otRoom.otName} (${otId})` : `OT Slots for ${otId}`}
                </DialogTitle>
              </div>
              <Button className="flex items-center gap-2" onClick={(e) => {
                e.stopPropagation();
                setIsAddDialogOpen(true);
              }}>
                <Plus className="size-4" />
                Add OT Slot
              </Button>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 pb-1 patient-list-scrollable min-h-0">
            <div className="text-center py-12 text-gray-600">Loading OT slots...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // On error, show blank screen with header and add button
  // (error is logged to console but not displayed to user)

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="p-0 gap-0 large-dialog max-w-4xl max-h-[90vh]">
        <DialogHeader className="px-6 pt-4 pb-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                <ArrowLeft className="size-4" />
              </Button>
              <DialogTitle>
                {otRoom ? `OT Slots for ${otRoom.otName} (${otId})` : `OT Slots for ${otId}`}
              </DialogTitle>
            </div>
            <Button className="flex items-center gap-2" onClick={(e) => {
              e.stopPropagation();
              setIsAddDialogOpen(true);
            }}>
              <Plus className="size-4" />
              Add OT Slot
            </Button>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6 pb-1 patient-list-scrollable min-h-0">
          <div className="space-y-4 py-4">
          {/* Show table only if no error and not loading */}
          {!error && !loading && (
            <Card className="bg-white border border-gray-200 shadow-sm rounded-lg">
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-4 px-6 text-gray-700">OT Slot ID</th>
                        <th className="text-left py-4 px-6 text-gray-700">OT ID</th>
                        <th className="text-left py-4 px-6 text-gray-700">OT Slot No</th>
                        <th className="text-left py-4 px-6 text-gray-700">Slot Start Time</th>
                        <th className="text-left py-4 px-6 text-gray-700">Slot End Time</th>
                        <th className="text-left py-4 px-6 text-gray-700">Status</th>
                        <th className="text-left py-4 px-6 text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {otSlots.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-8 text-gray-500 text-sm">
                            No OT slots found. Add a new OT slot to get started.
                          </td>
                        </tr>
                      ) : (
                        otSlots.map((otSlot) => (
                          <tr key={otSlot.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-4 px-6 text-gray-900 font-mono font-medium whitespace-nowrap">{otSlot.otSlotId}</td>
                            <td className="py-4 px-6 text-gray-900 font-mono font-medium whitespace-nowrap">{otSlot.otId}</td>
                            <td className="py-4 px-6 text-gray-600 whitespace-nowrap">{otSlot.otSlotNo}</td>
                            <td className="py-4 px-6 text-gray-600 whitespace-nowrap">{otSlot.slotStartTime}</td>
                            <td className="py-4 px-6 text-gray-600 whitespace-nowrap">{otSlot.slotEndTime}</td>
                            <td className="py-4 px-6 whitespace-nowrap">{getStatusBadge(otSlot.status)}</td>
                            <td className="py-4 px-6 whitespace-nowrap">
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(otSlot)}
                                  className="h-7 w-7 p-0"
                                  title="Edit OT Slot"
                                >
                                  <Edit className="size-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(otSlot.id)}
                                  className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                                  title="Delete OT Slot"
                                >
                                  <Trash2 className="size-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
          </div>
        </div>

        {/* Add Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="p-0 gap-0 large-dialog max-w-2xl max-h-[90vh]">
            <DialogHeader className="px-6 pt-4 pb-3 flex-shrink-0">
              <DialogTitle>Add New OT Slot</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-6 pb-1 patient-list-scrollable min-h-0">
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="otSlotNo">OT Slot No *</Label>
                  <Input
                    id="otSlotNo"
                    placeholder="e.g., SL01"
                    value={formData.otSlotNo}
                    onChange={(e) => setFormData({ ...formData, otSlotNo: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="slotStartTime" className="flex items-center gap-2">
                      <Clock className="size-4" />
                      Slot Start Time *
                    </Label>
                    <Input
                      id="slotStartTime"
                      placeholder="e.g., 9:00 AM"
                      value={formData.slotStartTime}
                      onChange={(e) => setFormData({ ...formData, slotStartTime: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="slotEndTime" className="flex items-center gap-2">
                      <Clock className="size-4" />
                      Slot End Time *
                    </Label>
                    <Input
                      id="slotEndTime"
                      placeholder="e.g., 10:00 AM"
                      value={formData.slotEndTime}
                      onChange={(e) => setFormData({ ...formData, slotEndTime: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    aria-label="Status"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as OTSlot['status'] })}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-2 border-t bg-gray-50 flex-shrink-0">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="py-1">Cancel</Button>
              <Button onClick={handleAddSubmit} className="py-1">Add OT Slot</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="p-0 gap-0 large-dialog max-w-2xl max-h-[90vh]">
            <DialogHeader className="px-6 pt-4 pb-3 flex-shrink-0">
              <DialogTitle>Edit OT Slot</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-6 pb-1 patient-list-scrollable min-h-0">
              <div className="space-y-4 py-4">
                {selectedOTSlot && (
                  <div>
                    <Label>OT Slot ID</Label>
                    <Input
                      value={selectedOTSlot.otSlotId}
                      disabled
                      className="bg-gray-50 text-gray-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">OT Slot ID is auto-generated and cannot be changed</p>
                  </div>
                )}
                <div>
                  <Label htmlFor="edit-otSlotNo">OT Slot No *</Label>
                  <Input
                    id="edit-otSlotNo"
                    placeholder="e.g., SL01"
                    value={formData.otSlotNo}
                    onChange={(e) => setFormData({ ...formData, otSlotNo: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-slotStartTime" className="flex items-center gap-2">
                      <Clock className="size-4" />
                      Slot Start Time *
                    </Label>
                    <Input
                      id="edit-slotStartTime"
                      placeholder="e.g., 9:00 AM"
                      value={formData.slotStartTime}
                      onChange={(e) => setFormData({ ...formData, slotStartTime: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-slotEndTime" className="flex items-center gap-2">
                      <Clock className="size-4" />
                      Slot End Time *
                    </Label>
                    <Input
                      id="edit-slotEndTime"
                      placeholder="e.g., 10:00 AM"
                      value={formData.slotEndTime}
                      onChange={(e) => setFormData({ ...formData, slotEndTime: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-status">Status</Label>
                  <select
                    id="edit-status"
                    aria-label="Status"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as OTSlot['status'] })}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-2 border-t bg-gray-50 flex-shrink-0">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="py-1">Cancel</Button>
              <Button onClick={handleEditSubmit} className="py-1">Update OT Slot</Button>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}

