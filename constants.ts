
export const ARCHITECTURE_DOCUMENT_CONTENT = `
<div class="space-y-8">
  <div class="border-b pb-4 bg-gray-50 p-6 rounded-t-lg">
    <h1 class="text-4xl font-bold text-blue-900">Travel Tech Architecture</h1>
    <p class="text-gray-600 mt-2 text-lg">Phase 1 (MVP) & Phase 2 (B2B Agency Layer)</p>
  </div>

  <!-- PHASE 1 RECAP (Collapsed Visual) -->
  <section class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
    <details>
        <summary class="cursor-pointer text-xl font-bold text-gray-700 hover:text-blue-600 transition-colors">
            Phase 1 Recap: Amadeus Flights MVP (Click to Expand)
        </summary>
        <div class="mt-4 pl-4 border-l-2 border-gray-200 text-sm text-gray-600">
            <p><strong>Core Flow:</strong> Search -> Price -> Book -> Pay -> Issue (Async).</p>
            <p><strong>Key DocTypes:</strong> Travel Booking, Flight Offer (Snapshot), Traveler.</p>
            <p><strong>Finance:</strong> Direct Sales Invoice + Payment Entry (Gateway).</p>
        </div>
    </details>
  </section>

  <!-- PHASE 2 START -->
  <div class="mt-8 pt-6 border-t-2 border-indigo-100">
    <span class="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded uppercase tracking-wide">Phase 2 Focus</span>
    <h2 class="text-3xl font-bold text-indigo-900 mt-2">B2B Agent Portal & Financials</h2>
    <p class="text-gray-600 mt-2">Enabling multi-agent sales with strict isolation, dynamic markups, and wallet/credit management.</p>
  </div>

  <section class="mt-8">
    <h3 class="text-2xl font-bold text-gray-800 mb-4">1. New Data Models (DocTypes)</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      <div class="border border-indigo-100 p-5 rounded-lg bg-white">
        <h4 class="font-bold text-indigo-700 flex items-center">
            <span class="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
            Agent Partner
        </h4>
        <p class="text-sm text-gray-600 mt-1 mb-3">Represents the B2B Agency entity.</p>
        <ul class="list-disc ml-5 text-sm text-gray-700 space-y-1">
          <li><strong>Fields:</strong> Agency Name, Logo, Tax ID, Status (Active/Frozen).</li>
          <li><strong>Finance:</strong> <code>Default Currency</code>, <code>Credit Limit</code> (Float), <code>Billing Customer</code> (Link to ERPNext Customer).</li>
          <li><strong>Settings:</strong> <code>Allow Credit Booking</code> (Check), <code>Account Manager</code> (Link User).</li>
        </ul>
      </div>

      <div class="border border-indigo-100 p-5 rounded-lg bg-white">
        <h4 class="font-bold text-indigo-700 flex items-center">
            <span class="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
            Agent User Mapping
        </h4>
        <p class="text-sm text-gray-600 mt-1 mb-3">Links ERPNext Users to an Agent Partner.</p>
        <ul class="list-disc ml-5 text-sm text-gray-700 space-y-1">
          <li><strong>Fields:</strong> <code>User</code> (Link), <code>Agent Partner</code> (Link), <code>Role</code> (Admin/Staff).</li>
          <li><strong>Logic:</strong> Used in permission queries to filter visibility.</li>
        </ul>
      </div>

      <div class="border border-indigo-100 p-5 rounded-lg bg-white">
        <h4 class="font-bold text-indigo-700 flex items-center">
            <span class="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
            Agent Wallet & Ledger
        </h4>
        <p class="text-sm text-gray-600 mt-1 mb-3">Prepaid balance management.</p>
        <ul class="list-disc ml-5 text-sm text-gray-700 space-y-1">
          <li><strong>Agent Wallet:</strong> <code>Agent</code>, <code>Current Balance</code>, <code>Currency</code>.</li>
          <li><strong>Wallet Transaction:</strong> <code>Amount</code>, <code>Type</code> (Credit/Debit), <code>Reference</code> (Booking/Payment Entry).</li>
          <li><strong>Credit Ledger:</strong> Virtual limit tracking distinct from actual cash.</li>
        </ul>
      </div>

      <div class="border border-indigo-100 p-5 rounded-lg bg-white">
        <h4 class="font-bold text-indigo-700 flex items-center">
            <span class="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
            Markup Rule
        </h4>
        <p class="text-sm text-gray-600 mt-1 mb-3">Dynamic pricing engine.</p>
        <ul class="list-disc ml-5 text-sm text-gray-700 space-y-1">
          <li><strong>Scope:</strong> Global, Agent Group, Specific Agent.</li>
          <li><strong>Filters:</strong> Supplier (Amadeus), Airline, Cabin, Route (Origin/Dest).</li>
          <li><strong>Action:</strong> Fixed Amount OR Percentage.</li>
          <li><strong>Priority:</strong> Integer (Higher applies first).</li>
        </ul>
      </div>

    </div>
  </section>

  <section class="mt-8">
    <h3 class="text-2xl font-bold text-gray-800 mb-4">2. Pricing Logic & Explainability</h3>
    <div class="bg-gray-900 text-gray-300 p-5 rounded-lg font-mono text-xs overflow-x-auto">
// Pricing Structure in "Flight Offer" Snapshot & "Travel Booking"

{
  "currency": "USD",
  "base_fare": 100.00,      // From Amadeus
  "taxes": 45.50,           // From Amadeus
  "supplier_total": 145.50, // Cost to Platform

  "pricing_components": [
    {
      "label": "Platform Markup",
      "amount": 10.00,
      "source": "Markup Rule #MR-2024-001 (Global 10%)"
    },
    {
      "label": "Agent Markup",
      "amount": 25.00,
      "source": "Input by Agent User during checkout"
    }
  ],

  "net_to_agent": 155.50,   // Amount deducted from Wallet (145.50 + 10.00)
  "selling_price": 180.50   // Amount shown on Customer Ticket
}
    </div>
    <p class="text-sm text-gray-500 mt-2 italic">
        * "Net to Agent" is what we invoice. "Selling Price" is what the Agent invoices their client (off-platform or via generated receipt).
    </p>
  </section>

  <section class="mt-8">
    <h3 class="text-2xl font-bold text-gray-800 mb-4">3. Security & Isolation (Hooks)</h3>
    <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <h4 class="font-bold text-yellow-800">Permission Query Condition</h4>
        <p class="text-sm text-gray-700 mt-1">
            We enforce strict data isolation via <code>hooks.py</code> permission queries.
            An agent MUST ONLY see bookings linked to their Agency.
        </p>
    </div>
    <div class="mt-4 bg-gray-100 p-4 rounded border border-gray-200 font-mono text-xs text-blue-800">
# hooks.py
permission_query_conditions = {
    "Travel Booking": "travel_app.permissions.get_agent_booking_conditions",
    "Traveler": "travel_app.permissions.get_agent_traveler_conditions"
}

# permissions.py
def get_agent_booking_conditions(user):
    if "System Manager" in frappe.get_roles(user):
        return "" # See all
    
    agent_id = get_agent_for_user(user)
    if agent_id:
        # Only show bookings where the custom field 'agent_partner' matches
        return f"agent_partner = '{agent_id}'"
    
    return "1=0" # Fallback: see nothing
    </div>
  </section>

  <section class="mt-8">
    <h3 class="text-2xl font-bold text-gray-800 mb-4">4. Finance Integration (Wallet/Credit)</h3>
    
    <div class="space-y-4">
        <div class="flex items-start">
            <div class="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-xs mt-1">A</div>
            <div class="ml-3">
                <h4 class="text-md font-bold text-gray-800">Booking via Wallet (Prepaid)</h4>
                <p class="text-sm text-gray-600">
                    1. <strong>Check:</strong> <code>Wallet Balance >= Net to Agent</code>.<br>
                    2. <strong>Lock:</strong> Reserve funds temporarily.<br>
                    3. <strong>Success:</strong> Create <code>Wallet Transaction</code> (Debit). Status -> Processing.<br>
                    4. <strong>Invoice:</strong> Create Sales Invoice (Status: Paid). Link Transaction.
                </p>
            </div>
        </div>

        <div class="flex items-start">
            <div class="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs mt-1">B</div>
            <div class="ml-3">
                <h4 class="text-md font-bold text-gray-800">Booking via Credit Limit (Postpaid)</h4>
                <p class="text-sm text-gray-600">
                    1. <strong>Check:</strong> <code>(Current Debt + Net to Agent) <= Credit Limit</code>.<br>
                    2. <strong>Record:</strong> Add to <code>Credit Limit Ledger</code>.<br>
                    3. <strong>Invoice:</strong> Create Sales Invoice (Status: Unpaid/Overdue). Payment Term: Net 15/30.<br>
                    4. <strong>Settlement:</strong> Agent pays bulk via Bank Transfer. Admin creates Payment Entry to clear Invoices.
                </p>
            </div>
        </div>
    </div>
  </section>

  <section class="mt-8">
    <h3 class="text-2xl font-bold text-gray-800 mb-4">5. Agent Portal Deliverables</h3>
    <ul class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
        <li class="bg-gray-50 p-3 rounded border border-gray-200">
            <strong>Agent Dashboard:</strong> Wallet Balance widget, Credit Limit usage bar, Recent Bookings table, Quick Search.
        </li>
        <li class="bg-gray-50 p-3 rounded border border-gray-200">
            <strong>B2B Search Flow:</strong> Standard search but prices displayed are "Net" by default. Toggle to "Show Commission".
        </li>
        <li class="bg-gray-50 p-3 rounded border border-gray-200">
            <strong>Markup Control:</strong> During checkout, Agent can add "Service Fee" (Fixed) or "Margin" (%) before generating the Quote/PDF.
        </li>
        <li class="bg-gray-50 p-3 rounded border border-gray-200">
            <strong>Reports:</strong> "Agent Sales Register", "Profitability Report" (Markup vs Cost), "Statement of Accounts".
        </li>
    </ul>
  </section>
</div>
`;
