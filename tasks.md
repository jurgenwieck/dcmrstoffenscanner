# Project Tasks

## POC Phase - Basic Image Upload & Extraction

### Setup & Configuration
- [ ] Create Azure AI Foundry project and DCMR analysis agent
  - Add agent instructions from `azure/ai-foundry/dcmr-agent-instructions.md`
  - Test agent with representative label photos
- [ ] Collect 5-10 test images of chemical product labels
  - Include various angles, lighting conditions
  - Include products with clear EAN barcodes
  - Document expected extraction results

### Core POC Implementation
- [ ] Create basic file upload component
  - [ ] Build `ImageUpload.vue` component with file input
  - [ ] Add image preview functionality
  - [ ] Validate file type (JPEG, PNG only)
  - [ ] Add file size validation (max 4MB)
- [ ] Implement Azure analysis API integration
  - [x] Create helper function in `src/shared/helpers/dcmrApi.ts`
  - [ ] Design prompt for structured product extraction
  - [ ] Request JSON response with: product_name, ean_code
  - [ ] Add error handling for API failures
- [ ] Create extraction results display component
  - [ ] Build `ExtractionResults.vue` to show extracted data
  - [ ] Display product name and EAN code
  - [ ] Show loading state during API call
  - [ ] Handle empty/failed extraction gracefully
- [ ] Create POC page/view
  - [ ] Build `ScanPOC.vue` view
  - [ ] Wire up: upload → extract → display flow
  - [ ] Add "Try Another" button to restart

### POC Testing & Validation
- [ ] Test extraction with all collected images
  - Document accuracy rate for product names
  - Document accuracy rate for EAN codes
  - Record average response times
  - Calculate approximate API costs per scan
- [ ] Refine Azure AI Foundry Agent instructions based on test results
  - Iterate on prompt engineering for better accuracy
  - Test multilingual label support

---

## POC Extension - Substance Validation with ADR Limits

### Substance Detection & Extraction
- [x] Create Substance interface
  - [x] Define `src/shared/interfaces/Substance.ts`
  - [x] Include ADR class, packaging group, quantity, unit fields
  - [x] Add validation and override fields
- [x] Create ADR validation helper
  - [x] Define `src/shared/helpers/adrValidation.ts`
  - [x] Implement ADR limits table based on MBA 3.2.9 artikel 3.27 BAL
  - [x] Create validation function for substances
  - [x] Support all packaging groups (VP I, VP II, VP III, I1, I2, etc.)
- [x] Update visionHelper for substance extraction
  - [x] Create `extractSubstances()` function
  - [x] Design prompt to detect multiple substances in image
  - [x] Extract ADR class, packaging group, quantity, and unit
  - [x] Return structured data with substance count

### Substance Display & Validation UI
- [x] Create SubstanceCard component
  - [x] Build `src/components/SubstanceCard.vue`
  - [x] Display substance details (name, ADR class, packaging group, quantity)
  - [x] Show validation status with badges (OK, Over Limit, Override)
  - [x] Display warning when limit exceeded
  - [x] Show matched ADR rule details
  - [x] Add human override functionality with reason input
  - [x] Support removing overrides
- [x] Create SubstanceScan view
  - [x] Build `src/views/SubstanceScan.vue`
  - [x] Integrate image upload
  - [x] Call extractSubstances API
  - [x] Validate all extracted substances
  - [x] Display substance cards in grid layout
  - [x] Show summary with counts (over limit, overridden, OK)
  - [x] Disable save button if any substances over limit
  - [x] Add navigation and reset functionality
- [x] Add route and navigation
  - [x] Add SubstanceScan route to router
  - [x] Add navigation button on home page

### Editing & Manual Corrections
- [x] Add number_of_items field to track containers/barrels
  - [x] Update Substance interface
  - [x] Update extraction prompt to count containers
  - [x] Distinguish between per-container and total quantity
