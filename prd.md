# Product Requirements Document

## Product Overview
- **Description**: A chemical product information management system that uses AI-powered image recognition to extract structured data from product labels and packaging. The system captures safety information, regulatory data, and product specifications from chemical containers (cleaning products, industrial chemicals, flammable substances, etc.).
- **Positioning**: Bridges the gap between physical chemical products and digital safety/compliance management by eliminating manual data entry and ensuring accurate safety information capture.
- **Unique Differentiators**:
  - AI vision-powered extraction of chemical safety data (GHS symbols, UN numbers, hazard statements)
  - Automatic enrichment from online chemical databases
  - Mobile and desktop support for field and office use
  - Structured storage of safety and regulatory information
- **Product Goals**:
  - Reduce time spent manually transcribing chemical product information
  - Improve accuracy of safety and regulatory data capture
  - Enable quick access to product safety information
  - Build a searchable database of chemical products in use

## User Personas

| Persona | Demographics | Goals | Pain Points | Usage Scenarios |
|---------|--------------|-------|-------------|-----------------|
| Safety Officer | 30-55 years old, workplace safety role | Maintain accurate inventory of hazardous materials, ensure compliance | Manual data entry is time-consuming and error-prone, hard to keep safety data sheets organized | Scanning new chemical deliveries, updating inventory records, quick safety info lookup |
| Warehouse Manager | 25-50 years old, logistics/operations | Track chemical inventory, ensure proper storage | Difficult to know what safety equipment is needed for stored chemicals | Scanning products during receiving, checking storage requirements |
| Facilities Technician | 25-45 years old, maintenance role | Quickly identify chemicals and their hazards | Labels can be damaged/unclear, need safety info immediately | Field scanning of products, checking compatibility before use |

## Core Features

### Feature 1: Image Capture & Upload
- **Description**: Users can capture product images via camera or upload existing photos from their device. System supports both mobile and desktop platforms.
- **User Benefit**: Flexibility to scan products in the field (mobile) or process documentation at a desk (desktop upload).
- **Functional Requirements**:
  - Native camera access on mobile devices
  - File upload interface for desktop/mobile
  - Support for common image formats (JPEG, PNG, HEIC)
  - Image preview before processing
  - Ability to retake/reselect image
- **Acceptance Criteria**:
  - Camera opens within 1 second on mobile devices
  - Both camera and upload options are clearly visible
  - Image preview displays before AI processing
  - Works on iOS, Android, Chrome, Firefox, Safari, Edge
- **Priority**: Must-have

### Feature 2: AI-Powered Information Extraction
- **Description**: Azure AI Foundry Agent analyzes product images to extract structured information including product details, safety data, regulatory information, and hazard symbols.
- **User Benefit**: Eliminates manual transcription, reduces human error, captures complex safety information accurately.
- **Functional Requirements**:
  - Extract product name, brand, manufacturer
  - Identify and extract EAN/UPC barcode
  - Recognize UN numbers (hazardous materials transport codes)
  - Identify CAS numbers (Chemical Abstracts Service registry)
  - Detect GHS hazard pictograms (flame, corrosion, skull, etc.)
  - Extract H-statements (hazard statements) and P-statements (precautionary statements)
  - Capture chemical composition/active ingredients
  - Extract volume/weight information
  - Identify safety instructions and warnings
  - Extract storage requirements
  - Loading state during AI processing
  - Error handling for failed extractions
- **Acceptance Criteria**:
  - Successfully extracts barcode from clear images >90% of time
  - Correctly identifies GHS symbols >85% of time
  - Returns structured JSON data with confidence scores
  - Processing completes within 5-10 seconds
  - Clear error messages for failed extractions
  - Handles multiple languages on labels (English, Dutch, German, French)
- **Priority**: Must-have

### Feature 3: Online Product Enrichment
- **Description**: After local extraction, users can search online databases to find additional product information and compare/merge with extracted data.
- **User Benefit**: Access comprehensive safety data sheets, additional specifications, and verified product information from authoritative sources.
- **Functional Requirements**:
  - Search triggered by "Search Online" button (not automatic)
  - Multi-source search strategy:
    1. UPC Database (upcitemdb.com) - barcode lookup for general products
    2. Google Custom Search API - product name + EAN search
    3. Future: Chemical-specific databases (ChemSpider, PubChem)
  - Display multiple results if found
  - Side-by-side comparison of extracted vs. online data
  - User selects which data source to use (extracted, online, or merge)
  - Ability to merge specific fields from different sources
- **Acceptance Criteria**:
  - Search button appears only after successful extraction
  - Displays "No results found" message gracefully
  - Shows top 3-5 online results if multiple matches
  - User can preview data before selecting
  - Merged data maintains data provenance (which source each field came from)
- **Priority**: Must-have

### Feature 4: Data Review & Editing
- **Description**: Before saving, users can review and edit all extracted/enriched information. Editing can be disabled via environment variable for streamlined workflows.
- **User Benefit**: Ensures data accuracy, allows correction of AI extraction errors, provides flexibility for different use cases.
- **Functional Requirements**:
  - Form interface with all extracted fields editable
  - Clear visual indication of confidence levels for extracted data
  - Field-level edit capability
  - Environment variable `VITE_ENABLE_PRODUCT_EDIT` to toggle editing on/off
  - When editing disabled, show read-only review before save
  - Validation rules for required fields (product name, at minimum)
  - Ability to add missing information manually
- **Acceptance Criteria**:
  - All fields can be edited when `VITE_ENABLE_PRODUCT_EDIT=true`
  - Edit interface is intuitive with clear labels
  - Validation prevents saving incomplete records
  - When editing disabled, data flows directly to database after confirmation
  - Changes are visually tracked (show which fields were modified)
- **Priority**: Must-have

### Feature 5: Product Storage & Management
- **Description**: Scanned products are stored in Azure SQL with full safety and regulatory information. Users can view, search, and manage their product library.
- **User Benefit**: Build a searchable database of chemical products, access historical scans, maintain compliance records.
- **Functional Requirements**:
  - Store all extracted product data in Azure SQL
  - Track scan timestamp and user who scanned
  - Store original image (optional, for reference)
  - Full-text search across product names, brands, ingredients
  - Filter by hazard type, UN number, manufacturer
  - Product detail view with all information
  - Edit existing product records
  - Delete products (with confirmation)
  - Export product list to CSV/PDF
- **Acceptance Criteria**:
  - Product saves to database within 2 seconds
  - Search returns results in <1 second
  - Image storage is optional and configurable
  - All CRUD operations work correctly
  - Data export includes all fields
- **Priority**: Must-have (basic storage), Should-have (advanced search/export)

## User Experience

### User Journeys

**Primary Journey: Scan New Chemical Product**
1. User navigates to "Scan Product" page
2. User chooses camera (mobile) or upload (desktop)
3. User captures/selects image of product label
4. System displays image preview
5. User confirms and initiates AI extraction
6. Loading state shows "Analyzing image..."
7. System displays extracted information in structured format
8. User reviews extracted data
9. User clicks "Search Online" button
10. System searches multiple databases
11. System displays online results alongside extracted data
12. User compares and selects data source (extracted, online, or merge)
13. User reviews final data (edits if enabled)
14. User saves product to database
15. System confirms save and offers options: scan another, view product, view all products

**Secondary Journey: Quick Scan (Editing Disabled)**
1. User captures image
2. AI extracts data
3. User confirms data looks correct
4. Product saves automatically
5. User scans next product

**Tertiary Journey: Search Existing Products**
1. User navigates to "Products" page
2. User enters search term or filter
3. System displays matching products
4. User clicks product for details
5. User views all safety information, hazards, storage requirements

