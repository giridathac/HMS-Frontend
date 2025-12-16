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
const DoctorConsultation = lazy(() => import('./components/DoctorConsultation').then(m => ({ default: m.DoctorConsultation })));
const Admissions = lazy(() => import('./components/Admissions').then(m => ({ default: m.Admissions })));
const ICUManagement = lazy(() => import('./components/ICUManagement').then(m => ({ default: m.ICUManagement })));
const Laboratory = lazy(() => import('./components/Laboratory').then(m => ({ default: m.Laboratory })));
const Emergency = lazy(() => import('./components/Emergency').then(m => ({ default: m.Emergency })));
const Reports = lazy(() => import('./components/Reports').then(m => ({ default: m.Reports })));
const Doctors = lazy(() => import('./components/Doctors').then(m => ({ default: m.Doctors })));
const StaffManagement = lazy(() => import('./components/Staff').then(m => ({ default: m.StaffManagement })));
const Roles = lazy(() => import('./components/Roles').then(m => ({ default: m.Roles })));
const Departments = lazy(() => import('./components/Departments').then(m => ({ default: m.Departments })));
const PatientRegistration = lazy(() => import('./components/PatientRegistration').then(m => ({ default: m.PatientRegistration })));
const FrontDesk = lazy(() => import('./components/FrontDesk').then(m => ({ default: m.FrontDesk })));
const RoomBeds = lazy(() => import('./components/RoomBeds').then(m => ({ default: m.RoomBeds })));
const LabTests = lazy(() => import('./components/LabTests').then(m => ({ default: m.LabTests })));
const BillManagement = lazy(() => import('./components/BillManagement').then(m => ({ default: m.BillManagement })));
const PatientAppointmentManagement = lazy(() => import('./components/PatientAppointmentManagement').then(m => ({ default: m.PatientAppointmentManagement })));
const OTRoomsManagement = lazy(() => import('./components/OTRoomsManagement').then(m => ({ default: m.OTRoomsManagement })));
const ICUBedsManagement = lazy(() => import('./components/ICUBedsManagement').then(m => ({ default: m.ICUBedsManagement })));
const EmergencyBedManagement = lazy(() => import('./components/EmergencyBedManagement').then(m => ({ default: m.EmergencyBedManagement })));
//const SurgeryManagement = lazy(() => import('./components/SurgeryManagement').then(m => ({ default: m.SurgeryManagement })));
const ManageIPDAdmission = lazy(() => import('./components/ManageIPDAdmission').then(m => ({ default: m.ManageIPDAdmission })));
const ManageICUCase = lazy(() => import('./components/ManageICUCase').then(m => ({ default: m.ManageICUCase })));
const ICUNurseVisitVitals = lazy(() => import('./components/ICUNurseVisitVitals').then(m => ({ default: m.ICUNurseVisitVitals })));
const PatientOTAllocationManagement = lazy(() => import('./components/PatientOTAllocationManagement').then(m => ({ default: m.PatientOTAllocationManagement })));
const EmergencyAdmissionManagement = lazy(() => import('./components/EmergencyAdmissionManagement').then(m => ({ default: m.EmergencyAdmissionManagement })));
const ManageEmergencyAdmission = lazy(() => import('./components/ManageEmergencyAdmission').then(m => ({ default: m.ManageEmergencyAdmission })));
const ManageEmergencyAdmissionVitals = lazy(() => import('./components/ManageEmergencyAdmissionVitals').then(m => ({ default: m.ManageEmergencyAdmissionVitals })));