- [x] Add edit mode to SubstanceCard
  - [x] Edit substance name
  - [x] Edit ADR class
  - [x] Edit packaging group
  - [x] Edit quantity per container
  - [x] Edit unit (liter/KG)
  - [x] Edit number of containers
  - [x] Edit UN and CAS numbers
  - [x] Auto-reset override when validation fields change
  - [x] Display total quantity calculation

### Testing & Validation
- [ ] Test with chemical product images
  - Test with single substance images
  - Test with multiple substances in one image
  - Verify ADR class extraction accuracy
  - Verify quantity and unit detection
  - Verify container counting accuracy
- [ ] Test validation logic
  - Verify each ADR class validates correctly
  - Test packaging group matching (VP I en II, VP II en III, I1 en I2)
  - Test unit conversion and comparison
  - Verify human override functionality
  - Test validation after manual edits
- [ ] Document substance validation workflow
  - Add usage examples to documentation
  - Document ADR table reference
  - Document editing and override workflows

---

## Inspection Session - Multi-Photo Workflow

### Data Models & State Management
- [x] Create Inspection interface
  - [x] Define `src/shared/interfaces/Inspection.ts`
  - [x] Include InspectionPhoto interface for tracking photos
  - [x] Add SubstanceGroup for grouped reporting
  - [x] Add InspectionSummary for statistics
- [x] Create inspection Pinia store
  - [x] Define `src/stores/inspection.ts`
  - [x] Implement inspection CRUD operations
  - [x] Add photo management (add, complete, cancel, delete)
  - [x] Implement substance grouping logic
  - [x] Add validation across all photos
- [x] Update Substance interface
  - [x] Add ai_reasoning field for AI explanations
  - [x] Add photo_id for tracking source photo
  - [x] Support N/A packaging group option

### Inspection Session Flow
- [x] Create InspectionSession view
  - [x] Build `src/views/InspectionSession.vue`
  - [x] Auto-create inspection on mount
  - [x] Quick stats dashboard (photos, substances, groups)
  - [x] Multi-photo workflow support
  - [x] Photo upload/camera integration per photo
  - [x] Review and edit substances per photo
  - [x] Complete or cancel individual photos
  - [x] Photo list with status indicators
  - [x] Navigation to overview
- [x] Update visionHelper for AI reasoning
  - [x] Include reasoning field in extraction prompt
  - [x] Capture AI explanation for classification decisions

### Inspection Overview & Aggregation
- [x] Create InspectionOverview view
  - [x] Build `src/views/InspectionOverview.vue`
  - [x] Aggregate substances from all completed photos
  - [x] Group by ADR class + packaging group
  - [x] Calculate totals per group in KG
  - [x] Display overall validation status
  - [x] Show critical warnings with blocking
  - [x] Substance table with all details
  - [x] AI reasoning tooltips
  - [x] Edit and manage substances
  - [x] Complete inspection flow

### Lower Limit Validation
- [x] Implement group-level validation
  - [x] Sum quantities across all substances in group
  - [x] Compare against ADR limits per group
  - [x] Display warnings for exceeded groups
  - [x] Block inspection completion on violations
- [x] Update SubstanceCard component
  - [x] Add N/A option to packaging group dropdown
  - [x] Display AI reasoning in card
  - [x] Show reasoning with tooltip/expandable section

### Reporting & Export
- [x] Create InspectionReport component
  - [x] Build `src/components/InspectionReport.vue`
  - [x] Display inspection header and metadata
  - [x] Show summary statistics
  - [x] List warnings and violations
  - [x] Grouped substance tables
  - [x] Optional AI reasoning appendix
  - [x] Print-friendly styling
- [x] Create InspectionReportView page
  - [x] Build `src/views/InspectionReportView.vue`
  - [x] Action bar with print and back buttons
  - [x] Toggle AI reasoning visibility
  - [x] Browser print support
  - [x] Responsive layout

### Navigation & User Experience
- [x] Update HomeView
  - [x] Feature inspection session as primary CTA
  - [x] Add quick links to overview and single scan
  - [x] Organize legacy tools in collapsed section
- [x] Add routes
  - [x] /app/inspection - InspectionSession
  - [x] /app/inspection/overview - InspectionOverview
  - [x] /app/inspection/report - InspectionReportView
- [x] Responsive design
  - [x] Mobile-first approach with Tailwind
  - [x] Responsive grids and layouts
  - [x] Touch-friendly buttons and controls
  - [x] Camera UI optimized for mobile

### Testing & Validation
- [ ] Test multi-photo workflow
  - Test adding multiple photos to inspection
  - Verify substances tracked per photo
  - Test completing and canceling photos
  - Verify photo deletion
- [ ] Test grouping and aggregation
  - Verify substances grouped correctly by ADR class + VP
  - Test total calculations across photos
  - Verify unit conversions in aggregation
  - Test with N/A packaging groups
- [ ] Test lower limit validation
  - Verify group-level limit checks
  - Test blocking when limits exceeded
  - Verify warnings display correctly
  - Test override functionality at substance level
- [ ] Test reporting
  - Generate report with multiple photos
  - Verify all data displays correctly
  - Test print functionality
  - Verify AI reasoning appendix
- [ ] Test responsive behavior
  - Test on mobile (phone)
  - Test on tablet
  - Test on desktop
  - Verify camera UI on mobile devices

---

## MVP Phase - Full Scanning Workflow

### Azure Database and Storage Setup
- [ ] Create Azure SQL Database
  - [ ] Run `azure/sql/schema.sql`
  - [ ] Verify indexes for user, inspection, photo and substance lookups
- [ ] Set up Azure Blob Storage for inspection photos
  - [ ] Create `inspection-photos` container
  - [ ] Configure private access and Managed Identity permissions

### Azure Logic App + Foundry Agent
- [ ] Import Logic App workflow from `azure/logic-app/dcmr-analyze-substances-workflow.json`
  - [ ] Configure Foundry project endpoint and agent id
  - [ ] Accept base64 image payload from frontend/APIM
  - [ ] Call Azure AI Foundry Agent
  - [ ] Return structured JSON response matching `azure/api-contract.md`
  - [ ] Add error handling and logging
  - [ ] Store secrets in app settings or Key Vault
  - [ ] Deploy workflow to production

### TypeScript Interfaces
- [ ] Create Product interface
  - [ ] Define `src/shared/interfaces/Product.ts`
  - [ ] Include all fields from database schema
  - [ ] Add optional fields for confidence scores
- [ ] Create ScanSession interface
  - [ ] Define `src/shared/interfaces/ScanSession.ts`
- [ ] Create ExtractionResult interface
  - [ ] Define structure matching Azure AI Foundry response

### Pinia Store
- [ ] Create products store
  - [ ] Create `src/stores/products.ts`
  - [ ] State: products list, loading states, current product
  - [ ] Action: `getProducts()` - fetch user's products from Azure API
  - [ ] Action: `getProduct(id)` - fetch single product
  - [ ] Action: `saveProduct(product)` - insert new product
  - [ ] Action: `updateProduct(id, data)` - update existing product
  - [ ] Action: `deleteProduct(id)` - delete product
- [ ] Create scan store
  - [ ] Create `src/stores/scan.ts`
  - [ ] State: currentImage, extractedData, loading states
  - [ ] Action: `uploadImage(file)` - upload to temp storage
  - [ ] Action: `extractProductInfo(imageUrl)` - call Azure analysis API
  - [ ] Action: `resetScan()` - clear current scan state

### Enhanced Azure AI Foundry Extraction
- [ ] Expand Foundry Agent instructions for full field extraction
  - Product info: name, brand, manufacturer, EAN, volume/weight
  - Chemical IDs: UN number, CAS number
  - Safety: GHS pictograms, H-statements, P-statements, signal word
  - Instructions: safety, storage, first aid, fire-fighting
  - Chemical composition
  - Include confidence scores for each field
- [ ] Update extraction helper to parse full response
- [ ] Add validation for extracted data structure