### Information Architecture
```
/app
├── /scan (Image capture & extraction)
├── /products (Product library)
│   ├── /products/:id (Product detail)
│   └── /products/:id/edit (Edit product)
└── /settings (Configuration, API keys)
```

### UI Requirements
- **Responsive Design**: Mobile-first approach, works on tablets and desktops
- **Camera Interface**: Full-screen camera view on mobile, preview pane on desktop
- **Loading States**: Clear progress indicators during AI processing and online search
- **Data Comparison UI**: Side-by-side or tabbed view for extracted vs. online data
- **Hazard Symbol Display**: Visual rendering of GHS pictograms with tooltips
- **Form Validation**: Inline validation messages, required field indicators
- **Accessibility**: WCAG AA compliance, screen reader support, keyboard navigation

### Design Principles
- **Speed**: Minimize clicks to complete scan → save workflow
- **Clarity**: Make confidence levels and data sources transparent
- **Safety**: Visual prominence of hazard information
- **Flexibility**: Support both quick scanning and detailed review workflows

## Technical Architecture

### System Components
- **Front-end**: Vue 3 + TypeScript + Vite (existing stack)
- **UI Components**: Nuxt UI for forms, buttons, modals
- **State Management**: Pinia stores for product data, scan session state
- **Backend**: Azure Static Web Apps auth, Logic Apps, Azure SQL, Blob Storage
- **External Services**:
  - Azure AI Foundry Agent (image analysis)
  - UPC Database API (product lookup)
  - Google Custom Search API (fallback search)

### Data Model

**Products Table** (`public.products`)
```sql
create table public.products (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) not null,

  -- Basic Product Info
  product_name text not null,
  brand text,
  manufacturer text,
  ean_code text,

  -- Chemical Identifiers
  un_number text,
  cas_number text,

  -- Safety Information
  ghs_pictograms text[], -- Array of pictogram codes (e.g., ['GHS02', 'GHS07'])
  h_statements text[], -- Hazard statements
  p_statements text[], -- Precautionary statements
  signal_word text, -- 'Danger' or 'Warning'

  -- Content & Composition
  chemical_composition jsonb, -- Structured ingredient list
  volume_weight text,

  -- Instructions
  safety_instructions text,
  storage_requirements text,
  first_aid text,
  fire_fighting text,

  -- Metadata
  image_url text, -- Optional: stored product image
  data_source text, -- 'extracted', 'online', 'merged'
  extraction_confidence jsonb, -- Confidence scores per field
  scanned_at timestamptz default now(),
  updated_at timestamptz default now(),

  -- Full-text search
  search_vector tsvector
);

-- Indexes
create index products_user_id_idx on public.products(user_id);
create index products_ean_code_idx on public.products(ean_code);
create index products_un_number_idx on public.products(un_number);
create index products_search_vector_idx on public.products using gin(search_vector);

comment on table public.products is 'Chemical product information extracted from labels and enriched from online sources.';
```

**Scan Sessions Table** (`public.scan_sessions`)
```sql
create table public.scan_sessions (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) not null,
  product_id bigint references public.products(id),

  original_image_url text,
  extraction_raw jsonb, -- Raw Azure AI Foundry response
  online_search_results jsonb, -- Raw search results

  created_at timestamptz default now()
);

comment on table public.scan_sessions is 'Historical record of scanning sessions for audit and debugging.';
```

### APIs and Integrations

**Azure AI Foundry Agent**
- Endpoint: configured server-side in Logic Apps/APIM
- Authentication: Managed Identity or DCMR-approved server-side credential
- Rate limits: Governed by the selected Foundry model deployment
- Client contract: `POST /analyze-product` and `POST /analyze-substances`

**UPC Database API**
- Endpoint: `https://api.upcitemdb.com/prod/trial/lookup`
- Authentication: API key (free tier: 100 requests/day)
- Rate limits: Implement client-side throttling

