
export const ARCHITECTURE_DOCUMENT_CONTENT = `
<h1 class="text-3xl font-bold mb-6 text-gray-800">Phase 1: Flights (Amadeus) + B2C MVP Implementation</h1>

<h2 class="text-2xl font-semibold mt-8 mb-4 text-gray-700">1. Data Model (DocTypes)</h2>
<p class="mb-4 text-gray-600">The following Frappe DocTypes are required to handle the Amadeus lifecycle and B2C flow.</p>

<ul class="list-disc list-inside space-y-4 ml-4 mb-6 text-gray-600">
    <li>
        <strong class="font-medium text-gray-800">Travel Search Session</strong>
        <ul class="list-disc list-inside space-y-1 ml-6 mt-1 text-sm">
            <li><strong>Purpose:</strong> Analytics and debugging.</li>
            <li><strong>Fields:</strong> <code>session_id</code>, <code>search_params</code> (JSON: origin, dest, dates, pax), <code>result_count</code>, <code>platform</code> (Web/App), <code>ip_address</code>.</li>
        </ul>
    </li>
    <li>
        <strong class="font-medium text-gray-800">Flight Offer Snapshot</strong> (Immutable)
        <ul class="list-disc list-inside space-y-1 ml-6 mt-1 text-sm">
            <li><strong>Purpose:</strong> Stores the exact JSON blob returned by Amadeus <code>flight-offers-pricing</code>. This is the contract sold to the customer.</li>
            <li><strong>Fields:</strong> <code>offer_id</code>, <code>source_json</code> (JSON), <code>total_price</code>, <code>currency</code>, <code>expiry_datetime</code> (TTL), <code>fare_rules_summary</code>.</li>
        </ul>
    </li>
    <li>
        <strong class="font-medium text-gray-800">Travel Booking</strong> (Master)
        <ul class="list-disc list-inside space-y-1 ml-6 mt-1 text-sm">
            <li><strong>Purpose:</strong> The central aggregate root for the transaction.</li>
            <li><strong>Fields:</strong> <code>customer</code> (Link to ERPNext Customer), <code>workflow_status</code> (Draft, Pending Payment, Processing, Confirmed, Ticketed, Cancelled, Failed), <code>total_amount</code>, <code>currency</code>, <code>amadeus_order_id</code>, <code>pnr_reference</code>, <code>sales_invoice</code> (Link).</li>
        </ul>
    </li>
    <li>
        <strong class="font-medium text-gray-800">Travel Booking Item</strong> (Child Table)
        <ul class="list-disc list-inside space-y-1 ml-6 mt-1 text-sm">
            <li><strong>Purpose:</strong> Specific flight segments within the booking.</li>
            <li><strong>Fields:</strong> <code>carrier_code</code>, <code>flight_number</code>, <code>departure_time</code>, <code>arrival_time</code>, <code>cabin_class</code>, <code>status</code> (Confirmed/Waitlist).</li>
        </ul>
    </li>
    <li>
        <strong class="font-medium text-gray-800">Traveler</strong> (PII Heavy)
        <ul class="list-disc list-inside space-y-1 ml-6 mt-1 text-sm">
            <li><strong>Purpose:</strong> Passenger details.</li>
            <li><strong>Fields:</strong> <code>first_name</code>, <code>last_name</code>, <code>dob</code>, <code>gender</code>, <code>nationality</code>.</li>
            <li><strong>Security:</strong> <code>passport_number</code> and <code>expiry</code> <strong>MUST</strong> be Encrypted fields (Frappe <code>Data</code> type with 'Ignore XSS' or specialized Encrypted field).</li>
        </ul>
    </li>
    <li>
        <strong class="font-medium text-gray-800">Provider Log</strong> (Audit)
        <ul class="list-disc list-inside space-y-1 ml-6 mt-1 text-sm">
            <li><strong>Purpose:</strong> Debugging external calls.</li>
            <li><strong>Fields:</strong> <code>endpoint</code>, <code>request_payload</code> (Redacted PII), <code>response_payload</code>, <code>status_code</code>, <code>duration_ms</code>.</li>
        </ul>
    </li>
</ul>

<h2 class="text-2xl font-semibold mt-8 mb-4 text-gray-700">2. Booking State Machine</h2>

<div class="bg-gray-800 text-green-400 p-4 rounded-md mb-6 font-mono text-xs overflow-x-auto">
<pre>
[User]                 [System]                  [Amadeus]                 [Finance]
  |                       |                         |                         |
  |-- (1) Search/Pick --->|                         |                         |
  |                       |--(2) Price/Validate --->|                         |
  |                       |<-- Offer JSON ----------|                         |
  |                       |                         |                         |
  |-- (3) Enter Pax/Pay ->|                         |                         |
  |                       |-- (4) Create State:     |                         |
  |                       |    "Pending Payment"    |                         |
  |                       |                         |                         |
  |-- (5) Payment Success>|                         |                         |
  |                       |-- (6) Create State:     |                         |
  |                       |    "Processing"         |                         |
  |                       |------------------------>| (7) Create Order (PNR)  |
  |                       |<-- Order ID/PNR --------|                         |
  |                       |                         |                         |
  |                       |-- (8) Create State:     |                         |
  |                       |    "Booked"             |                         |
  |                       |                         |----(9) Create Invoice ->|
  |                       |                         |----(10) Payment Entry ->|
  |                       |                         |                         |
  |                       |-- (11) Async Job:       |                         |
  |                       |    Issue Ticket --------> (12) Issue Ticket       |
  |                       |<-- Ticket Numbers ------|                         |
  |                       |                         |                         |
  |                       |-- (13) Create State:    |                         |
  |                       |    "Ticketed"           |                         |
  |<-- (14) Email PDF ----|                         |                         |
</pre>
</div>

<ul class="list-disc list-inside space-y-2 ml-4 mb-6 text-gray-600">
    <li><strong>Sync Operations:</strong> Search, Price Validation, Booking Creation (internal), Payment Intent Creation.</li>
    <li><strong>Async Operations:</strong> Amadeus Order Creation (PNR) can be sync, but <strong>Ticket Issuance</strong> must be async to handle API timeouts or manual fulfillment queues.</li>
    <li><strong>Failure States:</strong>
        <ul class="list-disc list-inside space-y-1 ml-6">
            <li><code>Payment Failed</code>: User retries.</li>
            <li><code>Booking Failed</code>: Payment taken, but PNR creation failed. <strong>Critical:</strong> Alert Ops immediately for manual refund or re-booking.</li>
            <li><code>Ticketing Failed</code>: PNR created, but ticket issuance failed (credit limit/technical). Moves to <code>Needs Manual Review</code> queue.</li>
        </ul>
    </li>
</ul>

<h2 class="text-2xl font-semibold mt-8 mb-4 text-gray-700">3. REST APIs (v1)</h2>
<p class="mb-4 text-gray-600">These endpoints reside in <code>travel_core</code>/<code>booking_engine</code> and call <code>travel_connectors</code>.</p>

<div class="space-y-4">
    <div class="border-l-4 border-blue-500 pl-4">
        <h4 class="font-bold text-gray-800">POST /api/v1/flights/search</h4>
        <p class="text-sm text-gray-600">Wrapper for <code>shopping/flight-offers</code>.</p>
        <code class="text-xs bg-gray-100 p-1 rounded">Input: { origin, destination, dates, travelers }</code>
    </div>
    <div class="border-l-4 border-blue-500 pl-4">
        <h4 class="font-bold text-gray-800">POST /api/v1/flights/price</h4>
        <p class="text-sm text-gray-600">Wrapper for <code>shopping/flight-offers/pricing</code>.</p>
        <code class="text-xs bg-gray-100 p-1 rounded">Input: { offer_json_blob }</code>
    </div>
    <div class="border-l-4 border-green-500 pl-4">
        <h4 class="font-bold text-gray-800">POST /api/v1/flights/book</h4>
        <p class="text-sm text-gray-600">Creates <code>Travel Booking</code> (Draft) and initiates Payment.</p>
        <code class="text-xs bg-gray-100 p-1 rounded">Input: { offer_id, travelers[], contact_details }</code>
    </div>
    <div class="border-l-4 border-purple-500 pl-4">
        <h4 class="font-bold text-gray-800">GET /api/v1/bookings/{id}</h4>
        <p class="text-sm text-gray-600">Returns status, PNR, and Ticket numbers.</p>
    </div>
    <div class="border-l-4 border-purple-500 pl-4">
        <h4 class="font-bold text-gray-800">GET /api/v1/bookings/{id}/documents</h4>
        <p class="text-sm text-gray-600">Returns links to PDF E-Ticket and Tax Invoice.</p>
    </div>
</div>

<h2 class="text-2xl font-semibold mt-8 mb-4 text-gray-700">4. Async Jobs (Frappe Background Jobs)</h2>
<ul class="list-disc list-inside space-y-2 ml-4 mb-6 text-gray-600">
    <li><strong><code>jobs.issue_flight_booking(booking_id)</code>:</strong>
        Triggered after successful payment.
        <ol class="list-decimal list-inside ml-6 text-sm">
            <li>Lock booking row.</li>
            <li>Call Amadeus <code>booking/flight-orders</code>.</li>
            <li>Update <code>pnr_reference</code>.</li>
            <li>Call Amadeus <code>ticket-issuance</code> (if separate).</li>
            <li>Update status to <code>Ticketed</code>.</li>
            <li>Commit. On Error -> Move to <code>Needs Manual Review</code>.</li>
        </ol>
    </li>
    <li><strong><code>jobs.generate_documents(booking_id)</code>:</strong>
        Triggered after status becomes <code>Ticketed</code>. Generates PDF E-Ticket (HTML Template to PDF) and attaches to Doc.
    </li>
    <li><strong><code>jobs.send_notifications(booking_id)</code>:</strong>
        Sends email with E-Ticket and Invoice attachments. Sends SMS confirmation.
    </li>
</ul>

<h2 class="text-2xl font-semibold mt-8 mb-4 text-gray-700">5. Customer Portal Screens (MVP)</h2>
<ul class="list-disc list-inside space-y-2 ml-4 mb-6 text-gray-600">
    <li><strong>My Trips (List View):</strong> Filters for Upcoming/Past/Cancelled. Shows Route, Date, Status (colored badge).</li>
    <li><strong>Trip Details (Detail View):</strong>
        <ul class="list-disc list-inside ml-6 text-sm">
            <li>Header: PNR, Status, Total Amount.</li>
            <li>Itinerary: Timeline view of segments (Airline Logo, Times, Terminal).</li>
            <li>Travelers: List of names associated.</li>
            <li>Action Buttons: "Download E-Ticket", "Download Invoice", "Request Support".</li>
        </ul>
    </li>
    <li><strong>Support Modal:</strong> Simple form linked to ERPNext <code>Issue</code> DocType. Pre-fills Booking ID.</li>
</ul>

<h2 class="text-2xl font-semibold mt-8 mb-4 text-gray-700">6. Minimal ERPNext Finance Integration</h2>
<p class="mb-4 text-gray-600">For Phase 1, we treat financials transactionally without full accounting complexity.</p>
<ul class="list-disc list-inside space-y-2 ml-4 mb-6 text-gray-600">
    <li><strong>Sales Invoice Creation:</strong> Created automatically when <code>Travel Booking</code> status changes to <code>Processing</code> (Payment confirmed). Status: "Paid".</li>
    <li><strong>Payment Entry:</strong> Created immediately upon payment gateway success webhook. Linked against the Sales Invoice.</li>
    <li><strong>Revenue Recognition (Notes):</strong>
        <br/><span class="text-sm italic">Phase 1 Shortcut:</span> The entire amount is booked as Income.
        <br/><span class="text-sm italic">Phase 3 Requirement:</span> We will later split this into "Payable to Supplier" (Liability) and "Service Fee" (Income) using Purchase Invoices.
    </li>
</ul>
`;