### Camera Component
- [ ] Create camera capture component
  - [ ] Build `CameraCapture.vue` with video element
  - [ ] Request camera permissions (navigator.mediaDevices.getUserMedia)
  - [ ] Display live camera feed
  - [ ] Add "Capture" button to take photo
  - [ ] Convert captured frame to blob/file
  - [ ] Add camera flip button (front/back on mobile)
  - [ ] Handle permission denied errors
  - [ ] Provide fallback to file upload if camera unavailable
- [ ] Test camera on multiple devices
  - Test on iOS Safari
  - Test on Android Chrome
  - Test on desktop browsers

### Image Capture Page
- [ ] Create unified image capture view
  - [ ] Build `ScanProduct.vue` view
  - [ ] Show tabs/toggle for Camera vs Upload
  - [ ] Integrate `CameraCapture.vue` component
  - [ ] Integrate `ImageUpload.vue` component (from POC)
  - [ ] Add image preview step
  - [ ] Add "Use This Image" confirmation button
  - [ ] Add loading overlay during extraction
  - [ ] Display extracted data in organized sections

### Product Review & Edit Form
- [ ] Create product form component
  - [ ] Build `ProductForm.vue` with all fields
  - [ ] Organize fields into sections (Basic Info, Safety, Chemical IDs, Instructions)
  - [ ] Add field labels and help text
  - [ ] Make all fields editable (MVP always allows editing)
  - [ ] Add form validation (product name required)
  - [ ] Display confidence scores as badges/indicators
  - [ ] Add "Save Product" button
  - [ ] Add "Cancel" button to restart scan
- [ ] Connect form to products store
  - Call `saveProduct()` action on form submit
  - Handle save success (show toast, navigate to product list)
  - Handle save errors (show error message)

### Product List View
- [ ] Create products list page
  - [ ] Build `ProductsList.vue` view
  - [ ] Fetch products on mount via `getProducts()` action
  - [ ] Display products in table/card layout
  - [ ] Show key fields: name, brand, EAN, scan date
  - [ ] Add "Scan New Product" button
  - [ ] Show empty state when no products
  - [ ] Add loading skeleton during fetch
- [ ] Add route for products list
  - Add to `src/router/index.ts`: `/app/products`

### Navigation & Routes
- [ ] Add scan route to router
  - Route: `/app/scan`
  - Component: `ScanProduct.vue`
- [ ] Add navigation links
  - Add "Scan Product" link to main navigation
  - Add "My Products" link to main navigation
- [ ] Update home page
  - Add quick action buttons: "Scan Product", "View Products"

### MVP Testing
- [ ] End-to-end testing of full workflow
  - Test: upload image → extract → review → save → view in list
  - Test: camera capture → extract → review → save
  - Verify data persists correctly in Azure SQL
  - Verify image uploads to storage (if implemented)
- [ ] Cross-browser testing
  - Test on Chrome, Firefox, Safari, Edge
  - Test on iOS Safari, Android Chrome
- [ ] Error scenario testing
  - Test with no internet connection
  - Test with invalid API key
  - Test with corrupted/invalid images
  - Test camera permission denial

---

## Phase 2 - Online Enrichment & Enhanced Features

### Online Product Search
- [ ] Set up UPC Database API
  - [ ] Create account and get API key
  - [ ] Add `VITE_UPC_DATABASE_API_KEY` to `.env`
  - [ ] Create helper function `src/helpers/upcDatabaseHelper.ts`
  - [ ] Implement barcode lookup endpoint
  - [ ] Parse response into Product interface
  - [ ] Handle rate limiting (100 req/day)
- [ ] Set up Google Custom Search API
  - [ ] Create Google Cloud project
  - [ ] Enable Custom Search API
  - [ ] Create search engine ID
  - [ ] Add `VITE_GOOGLE_API_KEY` and `VITE_GOOGLE_SEARCH_ENGINE_ID` to `.env`
  - [ ] Create helper function `src/helpers/googleSearchHelper.ts`
  - [ ] Implement product search by name + EAN
  - [ ] Parse top results
