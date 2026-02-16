
import React, { useState } from 'react';

// Define interface for the data structure submitted by this form
export interface NewClientFormData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  totalBookings: number;
}

interface NewClientFormProps {
  onClose: () => void;
  onSubmit: (clientData: NewClientFormData) => void;
}

const NewClientForm: React.FC<NewClientFormProps> = ({ onClose, onSubmit }) => {
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientEmail) {
      alert('Client Name and Email are required.');
      return;
    }

    const newClient: NewClientFormData = {
      id: `C${Math.random().toString(36).substr(2, 9).toUpperCase()}`, // Simple unique ID
      name: clientName,
      email: clientEmail,
      phone: clientPhone || undefined,
      address: clientAddress || undefined,
      totalBookings: 0, // New clients start with 0 bookings
    };
    onSubmit(newClient);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">Add New Client</h2>
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
            <label htmlFor="clientPhone" className="block text-sm font-medium text-gray-700">Phone Number (Optional)</label>
            <input
              type="tel"
              id="clientPhone"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="clientAddress" className="block text-sm font-medium text-gray-700">Address (Optional)</label>
            <input
              type="text"
              id="clientAddress"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={clientAddress}
              onChange={(e) => setClientAddress(e.target.value)}
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
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
            >
              Add Client
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewClientForm;
