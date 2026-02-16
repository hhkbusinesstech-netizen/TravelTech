import React, { useState, useRef } from 'react';
import NewBookingForm from './NewBookingForm'; // Import the new booking form component
import NewClientForm, { NewClientFormData } from './NewClientForm'; // Import the new client form component
import ClientDetailModal from './ClientDetailModal'; // Import the new client detail modal component
import EditClientForm from './EditClientForm'; // Import the edit client form component
import AddFundsModal from './AddFundsModal'; // Import the new add funds modal

// Define a type for booking data to make it more structured
interface Booking {
  id: string;
  serviceType: string;
  route: string;
  client: string; // This refers to client name, not the Client object
  status: 'Confirmed' | 'Pending' | 'Completed' | 'Submitted' | 'Cancelled';
  date: string;
  travelers: string[];
  departureDate?: string;
  returnDate?: string;
  price: string;
}

// Define interface for the data structure submitted by NewBookingForm
interface NewBookingFormData {
  id: string;
  clientName: string;
  clientEmail: string;
  serviceType: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  numTravelers: number;
  status: 'Confirmed' | 'Pending' | 'Completed' | 'Submitted' | 'Cancelled';
  date: string;
  travelers: string[];
  price: string;
}

// Define interface for Client data
interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  totalBookings: number;
  walletBalance: number; // Added walletBalance
}

// Define WalletTransaction interface (New DocType)
export interface WalletTransaction {
  id: string;
  clientId: string;
  clientName: string;
  amount: number;
  type: 'Credit' | 'Debit';
  reference: string;
  timestamp: string;
}

const initialBookingsData: Booking[] = [
  {
    id: 'B001',
    serviceType: 'Flight',
    route: 'NYC to LAX',
    client: 'John Doe',
    status: 'Confirmed',
    date: '2024-10-26',
    travelers: ['John Doe'],
    departureDate: '2024-11-01',
    returnDate: '2024-11-05',
    price: '$450.00',
  },
  {
    id: 'B002',
    serviceType: 'Hotel',
    route: 'Paris Hilton - Paris',
    client: 'Jane Smith',
    status: 'Pending',
    date: '2024-11-15',
    travelers: ['Jane Smith', 'Peter Smith'],
    departureDate: '2024-12-10',
    returnDate: '2024-12-15',
    price: '$1200.00',
  },
  {
    id: 'B003',
    serviceType: 'Package',
    route: 'Bali Adventure',
    client: 'John Doe',
    status: 'Completed',
    date: '2024-09-01',
    travelers: ['John Doe', 'Alice Doe'],
    departureDate: '2024-09-10',
    returnDate: '2024-09-20',
    price: '$2500.00',
  },
  {
    id: 'B004',
    serviceType: 'Visa',
    route: 'UK Application',
    client: 'Jane Smith',
    status: 'Submitted',
    date: '2024-10-20',
    travelers: ['Jane Smith'],
    price: '$150.00',
  },
  {
    id: 'B005',
    serviceType: 'Flight',
    route: 'LAX to HNL',
    client: 'John Doe',
    status: 'Cancelled',
    date: '2024-10-10',
    travelers: ['John Doe'],
    departureDate: '2024-10-20',
    returnDate: '2024-10-25',
    price: '$600.00',
  },
];

const initialClientData: Client[] = [
  {
    id: 'C001',
    name: 'John Doe',
    email: 'john.doe@example.com',
    totalBookings: 5,
    phone: '111-222-3333',
    address: '123 Main St, Anytown',
    walletBalance: 150.00,
  },
  {
    id: 'C002',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    totalBookings: 8,
    phone: '444-555-6666',
    address: '456 Oak Ave, Somewhere',
    walletBalance: 0.00,
  },
];

// Initial Transactions Data
const initialTransactions: WalletTransaction[] = [
    { id: 'WT-INIT-01', clientId: 'C001', clientName: 'John Doe', amount: 600.00, type: 'Credit', reference: 'Manual Deposit', timestamp: '2024-10-01 10:00:00' },
    { id: 'WT-INIT-02', clientId: 'C001', clientName: 'John Doe', amount: 450.00, type: 'Debit', reference: 'Booking B001', timestamp: '2024-10-26 12:00:00' },
];


const AgentPortalDashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);
  
  // Booking Filters State
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [bookingSearchQuery, setBookingSearchQuery] = useState<string>('');
  const [bookingDateStart, setBookingDateStart] = useState<string>('');
  const [bookingDateEnd, setBookingDateEnd] = useState<string>('');

  const [showNewBookingForm, setShowNewBookingForm] = useState<boolean>(false);
  const [showNewClientForm, setShowNewClientForm] = useState<boolean>(false);
  const [showAddFundsModal, setShowAddFundsModal] = useState<boolean>(false); // State for Add Funds Modal

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [prefilledBookingClient, setPrefilledBookingClient] = useState<{ name: string; email: string } | undefined>(undefined);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [bookings, setBookings] = useState<Booking[]>(initialBookingsData);
  const [clients, setClients] = useState<Client[]>(initialClientData);
  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>(initialTransactions);

  // Financial State (Credit Limit)
  const [creditLimit] = useState<number>(25000);
  const [outstandingBalance] = useState<number>(8450.50);

  // Refs for scrolling
  const clientSectionRef = useRef<HTMLElement>(null);

  const remainingCredit = creditLimit - outstandingBalance;
  const utilizationPercentage = Math.min((outstandingBalance / creditLimit) * 100, 100);

  // Determine progress bar color based on utilization
  let progressBarColor = 'bg-green-500';
  if (utilizationPercentage > 80) {
    progressBarColor = 'bg-red-500';
  } else if (utilizationPercentage > 50) {
    progressBarColor = 'bg-yellow-500';
  }

  const toggleBookingDetails = (id: string) => {
    setExpandedBookingId(expandedBookingId === id ? null : id);
  };

  const handleCreateNewBooking = () => {
    setShowNewBookingForm(true);
  };

  const handleCreateNewClient = () => {
    setShowNewClientForm(true);
  };

  const handleScrollToClients = () => {
    if (clientSectionRef.current) {
        clientSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleViewReports = () => {
      alert("Sales and Profitability Reports module coming in Phase 2.");
  };

  const handleManualAddFunds = () => {
    setShowAddFundsModal(true);
  };

  const handleAddFundsSubmit = (clientId: string, amount: number) => {
    // 1. Update Client Balance
    setClients(prevClients => prevClients.map(client => {
      if (client.id === clientId) {
        return { ...client, walletBalance: (client.walletBalance || 0) + amount };
      }
      return client;
    }));

    // 2. Log Wallet Transaction (Credit)
    const client = clients.find(c => c.id === clientId);
    if (client) {
      const newTransaction: WalletTransaction = {
        id: `WT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        clientId: client.id,
        clientName: client.name,
        amount: amount,
        type: 'Credit',
        reference: 'Manual Deposit',
        timestamp: new Date().toLocaleString()
      };
      setWalletTransactions(prev => [newTransaction, ...prev]);
      
      // Update selected client if open
      if (selectedClient && selectedClient.id === clientId) {
        setSelectedClient({ ...selectedClient, walletBalance: (selectedClient.walletBalance || 0) + amount });
      }

      alert(`Successfully added $${amount.toFixed(2)} to ${client.name}'s wallet.`);
    }
  };

  const handleViewClientProfile = (client: Client) => {
    setSelectedClient(client);
  };

  const handleCreateBookingForClient = (client: Client) => {
    setPrefilledBookingClient({ name: client.name, email: client.email });
    setSelectedClient(null); // Close the client detail modal
    setShowNewBookingForm(true); // Open the new booking form
  };

  const handleEditClientClick = (client: Client) => {
    setEditingClient(client);
  };

  const handleUpdateClientSubmit = (updatedClient: Client) => {
    // Update the clients list
    setClients((prevClients) =>
      prevClients.map((c) => (c.id === updatedClient.id ? updatedClient : c))
    );
    
    // Also update selectedClient if it's the same client, so the detail modal updates instantly
    if (selectedClient && selectedClient.id === updatedClient.id) {
      setSelectedClient(updatedClient);
    }

    setEditingClient(null); // Close the edit modal
    alert(`Client details for ${updatedClient.name} updated successfully.`);
  };

  const handleNewBookingSubmit = (newBookingData: NewBookingFormData) => {
    // 1. Create Booking
    const newBooking: Booking = {
      id: newBookingData.id,
      serviceType: newBookingData.serviceType,
      route: newBookingData.destination,
      client: newBookingData.clientName,
      status: newBookingData.status,
      date: newBookingData.date,
      travelers: newBookingData.travelers,
      departureDate: newBookingData.departureDate,
      returnDate: newBookingData.returnDate,
      price: newBookingData.price,
    };
    setBookings((prevBookings) => [newBooking, ...prevBookings]);
    
    // 2. Parse Price and Handle Wallet Debit
    const priceValue = parseFloat(newBookingData.price.replace(/[^0-9.-]+/g,"")) || 0;
    
    if (priceValue > 0) {
        const client = clients.find(c => c.name === newBookingData.clientName);
        if (client) {
             // Create Debit Transaction
             const newTx: WalletTransaction = {
                id: `WT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                clientId: client.id,
                clientName: client.name,
                amount: priceValue,
                type: 'Debit',
                reference: `Booking ${newBookingData.id}`,
                timestamp: new Date().toLocaleString()
            };
            setWalletTransactions(prev => [newTx, ...prev]);
            
            // Update Client Balance
            setClients(prevClients =>
              prevClients.map(c =>
                c.id === client.id ? { ...c, totalBookings: c.totalBookings + 1, walletBalance: (c.walletBalance || 0) - priceValue } : c
              )
            );
        } else {
             // If client not found by exact name, just update total bookings (fallback for existing logic)
             setClients(prevClients =>
                prevClients.map(c =>
                    c.name === newBooking.client ? { ...c, totalBookings: c.totalBookings + 1 } : c
                )
             );
        }
    } else {
        // Just update total bookings if price is 0
        setClients(prevClients =>
          prevClients.map(c =>
            c.name === newBooking.client ? { ...c, totalBookings: c.totalBookings + 1 } : c
          )
        );
    }

    alert(`New booking for ${newBooking.client} (${newBooking.serviceType} to ${newBooking.route}) created! Wallet updated.`);
  };

  const handleNewClientSubmit = (newClientData: NewClientFormData) => {
    const newClient: Client = {
        ...newClientData,
        walletBalance: 0.00
    };
    setClients((prevClients) => [...prevClients, newClient]); // Add new client to the list
    alert(`New client ${newClient.name} (${newClient.email}) added successfully!`);
  };

  const handleClearFilters = () => {
    setBookingSearchQuery('');
    setBookingDateStart('');
    setBookingDateEnd('');
    setStatusFilter('All');
  };

  const handleStatusChange = (bookingId: string, newStatus: Booking['status']) => {
    setBookings((prevBookings) =>
      prevBookings.map((b) =>
        b.id === bookingId ? { ...b, status: newStatus } : b
      )
    );
  };
  
  const handleCancelBooking = (bookingId: string) => {
    if (window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      handleStatusChange(bookingId, 'Cancelled');
    }
  };

  const handleCloseBookingForm = () => {
    setShowNewBookingForm(false);
    setPrefilledBookingClient(undefined);
  };

  const filteredBookings = bookings.filter(booking => {
    // 1. Status Filter
    if (statusFilter !== 'All' && booking.status !== statusFilter) {
      return false;
    }

    // 2. Text Search (Client, Route/Destination, ID)
    if (bookingSearchQuery) {
      const query = bookingSearchQuery.toLowerCase();
      const matchesClient = booking.client.toLowerCase().includes(query);
      const matchesRoute = booking.route.toLowerCase().includes(query);
      const matchesId = booking.id.toLowerCase().includes(query);
      
      if (!matchesClient && !matchesRoute && !matchesId) {
        return false;
      }
    }

    // 3. Date Range Filter
    if (bookingDateStart && booking.date < bookingDateStart) {
      return false;
    }
    if (bookingDateEnd && booking.date > bookingDateEnd) {
      return false;
    }

    return true;
  });

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

  const handleExportBookingsToCSV = () => {
    const headers = [
      "Booking ID", "Service Type", "Route", "Client", "Status", "Date",
      "Traveler Count", "Departure Date", "Return Date", "Price"
    ];

    const csvRows = filteredBookings.map(booking => [
      escapeCsv(booking.id),
      escapeCsv(booking.serviceType),
      escapeCsv(booking.route),
      escapeCsv(booking.client),
      escapeCsv(booking.status),
      escapeCsv(booking.date),
      escapeCsv(booking.travelers.length),
      escapeCsv(booking.departureDate),
      escapeCsv(booking.returnDate),
      escapeCsv(booking.price),
    ].join(','));

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `bookings_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportClientsToCSV = () => {
    const headers = [
      "Client ID", "Name", "Email", "Phone", "Address", "Total Bookings", "Wallet Balance"
    ];

    const csvRows = filteredClients.map(client => [
      escapeCsv(client.id),
      escapeCsv(client.name),
      escapeCsv(client.email),
      escapeCsv(client.phone),
      escapeCsv(client.address),
      escapeCsv(client.totalBookings),
      escapeCsv(client.walletBalance),
    ].join(','));

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `clients_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statusOptions = ['All', 'Confirmed', 'Pending', 'Completed', 'Cancelled', 'Submitted'];

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg max-w-4xl mx-auto my-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-4">Agent Portal Dashboard</h1>

      {/* Credit Limit & Financial Overview Section */}
      <section className="mb-8 bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm relative overflow-hidden">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Credit Limit Status
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="p-4 bg-white rounded-md border border-gray-200 shadow-sm">
                <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Total Credit Limit</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">${creditLimit.toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
            </div>
            <div className="p-4 bg-white rounded-md border border-gray-200 shadow-sm">
                 <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Outstanding Balance</p>
                 <p className="text-2xl font-bold text-red-600 mt-1">${outstandingBalance.toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-md border border-blue-100 shadow-sm">
                 <p className="text-sm text-blue-600 font-medium uppercase tracking-wide">Remaining Credit</p>
                 <p className="text-2xl font-bold text-blue-700 mt-1">${remainingCredit.toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
            </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">Credit Utilization</span>
                <span className="text-sm font-bold text-blue-600">{utilizationPercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                    className={`h-2.5 rounded-full transition-all duration-500 ease-out ${progressBarColor}`} 
                    style={{ width: `${utilizationPercentage}%` }}
                ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-right">
                {utilizationPercentage > 90 ? 'Warning: You are approaching your credit limit.' : 'Healthy credit status.'}
            </p>
        </div>
      </section>

      {/* Quick Actions Section */}
      <h2 className="text-xl font-semibold mb-4 text-gray-700">Quick Actions</h2>
      <section className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <button
          onClick={handleCreateNewBooking}
          className="flex flex-col items-center justify-center p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow group text-center h-full"
        >
          <div className="p-3 rounded-full bg-blue-100 text-blue-600 mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          </div>
          <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900">Create New Booking</span>
        </button>

        <button
          onClick={handleScrollToClients}
          className="flex flex-col items-center justify-center p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow group text-center h-full"
        >
          <div className="p-3 rounded-full bg-green-100 text-green-600 mb-3 group-hover:bg-green-600 group-hover:text-white transition-colors">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          </div>
          <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900">Manage Clients</span>
        </button>

        <button
          onClick={handleViewReports}
          className="flex flex-col items-center justify-center p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow group text-center h-full"
        >
          <div className="p-3 rounded-full bg-purple-100 text-purple-600 mb-3 group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </div>
          <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900">View Reports</span>
        </button>

        <button
          onClick={handleManualAddFunds}
          className="flex flex-col items-center justify-center p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow group text-center h-full"
        >
          <div className="p-3 rounded-full bg-emerald-100 text-emerald-600 mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
          </div>
          <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900">Manually Add Funds</span>
        </button>
      </section>

      {/* Client Management Section */}
      <section className="mb-8" ref={clientSectionRef}>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-700">Client Management</h2>
            <button
                onClick={handleExportClientsToCSV}
                className="text-sm px-3 py-1 bg-orange-500 text-white border border-orange-600 rounded hover:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 shadow-sm flex items-center"
            >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
                Export Clients
            </button>
        </div>
        
        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search clients by name or email..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search clients"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <div key={client.id} className="bg-gray-50 p-4 rounded-md shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-1">{client.name}</h3>
              <p className="text-sm text-gray-600">Email: {client.email}</p>
              {client.phone && <p className="text-sm text-gray-600">Phone: {client.phone}</p>}
              <p className="text-sm text-gray-600">Total Bookings: {client.totalBookings}</p>
              <div className="mt-2 text-sm font-medium text-emerald-600">
                  Wallet: ${client.walletBalance?.toFixed(2) || '0.00'}
              </div>
              <button 
                onClick={() => handleViewClientProfile(client)}
                className="mt-3 px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                View Profile
              </button>
            </div>
          ))}
          {/* Add New Client Button */}
          <div className="bg-gray-50 p-4 rounded-md shadow-sm border border-gray-200 flex items-center justify-center">
            <button
              onClick={handleCreateNewClient}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
            >
              + Add New Client
            </button>
          </div>
        </div>
      </section>

      {/* Booking Overview Section */}
      <section>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-700">Booking Overview</h2>
            <button 
                onClick={handleClearFilters}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
                Clear Filters
            </button>
        </div>
        
        {/* Advanced Search Filters */}
        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-md border border-gray-200">
          <div className="md:col-span-1">
             <label className="block text-xs font-medium text-gray-500 mb-1">Search Booking</label>
             <input
              type="text"
              placeholder="Client, Destination or ID..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={bookingSearchQuery}
              onChange={(e) => setBookingSearchQuery(e.target.value)}
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">From Date</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 text-sm"
              value={bookingDateStart}
              onChange={(e) => setBookingDateStart(e.target.value)}
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">To Date</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={bookingDateEnd}
              onChange={(e) => setBookingDateEnd(e.target.value)}
            />
          </div>
        </div>

        {/* Status Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          <span className="text-gray-700 font-medium mr-2 self-center">Status:</span>
          {statusOptions.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 text-sm rounded-full transition-colors duration-200 ${
                statusFilter === status
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              aria-pressed={statusFilter === status}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="bg-gray-50 p-4 rounded-md shadow-sm border border-gray-200">
          <ul className="space-y-3">
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => (
                <li key={booking.id} className="border-b last:border-b-0 border-gray-200">
                  <button
                    className="w-full flex justify-between items-center py-2 px-1 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100 rounded-md"
                    onClick={() => toggleBookingDetails(booking.id)}
                    aria-expanded={expandedBookingId === booking.id}
                    aria-controls={`booking-details-${booking.id}`}
                  >
                    <div>
                      <p className="font-medium text-gray-900">{booking.serviceType} - {booking.route}</p>
                      <p className="text-sm text-gray-600">Client: {booking.client} | Status: {booking.status}</p>
                    </div>
                    <span className="text-sm text-gray-500 flex items-center">
                      {booking.date}
                      <svg
                        className={`ml-2 w-4 h-4 transform transition-transform ${
                          expandedBookingId === booking.id ? 'rotate-180' : 'rotate-0'
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </span>
                  </button>
                  {expandedBookingId === booking.id && (
                    <div id={`booking-details-${booking.id}`} className="p-4 bg-gray-50 border-t border-gray-200 rounded-b-md shadow-inner">
                      
                      {/* Grid Layout for Expanded Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                         <div className="bg-white p-3 rounded-md border border-gray-200 shadow-sm">
                           <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Booking ID</span>
                           <span className="block text-sm font-mono font-bold text-blue-600">{booking.id}</span>
                         </div>
                         
                         <div className="bg-white p-3 rounded-md border border-gray-200 shadow-sm">
                           <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Travelers</span>
                           <span className="block text-sm font-medium text-gray-800">{booking.travelers.length} Person(s)</span>
                         </div>

                         <div className="bg-white p-3 rounded-md border border-gray-200 shadow-sm">
                           <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Price</span>
                           <span className="block text-sm font-bold text-green-600">{booking.price}</span>
                         </div>

                         <div className="bg-white p-3 rounded-md border border-gray-200 shadow-sm">
                           <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Dates</span>
                           <div className="flex flex-col text-xs text-gray-700">
                             {booking.departureDate && <span>Dep: {booking.departureDate}</span>}
                             {booking.returnDate && <span>Ret: {booking.returnDate}</span>}
                             {!booking.departureDate && <span>-</span>}
                           </div>
                         </div>
                      </div>
                      
                      {/* Status Change Dropdown & Quick Actions */}
                      <div className="pt-3 border-t border-gray-200 flex flex-wrap items-center gap-4 justify-between">
                        <div className="flex items-center bg-white px-3 py-1 rounded border border-gray-200">
                          <label htmlFor={`status-select-${booking.id}`} className="text-sm font-medium text-gray-700 mr-2">
                            Update Status:
                          </label>
                          <select
                            id={`status-select-${booking.id}`}
                            value={booking.status}
                            onChange={(e) => handleStatusChange(booking.id, e.target.value as Booking['status'])}
                            className="text-sm border-none focus:ring-0 text-gray-700 bg-transparent cursor-pointer font-medium"
                          >
                            {statusOptions.filter(s => s !== 'All').map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-center space-x-2">
                          {booking.status !== 'Confirmed' && (
                            <button
                              onClick={() => handleStatusChange(booking.id, 'Confirmed')}
                              className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 text-xs font-medium transition-colors shadow-sm"
                              title="Set status to Confirmed"
                            >
                              Confirm
                            </button>
                          )}
                          {booking.status !== 'Cancelled' && (
                            <button
                              onClick={() => handleCancelBooking(booking.id)}
                              className="px-3 py-1.5 bg-white text-red-600 border border-red-200 rounded hover:bg-red-50 text-xs font-medium transition-colors"
                              title="Set status to Cancelled"
                            >
                              Cancel Booking
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              ))
            ) : (
              <li className="text-center py-4 text-gray-600">No bookings found matching the filters.</li>
            )}
          </ul>
        </div>
        <div className="flex flex-col space-y-2 mt-4">
          <button 
            onClick={handleCreateNewBooking}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 w-full"
          >
            Create New Booking
          </button>
          <button 
            onClick={handleCreateNewBooking} // This button also uses the same booking form
            className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50 w-full"
          >
            Create Booking for New Client
          </button>
          <button
            onClick={handleExportBookingsToCSV}
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 w-full"
          >
            Export Bookings (CSV)
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 w-full">
            View All Bookings
          </button>
        </div>
      </section>

      {/* New Booking Form Modal */}
      {showNewBookingForm && (
        <NewBookingForm
          onClose={handleCloseBookingForm}
          onSubmit={handleNewBookingSubmit}
          initialClientData={prefilledBookingClient}
        />
      )}

      {/* New Client Form Modal */}
      {showNewClientForm && (
        <NewClientForm
          onClose={() => setShowNewClientForm(false)}
          onSubmit={handleNewClientSubmit}
        />
      )}
      
      {/* Add Funds Modal */}
      {showAddFundsModal && (
        <AddFundsModal
          clients={clients}
          onClose={() => setShowAddFundsModal(false)}
          onSubmit={handleAddFundsSubmit}
        />
      )}

      {/* Client Detail Modal */}
      {selectedClient && (
        <ClientDetailModal
          client={selectedClient}
          allBookings={bookings}
          walletTransactions={walletTransactions} // Pass transactions
          onClose={() => setSelectedClient(null)}
          onCreateBooking={handleCreateBookingForClient}
          onEditClient={handleEditClientClick}
        />
      )}

      {/* Edit Client Form Modal */}
      {editingClient && (
        <EditClientForm
          client={editingClient}
          onClose={() => setEditingClient(null)}
          onSubmit={handleUpdateClientSubmit}
        />
      )}
    </div>
  );
};

export default AgentPortalDashboard;