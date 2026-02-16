import React, { useState } from 'react';

interface Client {
  id: string;
  name: string;
  email: string;
  walletBalance?: number;
}

interface AddFundsModalProps {
  clients: Client[];
  onClose: () => void;
  onSubmit: (clientId: string, amount: number) => void;
}

const AddFundsModal: React.FC<AddFundsModalProps> = ({ clients, onClose, onSubmit }) => {
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');
  const [amount, setAmount] = useState<number | ''>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedClientId && amount && typeof amount === 'number' && amount > 0) {
      onSubmit(selectedClientId, amount);
      onClose();
    } else {
        alert("Please select a client and enter a valid positive amount.");
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">Manually Add Funds</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="clientSelect" className="block text-sm font-medium text-gray-700">Select Client</label>
            <select
              id="clientSelect"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              required
            >
              <option value="" disabled>-- Select a Client --</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                    {client.name} (Bal: ${client.walletBalance?.toFixed(2) || '0.00'})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount to Credit ($)</label>
            <input
              type="number"
              id="amount"
              min="0.01"
              step="0.01"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value))}
              required
              placeholder="0.00"
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
              Add Funds
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFundsModal;