
import React, { useState, useEffect } from 'react';
import { TableSession, TableGroup, OrderHistoryItem, TableStatus } from '../../../types';
import TableCard from './TableCard';
import TableDetailModal from './TableDetailModal';
import AdminAddTableModal from './AdminAddTableModal';
import AdminLocationManager from './AdminLocationManager';
import ToastContainer, { ToastMessage, ToastType } from '../../Toast';
import { useVat } from '../../../hooks/useVat'; // Import Hook

interface Props {
  tables: TableSession[];
  onNavigate: (path: string) => void;
  initialFilter?: string;
}

type TableFilter = 'All' | 'Occupied' | 'Free';

export default function AdminTableManager({ tables: initialTables, onNavigate, initialFilter = 'All' }: Props) {
  // Local state for tables to allow adding (mock persistence)
  const [tables, setTables] = useState<TableSession[]>(initialTables);
  const [filter, setFilter] = useState<TableFilter>(initialFilter as TableFilter);
  const [locationFilter, setLocationFilter] = useState<string>('All'); 
  
  // VAT Hook for finalizing unpaid orders on clear
  const { config: vatConfig } = useVat();

  // Selection State
  const [selectedTable, setSelectedTable] = useState<TableSession | null>(null);
  const [editingTable, setEditingTable] = useState<TableSession | null>(null);

  // Update tables whenever props change (vital for real-time updates from AdminApp)
  useEffect(() => {
      setTables(initialTables);
      
      // CRITICAL FIX: Keep the open modal (selectedTable) in sync with live data
      if (selectedTable) {
          const freshData = initialTables.find(t => t.id === selectedTable.id);
          // If table still exists, update the modal view with fresh data (e.g. new orders, payment status)
          // If table was deleted, close the modal
          if (freshData) {
              // Only update if there are meaningful changes to avoid jitter, but for clearing we want instant
              // Simple reference check isn't enough, but React handles state diffing well.
              setSelectedTable(freshData);
          } else {
              setSelectedTable(null);
          }
      }
  }, [initialTables]); // removed selectedTable from deps to avoid loop

  // Sync filter if prop changes (e.g. from Dashboard click)
  useEffect(() => {
      setFilter(initialFilter as TableFilter);
  }, [initialFilter]);
  
  // Modals Visibility
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLocationManager, setShowLocationManager] = useState(false);

  // Locations State
  const [locations, setLocations] = useState<string[]>(['Ground Floor', 'First Floor', 'Rooftop', 'Garden']);

  // Toast State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: ToastType, title: string, message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleAddLocation = (loc: string) => {
      if (!locations.includes(loc)) setLocations([...locations, loc]);
  };

  const handleDeleteLocation = (loc: string) => {
      setLocations(locations.filter(l => l !== loc));
      if (locationFilter === loc) setLocationFilter('All');
  };

  const handleSaveTable = (data: { id?: string, tableNumber: string, capacity: number, location: string, isSpecial: boolean }) => {
      const qrString = `${window.location.origin}/user?table=${data.tableNumber}&location=${encodeURIComponent(data.location)}`;

      if (data.id) {
          setTables(prev => prev.map(t => {
              if (t.id === data.id) {
                  return {
                      ...t,
                      tableNumber: data.tableNumber,
                      capacity: data.capacity,
                      location: data.location,
                      isSpecial: data.isSpecial,
                      qrCode: qrString 
                  };
              }
              return t;
          }));
          addToast('success', 'Table Updated', `${data.tableNumber} details have been updated successfully.`);
      } else {
          const newTable: TableSession = {
              id: `tbl-${Date.now()}`,
              tableNumber: data.tableNumber,
              status: 'free',
              capacity: data.capacity,
              guests: 0,
              location: data.location,
              isSpecial: data.isSpecial,
              qrCode: qrString,
              groups: [] // Added missing property
          };
          setTables(prev => [...prev, newTable]);
          addToast('success', 'Table Added', `${data.tableNumber} is now ready for service.`);
      }
      
      setShowAddModal(false);
      setEditingTable(null);
  };

  const handleEditClick = (table: TableSession) => {
      setSelectedTable(null);
      setEditingTable(table);
      setShowAddModal(true);
  };

  const handleDeleteClick = (tableId: string) => {
      setTables(prev => prev.filter(t => t.id !== tableId));
      setSelectedTable(null);
      addToast('success', 'Table Deleted', 'The table has been permanently removed.');
  };

  // --- PERSISTENT LOGIC: Mark Paid ---
  const handleMarkTablePaid = (table: TableSession, groupId?: string) => {
      try {
          const storedOrders = localStorage.getItem('active_orders');
          if (storedOrders) {
              const orders: OrderHistoryItem[] = JSON.parse(storedOrders);
              
              const updatedOrders = orders.map(o => {
                  // Skip if already paid
                  if (o.paymentStatus === 'paid') return o;

                  const isTableMatch = (o.tableNumber === table.tableNumber || o.tableNumber === table.tableNumber.replace('T', ''));

                  if (isTableMatch && o.status !== 'cancelled') {
                      
                      // Check Group Match if groupId is provided
                      if (groupId) {
                          if (o.sessionId !== groupId) return o; // Skip if session ID doesn't match
                      }

                      // FREEZE THE TAX INFO HERE
                      const currentVatRate = vatConfig.enabled ? vatConfig.rate : 0;
                      
                      const subtotal = o.items.reduce((acc, item) => {
                          if (item.status === 'cancelled') return acc;
                          return acc + (item.price * item.quantity);
                      }, 0);
                      const discount = o.discountAmount || 0;
                      const taxable = Math.max(0, subtotal - discount);
                      const taxAmount = Math.round(taxable * (currentVatRate / 100));
                      const total = taxable + taxAmount;

                      return { 
                          ...o, 
                          paymentStatus: 'paid' as const,
                          taxRate: currentVatRate,
                          taxAmount: taxAmount,
                          total: total
                      };
                  }
                  return o;
              });
              
              localStorage.setItem('active_orders', JSON.stringify(updatedOrders));
              addToast('success', 'Payment Recorded', `Selected orders marked as PAID.`);
              
              // Force update selected table view to reflect new status immediately
              const updatedTableOrders = table.activeOrders?.map(o => {
                  if (groupId && o.sessionId !== groupId) return o;
                  return {...o, paymentStatus: 'paid' as const};
              }) || [];

              const updatedGroups = table.groups?.map(g => {
                  if (groupId && g.id !== groupId) return g;
                  return {
                      ...g,
                      activeOrders: g.activeOrders.map(o => ({...o, paymentStatus: 'paid' as const}))
                  };
              }) || [];

              setSelectedTable({
                  ...table, 
                  activeOrders: updatedTableOrders,
                  groups: updatedGroups
              });
          }
      } catch (e) {
          console.error("Error updating payment status", e);
          addToast('error', 'Error', 'Failed to update payment status.');
      }
  };

  // --- PERSISTENT LOGIC: Clear Table (Handles specific group) ---
  const handleClearTable = (tableId: string, groupId?: string) => {
      // Find the table details to filter correct orders
      const targetTable = tables.find(t => t.id === tableId);
      if (!targetTable) return;

      try {
          // 1. Get current active orders
          const activeStr = localStorage.getItem('active_orders');
          const activeOrders: OrderHistoryItem[] = activeStr ? JSON.parse(activeStr) : [];
          
          // Filter orders belonging to this table
          const tableOrders = activeOrders.filter(o => 
              o.tableNumber === targetTable.tableNumber || 
              o.tableNumber === targetTable.tableNumber.replace('T', '')
          );

          // Determine orders to archive based on groupId
          let ordersToArchive: OrderHistoryItem[] = [];
          
          if (groupId) {
              // Clear specific group
              ordersToArchive = tableOrders.filter(o => {
                  // Strict match if session ID exists
                  if (o.sessionId === groupId) return true;
                  // Fallback: If legacy order (no session ID) and we are clearing a specific legacy group
                  if (!o.sessionId && groupId === `legacy_${tableId}`) return true;
                  return false; 
              });
          } else {
              // Clear WHOLE table (Default behavior or when no group specified)
              ordersToArchive = tableOrders;
          }

          // FALLBACK: If we tried to clear a group but found nothing, AND it was the last group on the table,
          // or if we tried to clear the table but found nothing (maybe ghost state), we should ensure cleanup.
          if (ordersToArchive.length === 0 && tableOrders.length > 0) {
              // If only one group exists on table and we tried to clear it (or undefined group), assume all orders belong to it.
              const groups = targetTable.groups || [];
              if (groups.length <= 1) {
                  ordersToArchive = tableOrders;
              }
          }

          // Filter out the archived ones from active list
          const archiveIds = new Set(ordersToArchive.map(o => o.id));
          const ordersToKeep = activeOrders.filter(o => !archiveIds.has(o.id));

          // Archive Process
          const historyStr = localStorage.getItem('order_history');
          const historyOrders: OrderHistoryItem[] = historyStr ? JSON.parse(historyStr) : [];
          
          const archivedWithStatus = ordersToArchive.map(o => ({
              ...o,
              status: 'completed' as const,
              paymentStatus: 'paid' as const,
          }));

          localStorage.setItem('order_history', JSON.stringify([...historyOrders, ...archivedWithStatus]));
          localStorage.setItem('active_orders', JSON.stringify(ordersToKeep));
          
          // --- CLEAR SESSION FROM PERSISTENCE ---
          const liveTablesStr = localStorage.getItem('nepnola_live_tables');
          if (liveTablesStr) {
              const liveTablesMap = JSON.parse(liveTablesStr);
              if (liveTablesMap[tableId]) {
                  const tableSession = liveTablesMap[tableId];
                  if (groupId) {
                      // Remove specific group
                      tableSession.groups = tableSession.groups.filter((g: any) => g.id !== groupId);
                      if (tableSession.groups.length === 0) {
                          // No groups left, clear table status
                          delete liveTablesMap[tableId];
                      }
                  } else {
                      // Clear whole table
                      delete liveTablesMap[tableId];
                  }
                  localStorage.setItem('nepnola_live_tables', JSON.stringify(liveTablesMap));
              }
          }

          addToast('success', 'Table Cleared', groupId ? 'Group cleared.' : 'Table is now free.');
          
          // SMART CLOSING & UI UPDATE LOGIC:
          
          // 1. Calculate remaining orders for this table
          const remainingTableOrders = ordersToKeep.filter(o => 
              o.tableNumber === targetTable.tableNumber || 
              o.tableNumber === targetTable.tableNumber.replace('T', '')
          );
          
          const isStillOccupied = remainingTableOrders.length > 0;

          // 2. IMMEDIATE LOCAL UPDATE (Crucial for UX)
          if (!isStillOccupied) {
              // If table is fully free, close the modal immediately
              setSelectedTable(null);
              
              // Force update tables list locally to show "Free" instantly without waiting for poll
              setTables(prev => prev.map(t => {
                  if (t.id === tableId) {
                      return { ...t, status: 'free', activeOrders: [], groups: [] };
                  }
                  return t;
              }));
          } else {
              // If still occupied (shared table with other groups), keep modal open but REFRESH it locally
              if (selectedTable) {
                  const updatedActiveOrders = selectedTable.activeOrders?.filter(o => !archiveIds.has(o.id));
                  const updatedGroups = selectedTable.groups?.filter(g => g.id !== groupId) || [];
                  
                  // Fix: Explicitly type updatedTableState and cast status to TableStatus to ensure correct typing for SetStateAction
                  const updatedTableState: TableSession = {
                      ...selectedTable,
                      activeOrders: updatedActiveOrders,
                      groups: updatedGroups,
                      status: (updatedGroups.length > 0 ? 'occupied' : 'free') as TableStatus
                  };
                  
                  setSelectedTable(updatedTableState);
                  
                  // Also update main tables list
                  setTables((prev: TableSession[]) => prev.map(t => {
                      if (t.id === tableId) {
                          return updatedTableState;
                      }
                      return t;
                  }));
              }
          }

      } catch (e) {
          console.error(e);
          addToast('error', 'Error', 'Failed to clear table.');
      }
  };

  const handleBookTable = (guests: number, groupName: string) => {
      if (!selectedTable) return;

      try {
          const liveTablesStr = localStorage.getItem('nepnola_live_tables');
          const liveTablesMap = liveTablesStr ? JSON.parse(liveTablesStr) : {};
          
          const tableId = selectedTable.id;
          const currentTableSession = liveTablesMap[tableId] || { status: 'occupied', groups: [] };
          
          const newSessionId = `sess_${tableId}_${Date.now()}`;
          const newGroup = {
              id: newSessionId,
              name: groupName || `Group ${currentTableSession.groups.length + 1}`,
              guests: guests,
              startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              activeOrders: [],
              totalAmount: 0,
              status: 'active'
          };

          currentTableSession.groups.push(newGroup);
          liveTablesMap[tableId] = currentTableSession;
          
          localStorage.setItem('nepnola_live_tables', JSON.stringify(liveTablesMap));
          
          // Navigation
          onNavigate(`/user?table=${selectedTable.tableNumber}&session=${newSessionId}&source=admin`);
          addToast('success', 'Booking Started', 'Opening digital menu...');
          
      } catch (e) {
          console.error("Booking error", e);
          addToast('error', 'Error', 'Failed to book table');
      }
  };

  const filteredTables = tables.filter(t => {
      const matchesFilter = filter === 'All' 
          ? true 
          : (filter === 'Occupied' ? t.status === 'occupied' : t.status === 'free');
      
      const matchesLocation = locationFilter === 'All' || t.location === locationFilter;
      
      return matchesFilter && matchesLocation;
  });

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] animate-in slide-in-from-right duration-300 relative overflow-hidden">
       
       <ToastContainer toasts={toasts} removeToast={removeToast} />

       {/* --- HEADER --- */}
       <div className="px-6 md:px-8 py-6 bg-white border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 z-20">
          <div>
             <h2 className="text-2xl font-black text-gray-900 leading-none">Table Management</h2>
             <p className="text-xs text-gray-400 font-bold mt-1">Real-time floor plan & status</p>
          </div>
          
          <div className="flex gap-3">
             <button 
                onClick={() => setShowLocationManager(true)}
                className="bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm active:scale-95 transition-all flex items-center gap-2"
             >
                <span>📍</span> Manage Areas
             </button>
             <button 
                onClick={() => { setEditingTable(null); setShowAddModal(true); }}
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-green-200 active:scale-95 transition-all flex items-center gap-2"
             >
                <span className="text-lg leading-none">+</span>
                <span>Add Table</span>
             </button>
          </div>
       </div>

       {/* --- MAIN CONTENT --- */}
       <div className="flex-1 overflow-y-auto no-scrollbar p-4 md:p-8">
          
          {/* Filters Row */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
              
              {/* Status Filter */}
              <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm shrink-0 self-start">
                  {(['All', 'Occupied', 'Free'] as TableFilter[]).map(f => (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filter === f ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                      >
                          {f}
                      </button>
                  ))}
              </div>

              {/* Location Filter Pills */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0 items-center">
                  <button 
                     onClick={() => setLocationFilter('All')}
                     className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${locationFilter === 'All' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-white text-gray-500 border-gray-200 hover:border-green-200'}`}
                  >
                     All Areas
                  </button>
                  {locations.map(loc => (
                     <button 
                        key={loc}
                        onClick={() => setLocationFilter(loc)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${locationFilter === loc ? 'bg-green-100 text-green-800 border-green-200' : 'bg-white text-gray-500 border-gray-200 hover:border-green-200'}`}
                     >
                        {loc}
                     </button>
                  ))}
              </div>
          </div>

          {/* Table Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6 pb-20">
             {filteredTables.map(table => (
                <TableCard 
                   key={table.id} 
                   table={table} 
                   onClick={() => setSelectedTable(table)} 
                />
             ))}
             {filteredTables.length === 0 && (
                 <div className="col-span-full py-20 text-center opacity-50 flex flex-col items-center">
                    <div className="text-6xl mb-4 grayscale">🍽️</div>
                    <p className="font-bold text-gray-400">No tables found here.</p>
                 </div>
             )}
          </div>
       </div>

       {/* --- MODALS --- */}
       {selectedTable && (
          <TableDetailModal 
             table={selectedTable}
             onClose={() => setSelectedTable(null)}
             onEdit={handleEditClick}
             onDelete={handleDeleteClick}
             onClear={(groupId) => handleClearTable(selectedTable.id, groupId)}
             onBook={handleBookTable}
             onOpenMenu={(path) => {
                 onNavigate(path);
             }}
             onMarkPaid={(groupId) => handleMarkTablePaid(selectedTable, groupId)}
          />
       )}

       {showAddModal && (
          <AdminAddTableModal 
             locations={locations}
             existingTables={tables}
             initialData={editingTable}
             onClose={() => setShowAddModal(false)}
             onSave={handleSaveTable}
             onManageLocations={() => { setShowAddModal(false); setShowLocationManager(true); }}
          />
       )}

       {showLocationManager && (
          <AdminLocationManager 
             locations={locations}
             onClose={() => setShowLocationManager(false)}
             onAdd={handleAddLocation}
             onDelete={handleDeleteLocation}
          />
       )}

    </div>
  );
}
