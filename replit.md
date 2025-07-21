# Easy Invoice Generator

## Overview

This is a full-stack invoice generation application built with React, Express, TypeScript, and PostgreSQL. The application allows users to create professional invoices with real-time preview, multiple themes, PDF export capabilities, and cloud storage. It features a modern, responsive design with both light and dark theme support.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: React Hook Form for forms, TanStack Query for server state
- **UI Library**: Radix UI primitives with custom theming
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Session Storage**: PostgreSQL-based session store (connect-pg-simple)
- **API Design**: RESTful endpoints with /api prefix
- **Development**: Hot module replacement with Vite integration

### Database Schema
- **Primary Entity**: `invoices` table with comprehensive invoice data
- **Storage Strategy**: JSON fields for flexible item storage, integer amounts (stored in cents)
- **Audit Fields**: Created/updated timestamps for tracking
- **Flexible Schema**: JSONB for invoice items, text fields for addresses

## Key Components

### Invoice Management
- **Invoice Form**: React Hook Form with Zod validation for type-safe form handling
- **Real-time Preview**: Live preview component that updates as user types
- **Theme System**: Multiple invoice themes (classic, modern, bold) with CSS-in-JS styling
- **PDF Export**: Client-side PDF generation using jsPDF and html2canvas

### File Upload System
- **Cloud Storage**: Cloudinary integration for logo uploads
- **Image Processing**: Automatic optimization and CDN delivery
- **Type Safety**: Comprehensive TypeScript interfaces for upload responses

### User Interface
- **Component Library**: Comprehensive set of reusable UI components from shadcn/ui
- **Theme Support**: Light/dark mode with CSS custom properties
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Navigation**: Fixed header with theme toggle and navigation options

### Data Persistence
- **Local Storage**: Invoice data persistence in Firebase Firestore
- **Recent Invoices**: Paginated list with search and filter capabilities
- **Type Safety**: Shared TypeScript types between frontend and backend

## Data Flow

1. **Invoice Creation**:
   - User fills out form with validation
   - Real-time preview updates with each change
   - Form data validated with Zod schemas
   - Optional logo upload to Cloudinary

2. **Data Processing**:
   - Form data transformed to database schema
   - Calculations performed (subtotal, tax, total)
   - Data saved to PostgreSQL via Drizzle ORM

3. **PDF Generation**:
   - HTML template rendered with invoice data
   - Client-side conversion to PDF using browser APIs
   - Download or print functionality

4. **Recent Invoices**:
   - Paginated queries to database
   - Real-time search and filtering
   - View/edit/duplicate functionality

## External Dependencies

### Core Technologies
- **Database**: PostgreSQL via Neon serverless
- **ORM**: Drizzle with PostgreSQL dialect
- **Cloud Storage**: Cloudinary for image hosting
- **PDF Generation**: jsPDF and html2canvas

### Development Tools
- **Build System**: Vite with React plugin
- **Type Checking**: TypeScript with strict configuration
- **Linting**: ESLint with TypeScript rules
- **Styling**: PostCSS with Tailwind CSS

### UI Libraries
- **Components**: Radix UI primitives
- **Icons**: Lucide React
- **Styling**: Class Variance Authority for component variants
- **Utilities**: clsx and tailwind-merge for className handling

## Deployment Strategy

### Development Environment
- **Hot Reload**: Vite dev server with Express middleware
- **Database**: Local PostgreSQL or Neon development instance
- **Environment Variables**: Separate .env files for different stages

### Production Build
- **Frontend**: Vite build process creating optimized static assets
- **Backend**: ESBuild bundling for Node.js deployment
- **Database Migrations**: Drizzle Kit for schema management
- **Static Assets**: Served via Express static middleware

### Database Management
- **Migrations**: Drizzle Kit push for schema updates
- **Connection**: Neon serverless PostgreSQL with connection pooling
- **Environment**: Separate databases for development/production

The application is designed to be easily deployable to platforms like Replit, with automatic database provisioning and environment setup. The modular architecture allows for easy scaling and feature additions.