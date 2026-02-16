import React, { useState } from 'react';

// Re-use existing interfaces from AgentPortalDashboard for consistency
interface Booking {
  id: string;
  serviceType: string;
  route: string;
  client: string; // This refers to client name
  status: 'Confirmed' | 'Pending' | 'Completed' | 'Submitted' | 'Cancelled';
  date: string;
  travelers: string[];
  departureDate?: string;
  returnDate?: string;
  price: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  totalBookings: number;
  walletBalance?: number;
}

interface WalletTransaction {
  id: string;
  clientId: string;
  clientName: string;
  amount: number;
  type: 'Credit' | 'Debit';
  reference: string;
  timestamp: string;
}

interface ClientDetailModalProps {
  client: Client;
  allBookings: Booking[];
  walletTransactions?: WalletTransaction[]; // New prop for wallet history
  onClose: () => void;
  onCreateBooking: (client: Client) => void;
  onEditClient: (client: Client) => void;
}

const ClientDetailModal: React.FC<ClientDetailModalProps> = ({ client, allBookings, walletTransactions = [], onClose, onCreateBooking, onEditClient }) => {
  const [activeTab, setActiveTab] = useState<'bookings' | 'wallet'>('bookings');
  
  const clientBookings = allBookings.filter(booking => booking.client === client.name);
  const clientTransactions = walletTransactions.filter(tx => tx.clientId === client.id).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Helper function to escape CSV values
  const escapeCsv = (value: string | number | undefined | null): string => {
    if (value === undefined || value === null) {
      return '';
    }
    let stringValue = String(value);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  const handleExportHistory = () => {
    const headers = [
      "Booking ID", "Service Type", "Route", "Travel Dates", "Status", "Booked On", "Price"
    ];

    const csvRows = clientBookings.map(booking => {
      const travelDates = booking.departureDate 
        ? `${booking.departureDate}${booking.returnDate ? ' to ' + booking.returnDate : ''}` 
        : '-';
      
      return [
        escapeCsv(booking.id),
        escapeCsv(booking.serviceType),
        escapeCsv(booking.route),
        escapeCsv(travelDates),
        escapeCsv(booking.status),
        escapeCsv(booking.date),
        escapeCsv(booking.price),
      ].join(',');
    });

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${client.name.replace(/\s+/g, '_')}_booking_history.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyId = (id: string) => {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(id).then(() => {
            // Could add a toast notification here in a real app
        }).catch(err => console.error('Failed to copy ID:', err));
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl p-6 relative max-h-[90vh] overflow-y-auto">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-4">{client.name}'s Profile</h2>

        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-700">Contact Information</h3>
            <div className="flex space-x-3">
              <button
                onClick={() => onCreateBooking(client)}
                className="text-sm px-3 py-1 bg-green-600 text-white border border-green-700 rounded hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                Create Booking
              </button>
              <button
                onClick={() => onEditClient(client)}
                className="text-sm px-3 py-1 bg-gray-100 text-gray-700 border border-gray-300 rounded hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                Edit Details
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md border border-gray-200">
            <p className="text-gray-700"><strong className="font-medium">Email:</strong> {client.email}</p>
            {client.phone && <p className="text-gray-700"><strong className="font-medium">Phone:</strong> {client.phone}</p>}
            {client.address && <p className="text-gray-700"><strong className="font-medium">Address:</strong> {client.address}</p>}
            <p className="text-gray-700"><strong className="font-medium">Total Bookings:</strong> {client.totalBookings}</p>
            <p className="text-gray-700"><strong className="font-medium">Wallet Balance:</strong> <span className="text-green-600 font-bold">${client.walletBalance?.toFixed(2) || '0.00'}</span></p>
          </div>
        </section>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`${
                activeTab === 'bookings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Booking History
            </button>
            <button
              onClick={() => setActiveTab('wallet')}
              className={`${
                activeTab === 'wallet'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Wallet History
            </button>
          </nav>
        </div>

        {/* Booking History Tab Content */}
        {activeTab === 'bookings' && (
          <section className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-700">Booking History Breakdown</h3>
              {clientBookings.length > 0 && (
                <button
                  onClick={handleExportHistory}
                  className="text-sm px-3 py-1 bg-orange-500 text-white border border-orange-600 rounded hover:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 shadow-sm flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                  </svg>
                  Export History (CSV)
                </button>
              )}
            </div>
            {clientBookings.length > 0 ? (
              <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Travel Dates</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booked On</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {clientBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          <div 
                            className="inline-flex items-center px-2.5 py-0.5 rounded font-medium bg-blue-100 text-blue-800 font-mono cursor-pointer hover:bg-blue-200 transition-colors group relative"
                            onClick={() => handleCopyId(booking.id)}
                            title="Click to copy Booking ID"
                          >
                            {booking.id}
                            <svg className="w-3 h-3 ml-1.5 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                            </svg>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{booking.serviceType}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{booking.route}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {booking.departureDate ? (
                            <div className="flex flex-col">
                              <span>{booking.departureDate}</span>
                              {booking.returnDate && <span className="text-gray-500 text-xs">to {booking.returnDate}</span>}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 
                              booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                              booking.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 
                              'bg-gray-100 text-gray-800'}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{booking.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200 border-dashed">
                <p className="text-gray-500">No past bookings found for this client.</p>
              </div>
            )}
          </section>
        )}

        {/* Wallet History Tab Content */}
        {activeTab === 'wallet' && (
           <section className="mb-6">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">Wallet Transactions</h3>
              {clientTransactions.length > 0 ? (
                <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date/Time</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {clientTransactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{tx.timestamp}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${tx.type === 'Credit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {tx.type}
                            </span>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${tx.type === 'Credit' ? 'text-green-600' : 'text-red-600'}`}>
                            {tx.type === 'Credit' ? '+' : '-'}${tx.amount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{tx.reference}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono text-xs">{tx.id}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200 border-dashed">
                  <p className="text-gray-500">No wallet transactions found.</p>
                </div>
              )}
           </section>
        )}

        <div className="flex justify-end mt-8 pt-4 border-t border-gray-100 space-x-4">
          <button
            type="button"
            onClick={() => onCreateBooking(client)}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors font-medium flex items-center shadow-lg"
          >
             <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            Create New Booking for This Client
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 transition-colors font-medium"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientDetailModal;