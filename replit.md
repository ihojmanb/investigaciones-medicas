# Patient Expense Form Application

## Overview

This is a healthcare-focused React application for managing patient expense submissions in clinical studies. The application provides a comprehensive form interface for recording various types of expenses (transport, trips, food, accommodation) associated with patient visits. Built with a modern tech stack including React, TypeScript, Drizzle ORM, and a PostgreSQL database, it follows Material Design principles for healthcare applications with emphasis on efficiency, clarity, and accessibility.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React with TypeScript**: Single-page application using functional components and hooks
- **UI Framework**: shadcn/ui component library built on Radix UI primitives with Tailwind CSS
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React hooks for local state, TanStack Query for server state management
- **Form Handling**: React Hook Form with Zod validation schemas
- **Styling**: Tailwind CSS with custom design system implementing Material Design principles

### Backend Architecture
- **Express.js**: RESTful API server with TypeScript
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Storage Interface**: Abstracted storage layer with in-memory implementation for development
- **Middleware**: Custom logging, JSON parsing, and error handling

### Data Storage Solutions
- **PostgreSQL**: Primary database configured via Neon serverless
- **Schema Design**: Structured tables for users and expense submissions with optional fields for different expense types
- **Migrations**: Drizzle Kit for database schema management
- **Connection Pooling**: Neon serverless connection pooling for scalability

### Design System
- **Color Palette**: Medical blue primary with light/dark mode support
- **Typography**: Inter font family with consistent sizing hierarchy
- **Layout System**: Tailwind spacing primitives with 6-unit baseline grid
- **Components**: Collapsible section cards, progress indicators, file upload interface
- **Responsive Design**: Mobile-first approach with breakpoint considerations

### Form Architecture
- **Smart Form Container**: Single-page layout with sticky mandatory section
- **Section-Based Organization**: Collapsible cards for different expense categories
- **Progress Tracking**: Visual indicators showing completion status
- **File Management**: Upload interface for receipt attachments with validation
- **Auto-Save Functionality**: Draft saving capabilities for user convenience

### Authentication & Authorization
- **Session Management**: Express session handling with PostgreSQL session store
- **User Schema**: Basic username/password authentication structure
- **Security**: Input validation, CORS handling, and secure headers