import { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { IncidentDetailsSidebar } from '../components/IncidentDetailsSidebar';
import { IncidentLogsPage } from './IncidentLogsPage';
import { CameraGridPage } from './CameraGridPage';
import { AnalyticsPage } from './AnalyticsPage';
import { SettingsPage } from './SettingsPage';
import { StaffManagementPage } from './StaffManagementPage';
import { InventoryLogPage } from './InventoryLogPage'
import { POSTerminalPage } from './POSTerminalPage'


export type TabName = 'Camera Grid' | 'Incident Logs' | 'Analytics' | 'Staff Management' | 'Settings';
export type CameraView = '2x2' | '3x3';

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<TabName>('Incident Logs');
  const [hasIncidentNotification, setHasIncidentNotification] = useState(false);
  const [shopliftingItems, setShopliftingItems] = useState<any[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [testVedio, setTestVedio] = useState('');


  // Fetch data in Dashboard so it persists across all tabs
  const fetchData = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8004/api/shoplifting/");
      const data = await res.json();
      // API returns a plain array, not paginated
      const items = Array.isArray(data) ? data : data.results || [];
      if (items.length > 0) {
        setShopliftingItems(items);
        const hasUnviewed = items.some((item: any) => !item.viewed);
        if (hasUnviewed) setHasIncidentNotification(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData(); // initial load
    const interval = setInterval(() => {
      fetchData();
    }, 3000); // poll every 3 seconds
    return () => clearInterval(interval);
  }, []);

  // Mark an item as viewed in DB and update local state immediately
  const markAsViewed = async (itemId: number) => {
    try {
      await fetch(`http://127.0.0.1:8004/api/shoplifting/${itemId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ viewed: true })
      });
      // Update local state right away so the UI reflects it
      setShopliftingItems(prev => {
        const updated = prev.map(item => item.id === itemId ? { ...item, viewed: true } : item);
        // Clear the sidebar red circle if no unviewed items remain
        const stillHasUnviewed = updated.some(item => !item.viewed);
        if (!stillHasUnviewed) setHasIncidentNotification(false);
        return updated;
      });
    } catch (err) {
      console.error("Failed to update viewed status", err);
    }
  };

  // When clicking an item in the notification sidebar
  const handleSelectItem = (itemId: number) => {
    setTestVedio('');
    setSelectedItemId(itemId);
    setActiveTab('Incident Logs');
  };

  const handleLogout = () => {
    alert("System Logout sequence initiated. Terminating session...");
  };

  const handleLockdown = () => {
    if (window.confirm("WARNING: Are you sure you want to initiate a FULL FACILITY LOCKDOWN?")) {
      alert("LOCKDOWN INITIATED. All external doors sealed. Alarm system activated.");
    }
  };

  const renderPage = () => {
    switch (activeTab) {
      case 'Incident Logs':
        return (
          <IncidentLogsPage
            testVedio={testVedio}
            setTestVedio={setTestVedio}
            items={shopliftingItems}
            selectedItemId={selectedItemId}
            setSelectedItemId={setSelectedItemId}
            onMarkViewed={markAsViewed}
          />
        );
      case 'Camera Grid':
        return <CameraGridPage />;
      case 'Analytics':
        return <AnalyticsPage />;
      case 'Inventory Log':
        return <InventoryLogPage />;
      case 'POS Terminal':
        return <POSTerminalPage />;
      case 'Staff Management':
        return <StaffManagementPage />;
      case 'Settings':
        return <SettingsPage />;
    }
  };

  return (
    <div className="flex h-screen bg-[#0b101a] text-slate-200 overflow-hidden font-sans">
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === 'Incident Logs') {
            setHasIncidentNotification(false);
          }
        }}
        onLogout={handleLogout}
        hasIncidentNotification={hasIncidentNotification}
      />

      {renderPage()}
      {activeTab === 'Incident Logs' && (
        <aside className={`border-l border-slate-800 bg-[#0f1522] flex flex-col shrink-0 ${activeTab === 'Incident Logs' ? 'w-[350px]' : 'w-80'}`}>

          <IncidentDetailsSidebar
            items={shopliftingItems}
            selectedItemId={selectedItemId}
            onSelectItem={handleSelectItem}
          />
        </aside>
      )}
    </div>
  );
};
