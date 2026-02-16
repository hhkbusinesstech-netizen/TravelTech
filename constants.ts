
export const ARCHITECTURE_DOCUMENT_CONTENT = `
<div class="space-y-8">
  <div class="border-b pb-4">
    <h1 class="text-3xl font-bold text-blue-900">Phase 1: Amadeus Flights MVP</h1>
    <p class="text-gray-600 mt-2">End-to-End Implementation Specification: Search to Ticketing</p>
  </div>

  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-4">1. Booking Flow (ASCII)</h2>
    <div class="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
User                  Frappe/ERPNext             Amadeus API           Payment Gateway
 |                          |                         |                       |
 |--(1) Search Criteria --->|                         |                       |
 |                          |--(2) GET flight-offers->|                       |
 |                          |<-(3) JSON Offers -------|                       |
 |<-(4) Display Results ----|                         |                       |
 |                          |                         |                       |
 |--(5) Select Offer ------>|                         |                       |
 |                          |--(6) POST pricing ----->|                       |
 |                          |<-(7) Validated Offer ---|                       |
 |<-(8) Show Final Price ---|                         |                       |
 |                          |                         |                       |
 |--(9) Enter PAX & Pay --->|                         |                       |
 |                          |--(10) Create Booking (Draft)                    |
 |                          |--(11) Create Payment Intent ------------------->|
 |<-(12) Redirect/Prompt ---|                         |                       |
 |                          |                         |                       |
 |      (User Pays)         |                         |                       |
 |                          |<-(13) Webhook: Success -------------------------|
 |                          |--(14) Update Status: "Processing"               |
 |                          |--(15) Enqueue Job: issue_flight_booking         |
 |                          |                         |                       |
 |           [ASYNC]        |--(16) POST flight-orders (Create PNR) --------->|
 |                          |<-(17) PNR & Ticket # ---|                       |
 |                          |--(18) Update Status: "Ticketed"                 |
 |                          |--(19) Gen. Docs & Email |                       |
 |<-(20) Confirmation Email-|                         |                       |
    </div>
  </section>

  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-4">2. Data Model (DocTypes)</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="border p-4 rounded bg-white shadow-sm">
        <h3 class="font-bold text-blue-700">Travel Booking (Master)</h3>
        <ul class="list-disc ml-5 text-sm text-gray-700 mt-2">
          <li><strong>Naming:</strong> TRV-BKG-.YYYY.-.#####</li>
          <li><strong>Status:</strong> Draft, Pending Payment, Processing, Ticketed, Cancelled, Failed, Manual Review</li>
          <li><strong>Fields:</strong> Customer (Link), Total Amount, Currency, Amadeus Order ID, PNR Reference</li>
          <li><strong>References:</strong> Sales Invoice (Link), Payment Entry (Link)</li>
        </ul>
      </div>
      <div class="border p-4 rounded bg-white shadow-sm">
        <h3 class="font-bold text-blue-700">Flight Offer (Snapshot)</h3>
        <ul class="list-disc ml-5 text-sm text-gray-700 mt-2">
          <li><strong>Purpose:</strong> Immutable record of what was sold.</li>
          <li><strong>Fields:</strong> Offer ID (Hash), Full JSON Blob, Expiry DateTime (TTL)</li>
          <li><strong>Logic:</strong> If booking is attempted after TTL, force re-price.</li>
        </ul>
      </div>
      <div class="border p-4 rounded bg-white shadow-sm">
        <h3 class="font-bold text-blue-700">Traveler</h3>
        <ul class="list-disc ml-5 text-sm text-gray-700 mt-2">
          <li><strong>Fields:</strong> First/Last Name, DOB, Gender, Nationality</li>
          <li><strong>PII Security:</strong> Passport Number & Expiry must be <code>Encrypted</code> field type.</li>
        </ul>
      </div>
      <div class="border p-4 rounded bg-white shadow-sm">
        <h3 class="font-bold text-blue-700">Provider API Log</h3>
        <ul class="list-disc ml-5 text-sm text-gray-700 mt-2">
          <li><strong>Fields:</strong> Endpoint, Method, Request (Redacted), Response, Status Code, Duration</li>
          <li><strong>Retention:</strong> Auto-delete after 30 days.</li>
        </ul>
      </div>
    </div>
  </section>

  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-4">3. Booking State Machine</h2>
    <ul class="space-y-2 text-sm text-gray-800">
      <li><span class="inline-block w-32 font-bold text-gray-600">Draft:</span> Initial creation, user filling details.</li>
      <li><span class="inline-block w-32 font-bold text-yellow-600">Pending Payment:</span> Payment Intent created, awaiting gateway callback.</li>
      <li><span class="inline-block w-32 font-bold text-blue-600">Processing:</span> Payment confirmed. Async job <code>issue_flight_booking</code> queued.</li>
      <li><span class="inline-block w-32 font-bold text-green-600">Ticketed:</span> Success. PNR and Ticket Numbers received from Amadeus.</li>
      <li><span class="inline-block w-32 font-bold text-red-600">Failed:</span> Payment failed.</li>
      <li><span class="inline-block w-32 font-bold text-orange-600">Manual Review:</span> Payment success, but Amadeus booking/ticketing failed. Critical Alert.</li>
    </ul>
  </section>

  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-4">4. REST APIs (v1)</h2>
    <div class="bg-gray-50 p-4 rounded border">
      <h4 class="font-mono font-bold text-blue-600">POST /v1/flights/search</h4>
      <p class="text-sm text-gray-600 mb-2">Wrapper for <code>shopping/flight-offers</code></p>
      
      <h4 class="font-mono font-bold text-blue-600 mt-3">POST /v1/flights/price</h4>
      <p class="text-sm text-gray-600 mb-2">Wrapper for <code>shopping/flight-offers/pricing</code>. Returns confirmable offer.</p>

      <h4 class="font-mono font-bold text-blue-600 mt-3">POST /v1/flights/book</h4>
      <pre class="bg-gray-100 p-2 text-xs mt-1 border rounded">
{
  "offer_id": "...",
  "travelers": [{ ... }],
  "contact": { ... }
}
// Returns: { "booking_id": "...", "payment_url": "..." }
      </pre>

      <h4 class="font-mono font-bold text-blue-600 mt-3">GET /v1/bookings/{id}</h4>
      <p class="text-sm text-gray-600">Poll status. Returns PNR if Ticketed.</p>
    </div>
  </section>

  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-4">5. Async Jobs & Worker Queues</h2>
    <ul class="list-decimal ml-5 text-gray-700 space-y-2">
      <li>
        <strong>issue_flight_booking (High Priority Queue):</strong>
        <br>Checks balance (if B2B) or payment status (B2C). Calls Amadeus <code>booking/flight-orders</code>. On success, updates Booking status to 'Ticketed' and commits PNR. On Amadeus 4xx/5xx, moves Booking to 'Manual Review'.
      </li>
      <li>
        <strong>generate_documents (Default Queue):</strong>
        <br>Generates HTML->PDF E-Ticket using Jinja template. Attaches to Booking DocType.
      </li>
      <li>
        <strong>send_notifications (Default Queue):</strong>
        <br>Sends transactional email with attachments.
      </li>
    </ul>
  </section>

  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-4">6. Finance Integration (MVP)</h2>
    <div class="bg-yellow-50 p-4 border-l-4 border-yellow-400">
      <h4 class="font-bold text-yellow-800">Trigger: State Change to "Processing"</h4>
      <p class="text-sm text-gray-700 mt-1">
        1. <strong>Create Sales Invoice:</strong> Customer = User, Item = "Flight Booking", Amount = Total Price. Status = "Paid".
        <br>
        2. <strong>Create Payment Entry:</strong> Linked to Sales Invoice. Mode of Payment = "Payment Gateway".
      </p>
      <p class="text-xs text-gray-500 mt-2 italic">Note: COGS/Supplier Invoice deferred to Phase 3.</p>
    </div>
  </section>

  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-4">7. Customer Portal (MVP)</h2>
    <ul class="list-disc ml-5 text-gray-700">
      <li><strong>My Trips:</strong> List view filtered by Owner. Tabs: Upcoming, Past, Cancelled.</li>
      <li><strong>Booking Details:</strong> PNR display, Flight Segments (Carrier, Time, Terminal), Passenger List.</li>
      <li><strong>Actions:</strong> Download E-Ticket (PDF), Download Invoice (PDF), Report Issue (creates Support Ticket).</li>
    </ul>
  </section>
</div>
`;
