
export const ARCHITECTURE_DOCUMENT_CONTENT = `
<h1 class="text-3xl font-bold mb-6 text-gray-800">ShareTrip-Style Platform System Foundation</h1>

<h2 class="text-2xl font-semibold mt-8 mb-4 text-gray-700">1. Module Map</h2>
<ul class="list-disc list-inside space-y-2 ml-4 mb-6 text-gray-600">
    <li>
        <strong class="font-medium text-gray-800">Core Travel Services:</strong>
        <ul class="list-disc list-inside space-y-1 ml-6 mt-1">
            <li><strong>Flights:</strong> Search, Booking, PNR Management, Ticketing, Ancillaries, Cancellations/Refunds, Fare Rules.</li>
            <li><strong>Hotels:</strong> Search, Booking, Room Management, Cancellations/Refunds, Special Requests.</li>
            <li><strong>Packages:</strong> Dynamic/Static Package Creation, Itinerary Management, Pricing, Booking, Components (flights, hotels, activities).</li>
            <li><strong>Visa:</strong> Application Tracking, Document Management, Status Updates, Fee Management.</li>
            <li><strong>Add-ons:</strong> Travel Insurance, Airport Transfers, Activities/Tours, Lounge Access.</li>
        </ul>
    </li>
    <li>
        <strong class="font-medium text-gray-800">Portals:</strong>
        <ul class="list-disc list-inside space-y-1 ml-6 mt-1">
            <li><strong>Customer Portal (B2C/B2B):</strong> Booking History, Profile Management, Wishlist, Notifications, Self-service Cancellations/Modifications.</li>
            <li><strong>Agent Portal (B2B):</strong> Client Management, Booking Management, Commission Tracking, Quoting, Sub-agency tools.</li>
            <li><strong>Vendor Portal:</strong> Inventory/Rate Management (Hotels), Booking Confirmation/Updates, Payment Reconciliation, Performance Reports.</li>
        </ul>
    </li>
    <li>
        <strong class="font-medium text-gray-800">Operations & Support:</strong>
        <ul class="list-disc list-inside space-y-1 ml-6 mt-1">
            <li><strong>Helpdesk:</strong> Ticket Management, Customer/Booking Inquiry Handling, FAQ integration.</li>
            <li><strong>Booking Fulfilment:</strong> Manual Intervention, Supplier Communication, Service Delivery Monitoring.</li>
            <li><strong>Content Management:</strong> Destination guides, Promotions, Blog.</li>
        </ul>
    </li>
    <li>
        <strong class="font-medium text-gray-800">Finance & Settlement:</strong>
        <ul class="list-disc list-inside space-y-1 ml-6 mt-1">
            <li><strong>Billing & Invoicing:</strong> Customer Invoices, Agent Billings, Supplier Invoices.</li>
            <li><strong>Payment Gateway Integration:</strong> Online Payments, Offline Payment Tracking.</li>
            <li><strong>Commission Management:</strong> Agent Commissions, Supplier Payables.</li>
            <li><strong>Refund Management:</strong> Processing, Tracking, Payouts.</li>
            <li><strong>Accounting Integration:</strong> General Ledger, Chart of Accounts, Financial Reporting.</li>
        </ul>
    </li>
</ul>

<h2 class="text-2xl font-semibold mt-8 mb-4 text-gray-700">2. Roles & Permissions Overview</h2>
<ul class="list-disc list-inside space-y-2 ml-4 mb-6 text-gray-600">
    <li><strong class="font-medium text-gray-800">Admin:</strong> Full system access. Configure settings, manage users, override operations, view all reports.</li>
    <li><strong class="font-medium text-gray-800">Ops (Operations Executive):</strong> Manage bookings (create, modify, cancel), handle customer inquiries, communicate with vendors/agents, fulfill visas/add-ons. Limited financial view (e.g., booking values).</li>
    <li><strong class="font-medium text-gray-800">Finance (Accountant/Finance Manager):</strong> Manage invoices (sales, purchase), process payments/refunds, reconcile accounts, generate financial reports. View all financial data.</li>
    <li><strong class="font-medium text-gray-800">Vendor (Supplier User):</strong> Manage their specific inventory (e.g., hotel rooms, rates), view bookings pertaining to their services, update booking statuses, view payout statements. Restricted to their own data.</li>
    <li><strong class="font-medium text-gray-800">Agent (Travel Agent):</strong> Create/manage bookings for their clients, view client profiles, track commissions, generate quotes. Restricted to their own and their clients' data.</li>
    <li><strong class="font-medium text-gray-800">Customer (End User):</strong> View their own bookings, manage personal profile, make payments, request cancellations/modifications. Restricted to their own data.</li>
</ul>

<h2 class="text-2xl font-semibold mt-8 mb-4 text-gray-700">3. App Architecture (Frappe/ERPNext)</h2>
<ul class="list-disc list-inside space-y-2 ml-4 mb-6 text-gray-600">
    <li>
        <strong class="font-medium text-gray-800">ERPNext (v15/v16):</strong>
        <ul class="list-disc list-inside space-y-1 ml-6 mt-1">
            <li><strong>Finance & Accounting:</strong> Sales Invoice, Purchase Invoice, Payment Entry, Journal Entry, Chart of Accounts, Bank Accounts, Supplier, Customer, General Ledger.</li>
            <li><strong>HR (Limited):</strong> Employee Management (for internal staff).</li>
            <li><strong>CRM (Limited):</strong> Lead/Opportunity Management (potential B2B clients).</li>
            <li><strong>Support:</strong> Issue/Helpdesk module for customer and agent queries.</li>
            <li><strong>Assets:</strong> Internal asset management.</li>
        </ul>
    </li>
    <li>
        <strong class="font-medium text-gray-800">Custom Apps:</strong>
        <ul class="list-disc list-inside space-y-1 ml-6 mt-1">
            <li>
                <strong class="font-medium text-gray-800"><code>travel_core</code> (Frappe App):</strong>
                <ul class="list-disc list-inside space-y-1 ml-6 mt-1">
                    <li><strong>Purpose:</strong> Foundational data models and core travel business logic.</li>
                    <li><strong>Logic/Data:</strong> DocTypes for <code>Flight Itinerary</code>, <code>Hotel Booking</code>, <code>Travel Package</code>, <code>Visa Application</code>, <code>AddOn Service</code>, <code>Passenger</code>, <code>Vendor</code> (extended ERPNext Supplier), <code>Agent</code> (extended ERPNext Customer/Company), <code>Airline</code>, <code>Hotel Property</code>. Pricing rules, currency conversion. Quote/Booking status workflows.</li>
                </ul>
            </li>
            <li>
                <strong class="font-medium text-gray-800"><code>booking_engine</code> (Frappe App):</strong>
                <ul class="list-disc list-inside space-y-1 ml-6 mt-1">
                    <li><strong>Purpose:</strong> Handles the complex search, availability, pricing, and booking orchestration across different product types and integrations.</li>
                    <li><strong>Logic/Data:</strong> Search algorithms, availability caching, pricing aggregation, booking flow management, payment initiation integration, coupon/discount management, fare/rate validation. Interacts heavily with <code>travel_connectors</code>.</li>
                </ul>
            </li>
            <li>
                <strong class="font-medium text-gray-800"><code>travel_connectors</code> (Frappe App):</strong>
                <ul class="list-disc list-inside space-y-1 ml-6 mt-1">
                    <li><strong>Purpose:</strong> Abstraction layer for external APIs (Amadeus, Hotel Aggregators, Payment Gateways, SMS/Email).</li>
                    <li><strong>Logic/Data:</strong> Connector configurations, API client implementations (e.g., <code>AmadeusAPI</code>, <code>HotelbedsAPI</code>), request/response mapping, error handling for external calls. Each external service gets its own sub-module or DocType.</li>
                </ul>
            </li>
            <li>
                <strong class="font-medium text-gray-800"><code>travel_portals</code> (Frappe App):</strong>
                <ul class="list-disc list-inside space-y-1 ml-6 mt-1">
                    <li><strong>Purpose:</strong> Houses the specific UI/UX and business logic for each user-facing portal (Customer, Agent, Vendor).</li>
                    <li><strong>Logic/Data:</strong> Portal pages (templates), authentication/authorization for portal users, specific data views for each role, portal-specific workflows (e.g., agent quoting, vendor inventory updates). Utilizes REST APIs exposed by <code>travel_core</code> and <code>booking_engine</code>.</li>
                </ul>
            </li>
        </ul>
    </li>
</ul>

<h2 class="text-2xl font-semibold mt-8 mb-4 text-gray-700">4. Infrastructure Topology Recommendation</h2>
<ul class="list-disc list-inside space-y-2 ml-4 mb-6 text-gray-600">
    <li><strong class="font-medium text-gray-800">Web Servers (Nginx + Gunicorn/Frappe Bench):</strong> Multiple instances for high availability and load balancing. Serve static assets (CDN offload). Reverse proxy to Frappe/Gunicorn workers.</li>
    <li><strong class="font-medium text-gray-800">Frappe Workers (Gunicorn/Supervisor):</strong> Dedicated worker processes for HTTP requests (web.worker). Separate worker processes for background jobs (async.worker). Scalable horizontally based on load.</li>
    <li><strong class="font-medium text-gray-800">Redis:</strong> Primary for caching (sessions, data, API responses). Used as a message broker for Frappe Queues (background jobs). Ephemeral storage for real-time operations.</li>
    <li><strong class="font-medium text-gray-800">Database (PostgreSQL or MariaDB):</strong> Primary data persistence. High availability setup (e.g., master-replica with failover). Regular backups.</li>
    <li><strong class="font-medium text-gray-800">Object Storage (S3-compatible, e.g., AWS S3, Google Cloud Storage):</strong> Store user-uploaded files (e.g., passport scans for visa), invoice PDFs, media assets. Scalable, durable, cost-effective.</li>
    <li><strong class="font-medium text-gray-800">CDN (Content Delivery Network, e.g., Cloudflare, AWS CloudFront):</strong> Cache static assets (JS, CSS, images) for faster delivery. Improve website performance and reduce origin server load.</li>
    <li>
        <strong class="font-medium text-gray-800">Observability Stack (Monitoring, Logging, Tracing):</strong>
        <ul class="list-disc list-inside space-y-1 ml-6 mt-1">
            <li><strong>Monitoring:</strong> Prometheus/Grafana (system metrics, application metrics), Sentry (error tracking).</li>
            <li><strong>Logging:</strong> Centralized log aggregation (ELK Stack, Loki+Promtail+Grafana, Datadog) for all application, web server, and worker logs.</li>
            <li><strong>Tracing:</strong> Jaeger/OpenTelemetry for distributed tracing across microservices and external API calls.</li>
        </ul>
    </li>
</ul>

<h2 class="text-2xl font-semibold mt-8 mb-4 text-gray-700">5. Non-Negotiable Engineering Rules</h2>
<ul class="list-disc list-inside space-y-2 ml-4 mb-6 text-gray-600">
    <li><strong class="font-medium text-gray-800">Immutable Quote Snapshots:</strong> Any issued quote (Flight, Hotel, Package) must be snapshotted at the time of creation/issuance. Changes to underlying inventory, pricing, or taxes should not retrospectively alter an issued quote. A new quote revision/ID must be generated for any material change. This ensures auditability and prevents discrepancies between quoted and booked prices.</li>
    <li><strong class="font-medium text-gray-800">Idempotency Keys for Book/Pay/Issue/Refund:</strong> All critical write operations (booking, payment, ticketing, refund processing) to external systems or internal financial ledgers <strong>must</strong> include an idempotency key. This prevents duplicate processing if a request is retried due to network issues or transient errors. Keys should be unique per operation and associated with the transaction context.</li>
    <li><strong class="font-medium text-gray-800">Async Jobs + Retries + Dead-Letter Queue:</strong> Long-running or external API-dependent tasks (e.g., supplier booking confirmation, payment gateway callbacks, email notifications) <strong>must</strong> be processed asynchronously via Frappe Background Jobs. Implement robust retry mechanisms with exponential backoff for transient failures. Jobs failing after all retries <strong>must</strong> be moved to a Dead-Letter Queue (DLQ) for manual inspection and recovery. This prevents data loss and ensures eventual consistency.</li>
    <li><strong class="font-medium text-gray-800">PII Encryption & Log Masking:</strong> Personally Identifiable Information (PII) such as passport numbers, credit card details (if stored), email addresses, phone numbers <strong>must</strong> be encrypted at rest in the database. Sensitive PII <strong>must</strong> be masked or redacted from all application logs, access logs, and monitoring dashboards. Access to decrypted PII should be strictly controlled via role-based access and audited. Implement secure transmission protocols (TLS/SSL) for all data in transit.</li>
</ul>
`;