- [ ] Create unified search service
  - [ ] Create `src/services/productSearchService.ts`
  - [ ] Try UPC Database first if EAN available
  - [ ] Fall back to Google Search if no results
  - [ ] Return array of potential matches
  - [ ] Include data source for each result

### Data Comparison UI
- [ ] Create comparison component
  - [ ] Build `ProductComparison.vue`
  - [ ] Display extracted data in left column
  - [ ] Display online results in right column(s)
  - [ ] Highlight differences between data sources
  - [ ] Add radio buttons to select data source per field
  - [ ] Add "Use Extracted", "Use Online", "Merge" buttons
  - [ ] Preview merged result
- [ ] Integrate comparison into scan workflow
  - Add "Search Online" button after extraction
  - Show loading state during online search
  - Display comparison UI when results found
  - Update ProductForm with selected/merged data

### Environment-Based Editing Toggle
- [ ] Add editing toggle functionality
  - [ ] Read `VITE_ENABLE_PRODUCT_EDIT` env var (default: true)
  - [ ] When false, make ProductForm read-only
  - [ ] Show "Confirm & Save" button instead of edit form
  - [ ] Allow user to view but not edit before saving
  - [ ] Update CLAUDE.md with this env var

### Confidence Score Visualization
- [ ] Add confidence indicators to ProductForm
  - [ ] Show confidence percentage as badge
  - [ ] Color-code: green (>80%), yellow (50-80%), red (<50%)
  - [ ] Add tooltip explaining confidence score
  - [ ] Highlight low-confidence fields for review

### GHS Pictogram Rendering
- [ ] Create GHS pictogram component
  - [ ] Build `GhsPictogram.vue`
  - [ ] Import/create SVG icons for all GHS symbols (GHS01-GHS09)
  - [ ] Display pictogram based on code prop
  - [ ] Add tooltip with hazard description
- [ ] Integrate into product displays
  - Show pictograms in ProductForm
  - Show pictograms in product list
  - Show pictograms in product detail view

### Product Detail View
- [ ] Create product detail page
  - [ ] Build `ProductDetail.vue` view
  - [ ] Fetch product by ID from route param
  - [ ] Display all product fields in organized sections
  - [ ] Show GHS pictograms prominently
  - [ ] Display H-statements and P-statements as lists
  - [ ] Show product image if available
  - [ ] Add "Edit" button (navigates to edit page)
  - [ ] Add "Delete" button with confirmation modal
- [ ] Add route for product detail
  - Route: `/app/products/:id`
  - Component: `ProductDetail.vue`
- [ ] Make product list items clickable
  - Link to product detail page

### Edit Existing Products
- [ ] Create product edit page
  - [ ] Build `ProductEdit.vue` view (or reuse ProductForm)
  - [ ] Fetch existing product data
  - [ ] Pre-populate form with current values
  - [ ] Call `updateProduct()` action on save
  - [ ] Navigate back to product detail on success
- [ ] Add route for product edit
  - Route: `/app/products/:id/edit`

### Search & Filter in Product List
- [ ] Add search functionality
  - [ ] Add search input to ProductsList
  - [ ] Implement client-side filtering by name, brand, EAN
  - [ ] Show "No results" message when filtered list is empty
- [ ] Add basic filters
  - [ ] Filter by hazard type (based on GHS pictograms)
  - [ ] Filter by manufacturer
  - [ ] Add "Clear Filters" button

### Caching & Performance
- [ ] Implement online search result caching
  - [ ] Cache search results in localStorage
  - [ ] Key: EAN code or product name hash
  - [ ] TTL: 24 hours
  - [ ] Check cache before making API calls
- [ ] Image optimization
  - [ ] Compress images before upload (use canvas or library)
  - [ ] Resize large images to max 1920px width
  - [ ] Convert to JPEG with quality 85%

### Loading States & Error Handling
- [ ] Enhance loading states
  - Add skeleton loaders for product list
  - Add progress indicators for multi-step processes
  - Show elapsed time for long operations
