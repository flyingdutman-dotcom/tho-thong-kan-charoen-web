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


## Admin Backend System (New Feature)
- [x] Create admin dashboard layout with sidebar navigation
- [x] Build inquiries management page (view, update status, delete)
- [x] Build portfolio management page (add, edit, delete portfolio items)
- [x] Create admin login/authentication system (via Manus OAuth)
- [x] Add image upload functionality for portfolio items
- [x] Build statistics/dashboard overview page
- [x] Implement role-based access control for admin pages
- [x] Test admin panel functionality (21 tests passing)


## Image Upload Feature (New)
- [x] Create image upload component for portfolio items
- [x] Implement S3 upload functionality in backend
- [x] Add image preview before upload
- [x] Integrate upload with portfolio management form
- [x] Add image validation (size, format)
- [x] Test image upload functionality

## Data Export Feature (New)
- [x] Create CSV export function for inquiries
- [x] Add Excel export option for inquiries
- [x] Create export button in admin inquiries page
- [x] Include inquiry details in export (name, phone, email, service, status, date)
- [x] Test export functionality


## Admin Account Setup
- [x] Create admin account setup guide (ADMIN_SETUP.md)
- [x] Document how to promote user to admin role (promote-admin.mjs script)
- [x] Create verification guide (ADMIN_VERIFICATION.md)
- [x] Document admin login and access control
- [x] Document admin panel features and usage


## Email System (New Feature)
- [x] Create email service integration (via Manus notification system)
- [x] Add email templates for inquiry confirmation
- [x] Add email notification to admin on new inquiry
- [x] Add email to customer with inquiry details
- [x] Test email sending functionality

## Customer Reviews System (New Feature)
- [x] Create reviews database table
- [x] Build reviews management page in admin panel (/admin/reviews)
- [x] Create reviews display component on home page
- [x] Add reviews listing page (/reviews)
- [x] Implement star rating system (1-5 stars)
- [x] Add review form for customers
- [x] Test reviews functionality (21 tests passing)

## Google Maps Integration (New Feature)
- [x] Add Google Maps component to footer
- [x] Display company location on map
- [x] Add service area coverage on map
- [x] Create dedicated service area page (/service-area)
- [x] Add map markers for key locations
- [x] Test maps functionality on different devices


## Booking/Calendar System (New Feature)
- [x] Create bookings database table with date, time, service type, customer info
- [x] Build calendar component for date/time selection
- [x] Create booking form page (/booking)
- [x] Add booking management in admin panel (/admin/bookings)
- [x] Implement time slot availability system (8 time slots: 08:00-17:00)
- [x] Add email notification for booking confirmation (via notifyOwner)
- [x] Add calendar view for admin to see all bookings
- [x] Implement booking status management (pending, confirmed, completed, cancelled)
- [x] Add booking deletion feature for admin
- [x] Test booking functionality


## Admin Login System Update (New Feature)
- [x] Create admin users table with username and hashed password
- [x] Build admin login page (/admin/login) with username/password form
- [x] Implement password authentication
- [x] Add admin button in home page header
- [x] Add admin login tRPC procedure
- [x] Implement last login tracking
- [x] Test admin login flow


## Admin Session & Access Fix (Bug Fix)
- [x] Create admin session storage mechanism (AdminContext)
- [x] Fix AdminDashboard to check admin login session
- [x] Fix AdminInquiries to check admin login session
- [x] Fix AdminPortfolio to check admin login session (remaining)
- [x] Fix AdminReviews to check admin login session (remaining)
- [x] Fix AdminBookings to check admin login session (remaining)
- [x] Add redirect to login page if not authenticated
- [x] Test admin access with username/password login
