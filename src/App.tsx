import React, { useState, useEffect, Suspense, lazy } from 'react';
import { 
  LayoutDashboard, 
  ClipboardList,
  Stethoscope,
  BedDouble,
  Scissors,
  HeartPulse,
  TestTube,
  Siren,
  FileBarChart,
  Activity,
  Users,
  UserCog,
  Shield,
  Building2,
  UserPlus,
  FlaskConical,
  Receipt,
  Calendar
} from 'lucide-react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from './components/ui/resizable';
import { Tooltip, TooltipTrigger, TooltipContent } from './components/ui/tooltip';

// Lazy load components for code splitting
const Dashboard = lazy(() => import('./components/Dashboard').then(m => ({ default: m.Dashboard })));
const FrontDesk = lazy(() => import('./components/FrontDesk').then(m => ({ default: m.FrontDesk })));
const DoctorConsultation = lazy(() => import('./components/DoctorConsultation').then(m => ({ default: m.DoctorConsultation })));
const Admissions = lazy(() => import('./components/Admissions').then(m => ({ default: m.Admissions })));
const OTManagement = lazy(() => import('./components/OTManagement').then(m => ({ default: m.OTManagement })));
const ICUManagement = lazy(() => import('./components/ICUManagement').then(m => ({ default: m.ICUManagement })));
const Laboratory = lazy(() => import('./components/Laboratory').then(m => ({ default: m.Laboratory })));
const Emergency = lazy(() => import('./components/Emergency').then(m => ({ default: m.Emergency })));
const Reports = lazy(() => import('./components/Reports').then(m => ({ default: m.Reports })));
const Doctors = lazy(() => import('./components/Doctors').then(m => ({ default: m.Doctors })));
const StaffManagement = lazy(() => import('./components/Staff').then(m => ({ default: m.StaffManagement })));
const Roles = lazy(() => import('./components/Roles').then(m => ({ default: m.Roles })));
const Departments = lazy(() => import('./components/Departments').then(m => ({ default: m.Departments })));
const PatientRegistration = lazy(() => import('./components/PatientRegistration').then(m => ({ default: m.PatientRegistration })));
const RoomBeds = lazy(() => import('./components/RoomBeds').then(m => ({ default: m.RoomBeds })));
const LabTests = lazy(() => import('./components/LabTests').then(m => ({ default: m.LabTests })));
const BillManagement = lazy(() => import('./components/BillManagement').then(m => ({ default: m.BillManagement })));
const PatientAppointmentManagement = lazy(() => import('./components/PatientAppointmentManagement').then(m => ({ default: m.PatientAppointmentManagement })));
const OTRoomsManagement = lazy(() => import('./components/OTRoomsManagement').then(m => ({ default: m.OTRoomsManagement })));
const ICUBedsManagement = lazy(() => import('./components/ICUBedsManagement').then(m => ({ default: m.ICUBedsManagement })));
const EmergencyBedManagement = lazy(() => import('./components/EmergencyBedManagement').then(m => ({ default: m.EmergencyBedManagement })));
const SurgeryManagement = lazy(() => import('./components/SurgeryManagement').then(m => ({ default: m.SurgeryManagement })));
const ManageIPDAdmission = lazy(() => import('./components/ManageIPDAdmission').then(m => ({ default: m.ManageIPDAdmission })));
const PatientOTAllocationManagement = lazy(() => import('./components/PatientOTAllocationManagement').then(m => ({ default: m.PatientOTAllocationManagement })));

type View = 'dashboard' | 'frontdesk' | 'consultation' | 'admissions' | 'ot' | 'icu' | 'laboratory' | 'emergency' | 'reports' | 'doctors' | 'staff' | 'roles' | 'departments' | 'patientregistration' | 'roombeds' | 'labtests' | 'bills' | 'patientappointments' | 'otrooms' | 'icubeds' | 'emergencybeds' | 'surgerymanagement' | 'manageipdadmission' | 'patientotallocation';

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-blue-600">Loading...</p>
      </div>
    </div>
  );
}