- [ ] Improve error handling
  - Add retry button for failed API calls
  - Show specific error messages (network, API, validation)
  - Implement error boundary for component errors

---

## Phase 3 - Advanced Features (Future)

### Chemical Database Integration
- [ ] Research ChemSpider API integration
- [ ] Research PubChem API integration
- [ ] Implement chemical-specific searches
- [ ] Link to SDS/MSDS documents online

### Barcode Scanning Library
- [ ] Evaluate barcode scanning libraries (ZXing, Quagga)
- [ ] Implement dedicated barcode scanning mode
- [ ] Auto-detect and highlight barcodes in camera view

### Advanced Search & Filtering
- [ ] Implement full-text search using Postgres tsvector
- [ ] Add advanced filters (UN number, CAS number, date range)
- [ ] Add sorting options (name, date, hazard level)
- [ ] Add saved search/filter presets

### Export Functionality
- [ ] Implement CSV export
  - Generate CSV with all product fields
  - Include header row
  - Handle special characters and commas
- [ ] Implement PDF export
  - Use PDF generation library (jsPDF)
  - Include product details and images
  - Format as safety data summary

### Bulk Scanning Mode
- [ ] Design bulk scanning workflow
- [ ] Queue multiple images for processing
- [ ] Show progress for batch extractions
- [ ] Review and save multiple products at once

### Product Categorization & Tagging
- [ ] Add categories field to products table
- [ ] Create category management UI
- [ ] Add manual tagging functionality
- [ ] Filter products by category/tag

### Multi-User Features
- [ ] Product sharing between users
- [ ] Team/organization support
- [ ] Role-based permissions (admin, editor, viewer)
- [ ] Activity log for product changes

### Mobile Native App
- [ ] Evaluate React Native or Flutter
- [ ] Better camera integration
- [ ] Offline mode support
- [ ] Push notifications for safety alerts

---

## Documentation & Deployment

- [ ] Update CLAUDE.md with implementation details
  - Document scan workflow
  - Document Pinia store patterns used
  - Document Azure SQL schema
- [ ] Create user guide documentation
  - How to scan products
  - How to search and manage products
  - How to interpret safety information
- [ ] Set up production environment
  - Configure production Azure resources
  - Set up environment variables in hosting platform
  - Configure HTTPS for camera access
  - Set up API key rotation schedule
- [ ] Performance optimization
  - Implement lazy loading for routes
  - Optimize bundle size
  - Add service worker for offline support

## Review 2026-09-16

- [x] Upgrade directe dependencies en vernieuw package-lock.json; TypeScript 6 behouden wegens incompatibiliteit van TypeScript 7 met vue-tsc/typescript-eslint.
- [x] Node-versie vastleggen op 24 LTS en minimale runtimevereisten bijwerken.
- [x] Stoffen vanuit InspectionOverview bewerken via de bestaande SubstanceCard; herbereken het overzicht na wijziging.
- [x] Na lokaal afronden navigeren naar Home; bij opnieuw starten een nieuwe actieve inspectie aanmaken.
- [x] Ongebruikte Vue-startcomponenten en bijbehorende voorbeeldiconen verwijderen.
- [x] Bestaande lintfouten in ExtractionResults, InspectionReport en SubstanceCard herstellen.
- [ ] Databaseopslag van SubstanceScan en inspection.completeInspection: wacht op het opslag-endpointcontract. azure/api-contract.md bevat uitsluitend analyse-endpoints; lokaal afronden is nog geen databaseopslag.
- [x] Validatie: productiebuild, Vue/TypeScript-typecontrole en ESLint slagen met Node 24.19.0.
- [x] Browsercontrole: stof bewerken, overzicht bijwerken, lokaal afronden naar Home en opnieuw starten met een lege inspectie; geen browserfouten.
- [ ] Indirecte dependency: npm audit meldt één lage esbuild-waarschuwing; npm audit fix lost deze binnen de huidige dependencyvereisten nog niet op.