**Google Custom Search API**
- Endpoint: `https://www.googleapis.com/customsearch/v1`
- Authentication: API key + Search Engine ID
- Rate limits: 100 queries/day (free tier)

**Azure Logic App** (Recommended)
- Create Logic App workflow to orchestrate Blob Storage, Azure AI Foundry Agent, and Azure SQL writes
- Keeps model credentials secure (not exposed to client)
- Handles rate limiting, retries, and error handling
- Frontend path: configured through `VITE_DCMR_API_BASE_URL`

### Technical Requirements
- **Performance**: Image upload <2s, AI extraction <10s, database save <2s
- **Security**: API keys stored in environment variables, never exposed to client
- **Error Handling**: Graceful degradation if APIs unavailable
- **Image Optimization**: Compress images before upload (max 4MB), resize to reasonable dimensions
- **Caching**: Cache online search results for 24 hours to reduce API calls
- **Offline Support**: Show helpful error message, allow retry when connection restored

## Development Roadmap

### Phase 0: Proof of Concept (POC)
- **Selected Feature Focus**:
  - Basic image upload (file only, no camera yet)
  - Azure AI Foundry extraction of product name + EAN barcode only
  - Simple display of extracted data
  - No online search, no database storage
- **Technical Goals**:
  - Validate Azure AI Foundry Agent integration
  - Confirm extraction accuracy on chemical product labels
  - Test prompt engineering for structured data extraction
  - Estimate API costs per scan
- **Success Criteria**:
  - Successfully extracts product name from 8/10 test images
  - Extracts EAN barcode from 7/10 test images
  - Response time under 10 seconds
  - Structured JSON response validated
- **Resource Requirements**:
  - Azure AI Foundry project/model access
  - 5-10 test images of chemical product labels
  - 2-3 days development time

### Phase 1: MVP (Minimum Viable Product)
- **Core Functionality**:
  - Image capture (camera + upload) on mobile and desktop
  - Full AI extraction (all fields: product info, safety data, regulatory)
  - Data review and manual editing (always enabled)
  - Save to Azure SQL database
  - Basic product list view
- **Technical Foundation**:
  - Azure SQL tables with full schema
  - Pinia store for scan workflow state
  - Azure Logic App for Foundry Agent orchestration
  - Image upload to Azure Blob Storage
  - Basic Vue components: ImageCapture, ExtractionReview, ProductForm
- **Success Criteria**:
  - Complete scan → save workflow works end-to-end
  - Data persists correctly in Azure SQL
  - Mobile camera integration works
  - User can edit all fields before saving
  - Product list displays saved products
- **Timeline**: 1-2 weeks

### Phase 2: Iteration
- **Feature Enhancements**:
  - Online product enrichment (UPC Database + Google Search)
  - Data comparison and merge UI
  - Confidence score visualization
  - GHS pictogram visual rendering
  - Environment variable to disable editing (`VITE_ENABLE_PRODUCT_EDIT`)
- **New Features**:
  - Product detail view with all safety information
  - Basic search and filter in product list
  - Edit existing products
  - Delete products
- **Technical Improvements**:
  - Implement caching for online searches
  - Add loading states and error handling
  - Image optimization before upload
  - Rate limiting for API calls
- **Timeline**: 1-2 weeks

### Phase 3: Expansion
- **Advanced Features**:
  - Chemical-specific database integration (ChemSpider, PubChem)
  - SDS/MSDS document parsing and attachment
  - Barcode scanning (dedicated barcode library for faster EAN detection)
  - Bulk scanning mode
  - Product categorization and tagging
  - Advanced filtering (by hazard type, manufacturer, UN number)
  - Export to CSV/PDF
  - Product sharing between users/teams
- **Scaling Considerations**:
  - Logic App/APIM for all external API calls
  - Implement queue for bulk scanning
  - CDN for product images
  - Full-text search optimization
- **Integration Ecosystem**:
  - Integration with inventory management systems
  - API for third-party access
  - Webhook notifications for new products
