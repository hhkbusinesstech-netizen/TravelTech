
import React from 'react';

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
}

interface ClientDetailModalProps {
  client: Client;
  allBookings: Booking[]; // Pass all bookings to filter within the modal
  onClose: () => void;
  onCreateBooking: (client: Client) => void;
  onEditClient: (client: Client) => void;
}

const ClientDetailModal: React.FC<ClientDetailModalProps> = ({ client, allBookings, onClose, onCreateBooking, onEditClient }) => {
  const clientBookings = allBookings.filter(booking => booking.client === client.name);

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
                className="text-sm px-3 py-1 bg-green-600 text-white border border-green-700 rounded hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
              >
                + New Booking
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
          </div>
        </section>

        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Booking History Breakdown</h3>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 font-mono">{booking.id}</td>
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

        <div className="flex justify-end mt-8 pt-4 border-t border-gray-100 space-x-4">
          <button
            type="button"
            onClick={() => onCreateBooking(client)}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors font-medium"
          >
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
