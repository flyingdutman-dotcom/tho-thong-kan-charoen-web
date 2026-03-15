# Project TODO - บริษัท ท่อทองการเจริญ จำกัด

## Database & Backend
- [x] Create inquiries table in drizzle/schema.ts
- [x] Add database helper for inquiries in server/db.ts
- [x] Create tRPC procedures for inquiry submission and retrieval
- [x] Add owner notification system for new inquiries

## Frontend - Layout & Components
- [x] Design and implement Header with logo, company name, and contact button
- [x] Create Hero Section with service image and CTAs (ขอใบเสนอราคา, ปรึกษาฟรี)
- [x] Build Services Section with grid layout (current + coming soon)
- [x] Create Portfolio Section with past projects and certifications
- [x] Develop Inquiry Form component (name, phone, service type)
- [x] Build Footer with address, Google Maps link, and social media icons
- [x] Set up global styling with gold/blue color palette

## Frontend - Integration
- [x] Connect inquiry form to tRPC mutation
- [x] Implement form validation and error handling
- [x] Add success/error toast notifications
- [x] Implement responsive design for all sections

## Testing & Polish
- [x] Write vitest tests for inquiry submission
- [x] Test form validation and error states
- [x] Cross-browser and mobile responsiveness testing
- [x] Performance optimization

## Deployment
- [ ] Create checkpoint before publishing
- [ ] Publish to Manus platform

## Portfolio Details Page (New Feature)
- [x] Create portfolio database table with before/after images and descriptions
- [x] Build portfolio details page component with image gallery
- [x] Add navigation link to portfolio details from home page
- [x] Build portfolio listing page
- [x] Add portfolio tRPC procedures (list, get, create)
- [x] Test portfolio page responsiveness