export default function App() {
  // Check if we're in standalone mode (no sidebar) via URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const isStandalone = urlParams.get('standalone') === 'true';

  // Initialize from URL hash or default to dashboard
  const getViewFromHash = (): View => {
    const hash = window.location.hash.slice(1) || 'dashboard';
    // Extract view from hash (handle query parameters like #ot?otId=...)
    const viewName = hash.split('?')[0];
    const validViews: View[] = ['dashboard', 'frontdesk', 'consultation', 'admissions', 'ot', 'icu', 'laboratory', 'emergency', 'reports', 'doctors', 'staff', 'roles', 'departments', 'patientregistration', 'roombeds', 'labtests', 'bills', 'patientappointments', 'otrooms', 'icubeds', 'emergencybeds', 'surgerymanagement', 'manageipdadmission', 'patientotallocation'];
    return validViews.includes(viewName as View) ? (viewName as View) : 'dashboard';
  };

  const [currentView, setCurrentView] = useState<View>(getViewFromHash());
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [sidebarSize, setSidebarSize] = useState(isStandalone ? 0 : 16); // Default 16% of width, 0 if standalone

  // Sync URL hash with current view (preserve query parameters)
  useEffect(() => {
    const currentHash = window.location.hash.slice(1);
    const hasQueryParams = currentHash.includes('?');
    if (!hasQueryParams) {
      window.location.hash = currentView;
    }
  }, [currentView]);

  // Listen for hash changes (e.g., when opening in new tab)
  useEffect(() => {
    const handleHashChange = () => {
      const view = getViewFromHash();
      setCurrentView(view);
    };

    window.addEventListener('hashchange', handleHashChange);
    // Also check on initial load for URL parameters
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navItems = [
    { id: 'dashboard' as View, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'frontdesk' as View, label: 'Front Desk', icon: ClipboardList },
    { id: 'patientregistration' as View, label: 'Patient Registration', icon: UserPlus },
    { id: 'doctors' as View, label: 'Doctors', icon: Users },
    // { id: 'patientappointments' as View, label: 'Appointments', icon: Calendar }, // Hidden - can be removed later
    { id: 'consultation' as View, label: 'Doctor Consultation', icon: Stethoscope },
    { id: 'laboratory' as View, label: 'Laboratory', icon: TestTube },    
    { id: 'admissions' as View, label: 'Admissions (IPD)', icon: BedDouble },
    { id: 'ot' as View, label: 'OT Management', icon: Scissors },
    { id: 'otrooms' as View, label: 'OT Rooms Management', icon: Scissors },
    { id: 'surgerymanagement' as View, label: 'Surgery Procedures Mgmt', icon: Activity },
    { id: 'patientotallocation' as View, label: 'Patient OT Allocation', icon: Scissors },
    { id: 'icu' as View, label: 'ICU Management', icon: HeartPulse },
    { id: 'icubeds' as View, label: 'ICU Bed Management', icon: HeartPulse },
    { id: 'emergencybeds' as View, label: 'Emergency Bed Management', icon: BedDouble },
    { id: 'bills' as View, label: 'Bill Management', icon: Receipt },   
    
    { id: 'roles' as View, label: 'Roles', icon: Shield },
    { id: 'departments' as View, label: 'Departments', icon: Building2 },  
    { id: 'staff' as View, label: 'Staff', icon: UserCog },   
    { id: 'roombeds' as View, label: 'Room & Beds', icon: BedDouble },
    { id: 'labtests' as View, label: 'Lab Tests', icon: FlaskConical },    
    { id: 'emergency' as View, label: 'Emergency', icon: Siren },
     
    { id: 'reports' as View, label: 'Reports', icon: FileBarChart },
  ];


  return (
    <div className="flex h-screen bg-blue-50 overflow-x-hidden">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Sidebar Panel - Hidden in standalone mode */}
        {!isStandalone && (
          <>
            <ResizablePanel
              size={sidebarSize}
              minSize={8}
              maxSize={30}
              collapsible={true}
              collapsedSize={0}
              onResize={(size) => {
                setSidebarSize(size);
                setIsSidebarCollapsed(size === 0);
              }}
              className={`bg-blue-100 border-r border-blue-300 flex flex-col shadow-sm transition-all duration-300 overflow-hidden`}
            >
              {!isSidebarCollapsed && (
                <>
                  <div className="p-6 border-b border-blue-300 bg-blue-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="size-8 text-blue-700" />
                      <div>
                        <h1 className="text-blue-900 font-semibold">MediCare HMS</h1>
                        <p className="text-sm text-blue-700">Hospital Management</p>
                      </div>
                    </div>
                  </div>
                  
                  <nav className="flex-1 p-4 overflow-y-auto overflow-x-hidden bg-blue-100">
                    <ul className="space-y-0.5">
                      {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <li key={item.id}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <a
                                  href={`${window.location.origin}${window.location.pathname}?standalone=true#${item.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => {
                                    // Allow default behavior to open in new tab
                                    // Also update current view if clicked in same tab
                                    if (!e.ctrlKey && !e.metaKey) {
                                      e.preventDefault();
                                      setCurrentView(item.id);
                                    }
                                  }}
                                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                                    currentView === item.id
                                      ? 'bg-blue-200 text-blue-900 shadow-sm'
                                      : 'text-blue-800 hover:bg-blue-200'
                                  }`}
                                >
                                  <Icon className="size-5 flex-shrink-0" />
                                  <span className="truncate">{item.label}</span>
                                </a>
                              </TooltipTrigger>
                              <TooltipContent side="right" className="bg-gray-100 text-gray-900 border border-gray-300">
                                {item.label}
                              </TooltipContent>
                            </Tooltip>
                          </li>
                        );
                      })}
                    </ul>
                  </nav>

                  <div className="p-4 border-t border-blue-300 bg-blue-200">
                    <div className="flex items-center gap-3 px-4 py-3">
                      <div className="size-10 bg-blue-300 rounded-full flex items-center justify-center">
                        <span className="text-blue-800 font-semibold">AD</span>
                      </div>
                      <div>
                        <p className="text-sm text-blue-900 font-medium">Admin User</p>
                        <p className="text-xs text-blue-700">Superadmin</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </ResizablePanel>

            {/* Resize Handle - Thin Divider */}
            <ResizableHandle className="w-px bg-blue-300 hover:bg-blue-400 transition-colors cursor-col-resize" />
          </>
        )}

        {/* Main Content Panel */}
        <ResizablePanel defaultSize={isStandalone ? 100 : 84} minSize={70}>

          <main className={`h-full bg-blue-50 transition-all duration-300 flex flex-col ${
            currentView === 'dashboard' || currentView === 'frontdesk' || currentView === 'icu' || currentView === 'otrooms' || currentView === 'icubeds' || currentView === 'emergencybeds' || currentView === 'patientregistration' || currentView === 'surgerymanagement' || currentView === 'manageipdadmission'
              ? 'overflow-hidden' 
              : 'overflow-auto overflow-x-hidden'
          }`}>
            <Suspense fallback={<LoadingFallback />}>
              {currentView === 'dashboard' && <Dashboard />}
              {currentView === 'frontdesk' && <FrontDesk />}
              {currentView === 'patientregistration' && <PatientRegistration />}
              {currentView === 'doctors' && <Doctors />}
              {currentView === 'staff' && <StaffManagement />}
              {currentView === 'roles' && <Roles />}
              {currentView === 'departments' && <Departments />}
              {currentView === 'roombeds' && <RoomBeds />}
              {currentView === 'labtests' && <LabTests />}
              {currentView === 'consultation' && <DoctorConsultation />}
              {currentView === 'admissions' && <Admissions />}
              {currentView === 'ot' && <OTManagement />}
              {currentView === 'otrooms' && <OTRoomsManagement />}
              {currentView === 'surgerymanagement' && <SurgeryManagement />}
              {currentView === 'patientotallocation' && <PatientOTAllocationManagement />}
              {currentView === 'icu' && <ICUManagement />}
              {currentView === 'icubeds' && <ICUBedsManagement />}
              {currentView === 'emergencybeds' && <EmergencyBedManagement />}
              {currentView === 'bills' && <BillManagement />}
              {currentView === 'patientappointments' && <PatientAppointmentManagement />}
              {currentView === 'laboratory' && <Laboratory />}
              {currentView === 'emergency' && <Emergency />}
              {currentView === 'reports' && <Reports />}
              {currentView === 'manageipdadmission' && <ManageIPDAdmission />}
            </Suspense>
          </main>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}