- **Timeline**: 2-4 weeks

## Logical Dependency Chain

### Foundation Layer
1. **Azure Setup**: Azure SQL schema, Blob Storage container, Entra auth, Logic App workflow
2. **Environment Configuration**: Azure AI Foundry, UPC Database, Google Search
3. **Base Components**: Camera component, image upload component, form components

### User Interface Layer
4. **Image Capture Flow**: Camera/upload → preview → confirm
5. **Extraction Display**: Loading state → structured data display
6. **Review & Edit**: Editable form with validation

### Feature Sequencing
7. **POC**: File upload + basic extraction → Phase 1
8. **MVP**: Camera + full extraction + database storage → Phase 2
9. **Enrichment**: Online search + data comparison → Phase 3
10. **Advanced**: Chemical databases + advanced features

### Technical Dependencies
- Azure AI Foundry Agent integration must be working before proceeding to MVP
- Logic App/APIM recommended before MVP to secure model credentials
- Camera access requires HTTPS in production
- Online enrichment depends on MVP completion

## Risks and Mitigations

| Risk | Impact | Probability | Mitigation Strategy |
|------|--------|------------|---------------------|
| Azure AI Foundry extraction accuracy lower than expected | High | Medium | Extensive prompt engineering, test on diverse product labels, consider fallback to OCR + structured model extraction |
| API costs exceed budget | Medium | Medium | Implement usage tracking, set spending limits, cache results aggressively, consider batch processing |
| Camera access issues on certain devices/browsers | Medium | Low | Provide clear error messages, fallback to file upload, test on multiple devices |
| Online product databases have limited chemical product coverage | Medium | High | Start with general product databases, add chemical-specific APIs in Phase 3, allow manual entry as fallback |
| Image quality from users too poor for extraction | High | Medium | Provide image quality guidelines, show preview with quality check, allow retake |
| Compliance requirements for storing chemical safety data | High | Low | Research regulatory requirements (REACH, GHS), implement data retention policies, consult legal if needed |

## Appendix

### Market Research
- **Competitive Analysis**:
  - Existing solutions focus on inventory management or manual SDS management
  - Few solutions use AI vision for chemical product data extraction
  - Gap in market for mobile-first chemical scanning
- **Target Users**: Safety officers, warehouse managers, facilities teams in industries using chemicals (manufacturing, facilities management, research labs)

### Technical Specifications
- **Image Requirements**: Minimum 800x600px, maximum 4MB, JPEG/PNG format
- **Azure AI Foundry Agent Instructions**: Structured prompt requesting JSON output with specific fields, confidence scores, and multilingual support
- **Database Size Estimates**:
  - Per product: ~5-10KB text data + 500KB-2MB image (if stored)
  - 1000 products: ~10MB text + 0.5-2GB images

### Future Considerations
- **Mobile Native Apps**: Consider React Native or Flutter for better camera integration
- **Offline Mode**: Local OCR processing when internet unavailable
- **AR Features**: Overlay safety information on live camera view
- **Multi-language**: UI translation for international teams
- **Compliance Reporting**: Automated regulatory compliance reports
- **Inventory Integration**: Link scanned products to inventory counts and locations

### Review 2026-09-16 — implementatiestatus

Stoffen kunnen vanuit het inspectieoverzicht met de bestaande stofkaart worden
bewerkt. Wijzigingen worden in de actieve inspectie verwerkt en opnieuw
gevalideerd. Na lokaal afronden gaat de gebruiker naar Home; opnieuw starten
maakt een nieuwe inspectie aan en behoudt de afgeronde inspectie in het geheugen.
Databaseopslag blijft een open vereiste: het beschikbare Azure-contract beschrijft
alleen analyse-endpoints. Voor het opslaan van gecontroleerde stoffen en afgeronde
inspecties moet het opslag-endpointcontract nog worden aangeleverd of vastgesteld.
