
import React, { useState } from 'react';
import NewBookingForm from './NewBookingForm'; // Import the new booking form component
import NewClientForm, { NewClientFormData } from './NewClientForm'; // Import the new client form component
import ClientDetailModal from './ClientDetailModal'; // Import the new client detail modal component
import EditClientForm from './EditClientForm'; // Import the edit client form component

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
  },
  {
    id: 'C002',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    totalBookings: 8,
    phone: '444-555-6666',
    address: '456 Oak Ave, Somewhere',
  },
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
  const [showNewClientForm, setShowNewClientForm] = useState<boolean>(false); // New state for new client form visibility
  const [selectedClient, setSelectedClient] = useState<Client | null>(null); // State for selected client for detail modal
  const [prefilledBookingClient, setPrefilledBookingClient] = useState<{ name: string; email: string } | undefined>(undefined);
  const [editingClient, setEditingClient] = useState<Client | null>(null); // State for client being edited

  const [bookings, setBookings] = useState<Booking[]>(initialBookingsData);
  const [clients, setClients] = useState<Client[]>(initialClientData); // Local state for clients

  const toggleBookingDetails = (id: string) => {
    setExpandedBookingId(expandedBookingId === id ? null : id);
  };

  const handleCreateNewBooking = () => {
    setShowNewBookingForm(true);
  };

  const handleCreateNewClient = () => {
    setShowNewClientForm(true);
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
    // Optionally update totalBookings for the client
    setClients(prevClients =>
      prevClients.map(c =>
        c.name === newBooking.client ? { ...c, totalBookings: c.totalBookings + 1 } : c
      )
    );
    alert(`New booking for ${newBooking.client} (${newBooking.serviceType} to ${newBooking.route}) created!`);
  };

  const handleNewClientSubmit = (newClient: NewClientFormData) => {
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

  const statusOptions = ['All', 'Confirmed', 'Pending', 'Completed', 'Cancelled', 'Submitted'];

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg max-w-4xl mx-auto my-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-4">Agent Portal Dashboard</h1>

      {/* Client Management Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Client Management</h2>
        
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                    <div id={`booking-details-${booking.id}`} className="p-3 pl-5 bg-gray-100 text-sm text-gray-700 border-t border-gray-200 rounded-b-md">
                      <p><strong className="font-medium">Booking ID:</strong> {booking.id}</p>
                      <p><strong className="font-medium">Traveler count:</strong> {booking.travelers.length}</p>
                      {booking.departureDate && <p><strong className="font-medium">Departure Date:</strong> {booking.departureDate}</p>}
                      {booking.returnDate && <p><strong className="font-medium">Return Date:</strong> {booking.returnDate}</p>}
                      <p><strong className="font-medium">Price:</strong> {booking.price}</p>
                      
                      {/* Status Change Dropdown & Quick Actions */}
                      <div className="mt-4 pt-3 border-t border-gray-200 flex flex-wrap items-center gap-4">
                        <div className="flex items-center">
                          <label htmlFor={`status-select-${booking.id}`} className="text-sm font-medium text-gray-700 mr-2">
                            Update Status:
                          </label>
                          <select
                            id={`status-select-${booking.id}`}
                            value={booking.status}
                            onChange={(e) => handleStatusChange(booking.id, e.target.value as Booking['status'])}
                            className="text-sm border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 py-1 pl-2 pr-8 bg-white cursor-pointer"
                          >
                            {statusOptions.filter(s => s !== 'All').map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500 font-medium">Quick Actions:</span>
                          {booking.status !== 'Confirmed' && (
                            <button
                              onClick={() => handleStatusChange(booking.id, 'Confirmed')}
                              className="px-3 py-1 bg-green-100 text-green-700 border border-green-200 rounded-md hover:bg-green-200 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                              title="Set status to Confirmed"
                            >
                              Confirm
                            </button>
                          )}
                          {booking.status !== 'Cancelled' && (
                            <button
                              onClick={() => handleCancelBooking(booking.id)}
                              className="px-3 py-1 bg-red-100 text-red-700 border border-red-200 rounded-md hover:bg-red-200 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
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

      {/* Client Detail Modal */}
      {selectedClient && (
        <ClientDetailModal
          client={selectedClient}
          allBookings={bookings}
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
