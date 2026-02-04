
import React, { useState, useEffect } from 'react';
import { ItemCustomization } from '../../types';

interface AggregatedTicket {
    orderId: string;
    table: string;
    status: string;
    startTime: number;
    totalQty: number;
    itemIndices: number[]; // All indices in original order.items that match this
}

interface SmartGroup {
    name: string;
    totalQuantity: number;
    variants: {
        customization?: ItemCustomization;
        quantity: number;
        tickets: AggregatedTicket[];
    }[];
}

interface Props {
    group: SmartGroup;
    onBatchAction: (actions: { orderId: string, itemIndex: number }[]) => void;
}

// Live Timer Sub-component
const TicketTimer = ({ startTime, isReady }: { startTime: number, isReady: boolean }) => {
    const [elapsed, setElapsed] = useState(0);
    
    useEffect(() => {
        if (isReady) return; // Stop counting if ready
        
        const tick = () => setElapsed(Math.floor((Date.now() - startTime) / 60000));
        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [startTime, isReady]);

    if (isReady) return <span className="text-[10px] font-black text-green-600">DONE</span>;

    let color = "text-gray-400";
    if (elapsed > 10) color = "text-orange-500";
    if (elapsed > 20) color = "text-red-500 animate-pulse";

    return <span className={`text-[10px] font-mono font-bold ${color}`}>{elapsed}m</span>;
};

const AggregatedItemCard: React.FC<Props> = ({ group, onBatchAction }) => {
    
    // Helper: Generate batch action payload for a list of tickets
    const getBatchPayload = (tickets: AggregatedTicket[]) => {
        return tickets.flatMap(t => t.itemIndices.map(idx => ({ orderId: t.orderId, itemIndex: idx })));
    };

    // Calculate Batch Progress
    const totalCount = group.totalQuantity;
    const readyCount = group.variants.reduce((acc, variant) => {
        return acc + variant.tickets.reduce((tAcc, ticket) => {
            // Count items that are fully done
            if (['ready', 'served', 'completed'].includes(ticket.status)) {
                return tAcc + ticket.totalQty;
            }
            return tAcc;
        }, 0);
    }, 0);
    
    const progress = totalCount > 0 ? (readyCount / totalCount) * 100 : 0;

    return (
        <div className="bg-white rounded-[24px] shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow relative">
            
            {/* --- MAIN HEADER (Item Name) --- */}
            <div className="bg-gradient-to-r from-gray-50 to-white p-4 border-b border-gray-100 flex justify-between items-center relative z-10">
                <h3 className="text-lg font-black text-gray-800 leading-tight w-2/3">{group.name}</h3>
                <div className="flex flex-col items-center bg-gray-900 text-white w-12 h-12 rounded-xl justify-center shadow-lg shadow-gray-200">
                    <span className="text-[8px] font-bold text-gray-400 uppercase">Total</span>
                    <span className="text-xl font-black leading-none">{group.totalQuantity}</span>
                </div>
            </div>

            {/* BATCH PROGRESS BAR */}
            <div className="h-1.5 w-full bg-gray-100 relative">
                <div 
                    className={`h-full transition-all duration-500 ease-out ${progress === 100 ? 'bg-emerald-500' : 'bg-green-500'}`} 
                    style={{ width: `${progress}%` }} 
                />
            </div>

            {/* --- SCROLLABLE BODY (Variants) --- */}
            <div className="flex-1 overflow-y-auto max-h-[400px] no-scrollbar p-3 space-y-4 bg-[#f8fafc]">
                
                {group.variants.map((variant, vIdx) => {
                    const hasCustomization = !!variant.customization;
                    const cust = variant.customization;
                    
                    return (
                        <div key={vIdx} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                            
                            {/* Variant Header */}
                            <div className={`px-3 py-2 border-b border-gray-100 flex justify-between items-center ${hasCustomization ? 'bg-orange-50/50' : 'bg-gray-50'}`}>
                                <div className="flex flex-wrap gap-1.5 items-center">
                                    {!hasCustomization ? (
                                        <span className="text-xs font-black text-gray-500 uppercase tracking-wide">Standard</span>
                                    ) : (
                                        <>
                                            {cust?.portion && <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[10px] font-bold">{cust.portion}</span>}
                                            {cust?.spiceLevel !== undefined && cust.spiceLevel > 0 && <span className="bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-0.5">🌶️ {cust.spiceLevel}%</span>}
                                            {cust?.isVeg === false && <span className="bg-red-100 text-red-600 px-1.5 py-0.5 rounded text-[10px] font-bold">Non-Veg</span>}
                                            {cust?.excludedIngredients?.map(ing => (
                                                <span key={ing} className="bg-red-50 text-red-600 px-1.5 py-0.5 rounded text-[10px] font-bold border border-red-100 line-through decoration-red-400 decoration-2">{ing}</span>
                                            ))}
                                        </>
                                    )}
                                </div>
                                <span className="text-[10px] font-bold text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-100 shadow-sm">x{variant.quantity}</span>
                            </div>

                            {/* Tickets List */}
                            <div className="divide-y divide-gray-50">
                                {variant.tickets.map((ticket, tIdx) => {
                                    const isCooking = ticket.status === 'cooking';
                                    const isReady = ticket.status === 'ready';
                                    
                                    // Visual Styles per status
                                    let containerStyle = 'bg-white';
                                    if (isCooking) containerStyle = 'bg-orange-50 border-l-4 border-l-orange-500 pl-2';
                                    if (isReady) containerStyle = 'bg-green-50 border-l-4 border-l-green-500 pl-2 opacity-80';

                                    return (
                                        <div key={`${ticket.orderId}-${tIdx}`} className={`flex items-center justify-between p-2.5 ${containerStyle} transition-colors`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`flex flex-col items-center justify-center w-10 h-10 border rounded-lg shadow-sm ${isReady ? 'bg-green-100 border-green-200 text-green-700' : 'bg-white border-gray-200 text-gray-800'}`}>
                                                    <span className="text-[8px] font-bold opacity-60 uppercase leading-none">TBL</span>
                                                    <span className="text-sm font-black leading-none">{ticket.table}</span>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-sm font-black ${isReady ? 'text-green-700 line-through' : 'text-gray-800'}`}>x{ticket.totalQty}</span>
                                                        {isCooking && <span className="text-[9px] font-bold text-orange-500 animate-pulse uppercase">🔥 Cooking</span>}
                                                        {isReady && <span className="text-[9px] font-bold text-green-600 uppercase">✅ Ready</span>}
                                                    </div>
                                                    <TicketTimer startTime={ticket.startTime} isReady={isReady} />
                                                </div>
                                            </div>

                                            <button 
                                                onClick={() => onBatchAction(getBatchPayload([ticket]))}
                                                className={`
                                                    h-8 px-3 rounded-lg text-[10px] font-black uppercase tracking-wide transition-all active:scale-95 flex items-center gap-1 shadow-sm
                                                    ${isReady
                                                        ? 'bg-white border border-green-200 text-green-600 hover:bg-green-50'
                                                        : (isCooking 
                                                            ? 'bg-green-100 text-green-700 hover:bg-green-600 hover:text-white border border-green-200' 
                                                            : 'bg-gray-900 text-white hover:bg-black')
                                                    }
                                                `}
                                            >
                                                {isReady ? 'Undo' : (isCooking ? 'Ready' : 'Cook')}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                            
                            {/* Variant Batch Action - Only show if pending items exist */}
                            {variant.tickets.some(t => t.status !== 'cooking' && t.status !== 'ready') && (
                                <div className="p-2 bg-gray-50 border-t border-gray-100">
                                    <button 
                                        onClick={() => onBatchAction(getBatchPayload(variant.tickets.filter(t => t.status !== 'cooking' && t.status !== 'ready')))}
                                        className="w-full bg-white border border-orange-200 text-orange-600 py-2 rounded-lg text-xs font-black shadow-sm hover:bg-orange-50 active:scale-95 transition-all flex items-center justify-center gap-1"
                                    >
                                        <span>🔥</span> Start All Pending
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AggregatedItemCard;