type View = 'dashboard' | 'frontdesk' | 'consultation' | 'admissions' | 'ot' | 'icu' | 'laboratory' | 'emergency' | 'reports' | 'doctors' | 'staff' | 'roles' | 'departments' | 'patientregistration' | 'roombeds' | 'labtests' | 'bills' | 'patientappointments' | 'otrooms' | 'icubeds' | 'emergencybeds' | 'surgerymanagement' | 'manageipdadmission' | 'manageicucase' | 'icunursevisitvitals' | 'patientotallocation' | 'emergencyadmission' | 'manageemergencyadmission' | 'manageemergencyadmissionvitals';

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
    const validViews: View[] = ['dashboard', 'frontdesk', 'consultation', 'admissions', 'ot', 'icu', 'laboratory', 'emergency', 'reports', 'doctors', 'staff', 'roles', 'departments', 'patientregistration', 'roombeds', 'labtests', 'bills', 'patientappointments', 'otrooms', 'icubeds', 'emergencybeds', 'surgerymanagement', 'manageipdadmission', 'manageicucase', 'icunursevisitvitals', 'patientotallocation', 'emergencyadmission', 'manageemergencyadmission', 'manageemergencyadmissionvitals'];
    const extractedView = validViews.includes(viewName as View) ? (viewName as View) : 'dashboard';
    console.log('getViewFromHash: hash=', hash, 'viewName=', viewName, 'extractedView=', extractedView);
    return extractedView;
  };

  const [currentView, setCurrentView] = useState<View>(getViewFromHash());
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [sidebarSize, setSidebarSize] = useState(isStandalone ? 0 : 16); // Default 16% of width, 0 if standalone

  // Sync URL hash with current view (preserve query parameters)
  useEffect(() => {
    const currentHash = window.location.hash.slice(1);
    const viewName = currentHash.split('?')[0];
    const hasQueryParams = currentHash.includes('?');
    const viewFromHash = viewName;
    // Only sync if the hash doesn't match the current view and has no query params
    // This prevents overriding programmatic hash changes
    // Also skip if we're navigating to a manage page (has query params)
    if (!hasQueryParams && viewName !== currentView && !currentView.includes('manage')) {
      window.location.hash = currentView;
    } else if (hasQueryParams && viewFromHash !== currentView) {
      // If hash has query params but view doesn't match, update view part only
      const queryParams = currentHash.split('?')[1] || '';
      console.log('App: Updating hash view part while preserving query params');
      window.location.hash = `${currentView}${queryParams ? '?' + queryParams : ''}`;
    } else {
      console.log('App: Hash and view are in sync, no update needed');
    }
  }, [currentView]);

  // Listen for hash changes (e.g., when opening in new tab)
  useEffect(() => {
    const handleHashChange = () => {
      console.log('App: Hash change detected');
      console.log('Current hash:', window.location.hash);
      const view = getViewFromHash();
      setCurrentView(view);
      console.log('Updated currentView to:', view);
    };

    window.addEventListener('hashchange', handleHashChange);
    // Also check on initial load for URL parameters
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navItems = [
    { id: 'dashboard' as View, label: 'Dashboard', icon: LayoutDashboard, color: 'text-blue-600' },
    { id: 'frontdesk' as View, label: 'Front Desk', icon: ClipboardList, color: 'text-gray-600' },
    { id: 'patientregistration' as View, label: 'Patient Registration', icon: UserPlus, color: 'text-indigo-600' },
    { id: 'doctors' as View, label: 'Doctors', icon: Users, color: 'text-purple-600' },
    // { id: 'patientappointments' as View, label: 'Appointments', icon: Calendar }, // Hidden - can be removed later
    { id: 'consultation' as View, label: 'Doctor Consultation', icon: Stethoscope },
    { id: 'laboratory' as View, label: 'Laboratory Tests Management', icon: TestTube },    
    { id: 'admissions' as View, label: 'Admissions (IPD)', icon: BedDouble },
    // { id: 'ot' as View, label: 'OT Management', icon: Scissors },
    { id: 'otrooms' as View, label: 'OT Rooms Management', icon: Scissors },
    //{ id: 'surgerymanagement' as View, label: 'Surgery Procedures Mgmt', icon: Activity },
    { id: 'ot' as View, label: 'OT Management', icon: Scissors },
    { id: 'icu' as View, label: 'ICU Admissions', icon: HeartPulse },
    { id: 'icubeds' as View, label: 'ICU Bed Management', icon: HeartPulse },
    { id: 'emergencybeds' as View, label: 'Emergency Bed Management', icon: BedDouble },
    { id: 'emergencyadmission' as View, label: 'Emergency Admission', icon: Siren },
    { id: 'bills' as View, label: 'Bill Management', icon: Receipt },   
    
    { id: 'roles' as View, label: 'Roles', icon: Shield },
    { id: 'departments' as View, label: 'Departments', icon: Building2 },  
    { id: 'staff' as View, label: 'Staff', icon: UserCog },   
    { id: 'roombeds' as View, label: 'IPD Rooms&Beds Management', icon: BedDouble },
    { id: 'labtests' as View, label: 'Laboratory Management', icon: FlaskConical },    
    // { id: 'emergency' as View, label: 'Emergency', icon: Siren },
     
    { id: 'reports' as View, label: 'Reports', icon: FileBarChart, color: 'text-blue-700' },
  ];


  return (
    <div className="flex h-screen bg-white overflow-x-hidden">
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
              className={`bg-white border-r border-gray-200 flex flex-col shadow-sm transition-all duration-300 overflow-hidden`}
            >
              {!isSidebarCollapsed && (
                <>
                  {/* Header */}
                  <div className="px-6 py-8 border-b border-gray-200 bg-white">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <Activity className="size-10 text-blue-600" strokeWidth={2.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h1 className="text-lg font-normal text-gray-900 leading-tight">MediCare HMS</h1>
                        <p className="text-base text-gray-600 leading-tight mt-0.5">Hospital Management</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Navigation */}
                  <nav className="flex-1 px-5 py-5 overflow-y-auto overflow-x-hidden bg-white">
                    <ul className="space-y-2">
                      {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentView === item.id;
                        return (
                          <li key={item.id}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <a
                                  href={`${window.location.origin}${window.location.pathname}?standalone=true#${item.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => {
                                    if (!e.ctrlKey && !e.metaKey) {
                                      e.preventDefault();
                                      setCurrentView(item.id);
                                    }
                                  }}
                                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                                    isActive
                                      ? 'bg-gray-100 text-blue-600 shadow-sm'
                                      : 'text-gray-900 hover:bg-gray-50'
                                  }`}
                                >
                                  <Icon className={`size-6 flex-shrink-0 ${
                                    isActive ? 'text-blue-600' : item.color || 'text-gray-500'
                                  }`} strokeWidth={isActive ? 2.5 : 2} />
                                  <span className={`text-lg font-normal truncate ${
                                    isActive ? 'text-blue-600' : 'text-gray-900'
                                  }`}>{item.label}</span>
                                </a>
                              </TooltipTrigger>
                              <TooltipContent side="right" className="bg-gray-900 text-white text-sm px-2 py-1.5 border-0 shadow-lg">
                                {item.label}
                              </TooltipContent>
                            </Tooltip>
                          </li>
                        );
                      })}
                    </ul>
                  </nav>

                  {/* User Profile Footer */}
                  <div className="px-6 py-8 border-t border-gray-200 bg-white">
                    <div className="flex items-center gap-3">
                      <div className="size-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-bold text-blue-600">AD</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-lg font-normal text-gray-900 truncate leading-tight">Admin User</p>
                        <p className="text-base text-gray-600 truncate leading-tight mt-0.5">Administrator</p>
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

          <main className={`h-full bg-white transition-all duration-300 flex flex-col ${
            currentView === 'dashboard' || currentView === 'frontdesk' || currentView === 'icu' || currentView === 'otrooms' || currentView === 'icubeds' || currentView === 'emergencybeds' || currentView === 'patientregistration' || currentView === 'surgerymanagement' || currentView === 'manageipdadmission' || currentView === 'manageicucase' || currentView === 'icunursevisitvitals' || currentView === 'emergencyadmission' || currentView === 'manageemergencyadmission' || currentView === 'manageemergencyadmissionvitals' || currentView === 'labtests'
              ? 'overflow-hidden' 
              : 'overflow-auto overflow-x-hidden'
          }`}>
            <Suspense fallback={<LoadingFallback />}>
              {currentView === 'dashboard' && <Dashboard />}
              {currentView === 'patientregistration' && <PatientRegistration />}
              {currentView === 'frontdesk' && <FrontDesk />}
              {currentView === 'doctors' && <Doctors />}
              {currentView === 'staff' && <StaffManagement />}
              {currentView === 'roles' && <Roles />}
              {currentView === 'departments' && <Departments />}
              {currentView === 'roombeds' && <RoomBeds />}
              {currentView === 'labtests' && <LabTests />}
              {currentView === 'consultation' && <DoctorConsultation />}
              {currentView === 'admissions' && <Admissions />}
              {currentView === 'ot' && <PatientOTAllocationManagement />}
              {currentView === 'otrooms' && <OTRoomsManagement />}

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
              {currentView === 'manageicucase' && <ManageICUCase />}
              {currentView === 'icunursevisitvitals' && <ICUNurseVisitVitals />}
              {currentView === 'emergencyadmission' && (() => {
                console.log('App.tsx: Rendering EmergencyAdmissionManagement, currentView:', currentView);
                return <EmergencyAdmissionManagement />;
              })()}
              {currentView === 'manageemergencyadmission' && (() => {
                console.log('Rendering ManageEmergencyAdmission component');
                return <ManageEmergencyAdmission />;
              })()}
              {currentView === 'manageemergencyadmissionvitals' && <ManageEmergencyAdmissionVitals />}
            </Suspense>
          </main>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
