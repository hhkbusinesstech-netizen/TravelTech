
import React, { useState } from 'react';

// Define interface for the data structure submitted by this form
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

interface NewBookingFormProps {
  onClose: () => void;
  // Fix: Use the specific NewBookingFormData interface for onSubmit prop type
  onSubmit: (bookingData: NewBookingFormData) => void;
  initialClientData?: { name: string; email: string };
}

const NewBookingForm: React.FC<NewBookingFormProps> = ({ onClose, onSubmit, initialClientData }) => {
  const [clientName, setClientName] = useState(initialClientData?.name || '');
  const [clientEmail, setClientEmail] = useState(initialClientData?.email || '');
  const [serviceType, setServiceType] = useState('Flight');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [numTravelers, setNumTravelers] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const bookingData: NewBookingFormData = { // Explicitly type bookingData
      clientName,
      clientEmail,
      serviceType,
      destination,
      departureDate,
      returnDate,
      numTravelers,
      status: 'Pending', // New bookings typically start as pending
      date: new Date().toISOString().slice(0, 10), // Current date
      id: `B${Math.random().toString(36).substr(2, 9).toUpperCase()}`, // Simple unique ID
      travelers: [`${clientName}`], // For simplicity, only clientName for now
      price: '$0.00' // Price to be determined later
    };
    onSubmit(bookingData);
    onClose(); // Close the form after submission
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">Create New Booking</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="clientName" className="block text-sm font-medium text-gray-700">Client Name</label>
            <input
              type="text"
              id="clientName"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              required
              aria-required="true"
            />
          </div>
          <div>
            <label htmlFor="clientEmail" className="block text-sm font-medium text-gray-700">Client Email</label>
            <input
              type="email"
              id="clientEmail"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              required
              aria-required="true"
            />
          </div>
          <div>
            <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700">Service Type</label>
            <select
              id="serviceType"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              required
              aria-required="true"
            >
              <option value="Flight">Flight</option>
              <option value="Hotel">Hotel</option>
              <option value="Package">Package</option>
              <option value="Visa">Visa</option>
              <option value="Add-on">Add-on</option>
            </select>
          </div>
          <div>
            <label htmlFor="destination" className="block text-sm font-medium text-gray-700">Destination / Service Name</label>
            <input
              type="text"
              id="destination"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
              aria-required="true"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="departureDate" className="block text-sm font-medium text-gray-700">Departure Date</label>
              <input
                type="date"
                id="departureDate"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                required
                aria-required="true"
              />
            </div>
            <div>
              <label htmlFor="returnDate" className="block text-sm font-medium text-gray-700">Return Date (Optional)</label>
              <input
                type="date"
                id="returnDate"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label htmlFor="numTravelers" className="block text-sm font-medium text-gray-700">Number of Travelers</label>
            <input
              type="number"
              id="numTravelers"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={numTravelers}
              onChange={(e) => setNumTravelers(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              required
              aria-required="true"
            />
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Submit Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewBookingForm;
