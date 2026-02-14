# Niyo Salon - Frontend 

A modern, feature-rich salon management frontend built with React, TypeScript, and Vite. This application provides a comprehensive solution for salon booking, virtual hairstyle try-on using AI/ML, and complete admin/staff dashboard management.

![Niyo Salon](./src/assets/Niyo%20Logo.jpg)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Project Structure](#-project-structure)
- [Pages & Routes](#-pages--routes)
- [Components](#-components)
- [Services](#-services)
- [Authentication & Authorization](#-authentication--authorization)
- [Virtual Try-On Feature](#-virtual-try-on-feature)
- [Appointment System](#-appointment-system)
- [Admin Dashboard](#-admin-dashboard)
- [API Integration](#-api-integration)
- [Styling](#-styling)
- [Scripts](#-scripts)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### Customer Features
- **User Registration & Login** - Secure authentication system
- **Service Browsing** - View available salon services with pricing
- **Appointment Booking** - Self-service appointment scheduling
- **Virtual Hairstyle Try-On** - AI-powered hairstyle preview using face detection
- **Profile Management** - Manage personal information and booking history
- **Payment Integration** - Secure payment processing
- **Blog & Gallery** - Browse salon portfolio and blog posts

### Staff Features
- **Staff Dashboard** - View and manage assigned appointments
- **Appointment Management** - Update appointment status
- **Customer Information** - Access customer details for appointments

### Admin Features
- **Admin Dashboard** - Comprehensive management interface
- **User Management** - Manage customers and staff accounts
- **Staff Management** - Add, edit, and manage staff members
- **Service Management** - CRUD operations for salon services
- **Appointment Oversight** - Full control over all appointments
- **Analytics & Reports** - Track salon performance

---

## 🛠 Tech Stack

### Core Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | ^18.3.1 | UI Library |
| **TypeScript** | ^5.5.4 | Type Safety |
| **Vite** | ^5.2.0 | Build Tool & Dev Server |
| **React Router DOM** | ^6.26.2 | Client-side Routing |

### Styling
| Technology | Purpose |
|------------|---------|
| **Tailwind CSS** | ^3.4.17 | Utility-first CSS Framework |
| **PostCSS** | CSS Processing |
| **Autoprefixer** | CSS Vendor Prefixes |

### AI/ML & 3D
| Technology | Version | Purpose |
|------------|---------|---------|
| **TensorFlow.js** | ^4.22.0 | Machine Learning |
| **face-api.js** | ^0.22.2 | Face Detection & Recognition |
| **MediaPipe** | Multiple packages | Face Mesh & Segmentation |
| **Three.js** | ^0.155.0 | 3D Graphics |
| **@react-three/fiber** | ^8.13.7 | React Three.js Renderer |
| **@react-three/drei** | ^9.89.7 | Three.js Helpers |

### UI Components & Utilities
| Technology | Purpose |
|------------|---------|
| **Lucide React** | ^0.441.0 | Icon Library |
| **AOS** | ^2.3.4 | Animate On Scroll |
| **date-fns** | ^4.1.0 | Date Manipulation |
| **react-datepicker** | ^8.4.0 | Date Picker Component |
| **Axios** | ^1.12.2 | HTTP Client |
| **Fabric.js** | ^6.7.1 | Canvas Manipulation |

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.x or higher recommended)
- **npm** (v9.x or higher) or **yarn**
- **Git** for version control
- Backend API running on `http://localhost:8080` (for full functionality)

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Project-II---Niyo-Salon--Frontend/frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

### 5. Preview Production Build

```bash
npm run preview
```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the `frontend` directory:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

### Vite Configuration

The `vite.config.ts` includes API proxy configuration:

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:8080'
    }
  }
})
```

### Tailwind Configuration

Custom theme extensions in `tailwind.config.js`:
- Custom fonts: `Inter`, `Abril Fatface`
- Extended purple color palette
- Content paths for all JSX/TSX files

---

## 📁 Project Structure

```
frontend/
├── public/
│   ├── hair3d/                    # 3D hair models
│   │   └── short_hair.glb
│   ├── hairstyles/                # Hairstyle assets
│   │   ├── glb/                   # 3D hairstyle models (.glb)
│   │   ├── overlays/              # Overlay images
│   │   └── *.png                  # Hairstyle preview images
│   └── models/                    # AI/ML models
│       ├── age_gender_model-*
│       ├── face_expression_model-*
│       ├── face_landmark_68_model-*
│       ├── face_recognition_model-*
│       ├── ssd_mobilenetv1_model-*
│       └── tiny_face_detector_model-*
│
├── src/
│   ├── assets/                    # Static assets
│   │   ├── Gallery/               # Gallery images
│   │   ├── Home/                  # Homepage assets
│   │   ├── Login/                 # Login page assets
│   │   ├── Register/              # Registration assets
│   │   └── Services/              # Services page assets
│   │
│   ├── components/                # Reusable components
│   │   ├── blog/                  # Blog components
│   │   ├── Home/                  # Homepage components
│   │   ├── layout/                # Layout components (Header, Footer)
│   │   ├── services/              # Service-related components
│   │   ├── testimonials/          # Testimonial components
│   │   └── ui/                    # UI components (AlertBox, Dialogs)
│   │
│   ├── hooks/                     # Custom React hooks
│   │   ├── useAlert.tsx           # Alert management hook
│   │   └── useUserData.tsx        # User authentication hook
│   │
│   ├── pages/                     # Page components
│   │   ├── auth/                  # Authentication pages
│   │   │   ├── LoginPage.tsx
│   │   │   └── RegisterPage.tsx
│   │   ├── dashboard/             # Dashboard pages
│   │   │   ├── Admin/             # Admin-specific pages
│   │   │   │   ├── AdminAppointments.tsx
│   │   │   │   ├── AdminServices.tsx
│   │   │   │   ├── AdminStaff.tsx
│   │   │   │   ├── AdminUpload.tsx
│   │   │   │   └── AdminUsers.tsx
│   │   │   ├── Staff/             # Staff-specific pages
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── CustomerDashboard.tsx
│   │   │   ├── StaffDashboard.tsx
│   │   │   └── AddStaffPage.tsx
│   │   ├── AboutUsPage.tsx
│   │   ├── AppointmentPage.tsx
│   │   ├── BlogPage.tsx
│   │   ├── GalleryPage.tsx
│   │   ├── HomePage.tsx
│   │   ├── NotFoundPage.tsx
│   │   ├── PaymentPage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── ServicesPage.tsx
│   │   └── VirtualTryOnPage.tsx
│   │
│   ├── services/                  # API services
│   │   ├── adminService.ts        # Admin API calls
│   │   ├── appointmentService.ts  # Appointment management
│   │   └── bookingService.ts      # Booking operations
│   │
│   ├── App.tsx                    # Main application component
│   ├── index.tsx                  # Application entry point
│   └── index.css                  # Global styles
│
├── index.html                     # HTML entry point
├── package.json                   # Dependencies & scripts
├── tailwind.config.js             # Tailwind CSS configuration
├── tsconfig.json                  # TypeScript configuration
├── vite.config.ts                 # Vite configuration
└── postcss.config.js              # PostCSS configuration
```

---

## 🗺 Pages & Routes

### Public Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `HomePage` | Landing page with hero, services, testimonials |
| `/login` | `LoginPage` | User authentication |
| `/register` | `RegisterPage` | New user registration |
| `/services` | `ServicesPage` | Browse all salon services |
| `/gallery` | `GalleryPage` | Photo gallery of salon work |
| `/blog` | `BlogPage` | Blog posts and articles |
| `/about` | `AboutUsPage` | About the salon |
| `*` | `NotFoundPage` | 404 error page |

### Protected Routes (Require Authentication)

| Route | Component | Allowed Roles | Description |
|-------|-----------|---------------|-------------|
| `/appointments` | `AppointmentPage` | All authenticated | Book appointments |
| `/payment` | `PaymentPage` | All authenticated | Process payments |
| `/profile` | `ProfilePage` | All authenticated | User profile management |
| `/virtual-tryon` | `VirtualTryOnPage` | All authenticated | AI hairstyle try-on |

### Staff Routes

| Route | Component | Allowed Roles | Description |
|-------|-----------|---------------|-------------|
| `/dashboard/staff` | `StaffDashboard` | staff, admin | Staff management view |

### Admin Routes

| Route | Component | Allowed Roles | Description |
|-------|-----------|---------------|-------------|
| `/dashboard/admin` | `AdminDashboard` | admin | Admin overview |
| `/dashboard/users` | `AdminUsers` | admin | User management |
| `/dashboard/adminstaff` | `AdminStaff` | admin | Staff management |
| `/dashboard/services` | `AdminServices` | admin | Service management |
| `/dashboard/appointments` | `AdminAppointments` | admin | Appointment management |
| `/dashboard/add-staff` | `AddStaffPage` | admin | Add new staff member |
| `/dashboard/upload` | `AdminUpload` | admin | Upload management |

---

## 🧩 Components

### Layout Components
- **`Layout`** - Main application layout with navbar
- **Header/Navbar** - Navigation with authentication state
- **Footer** - Site footer with links

### UI Components
- **`AlertBox`** - Toast notifications
- **`ConfirmDialog`** - Confirmation modals
- **`PromptDialog`** - Input prompt dialogs
- **`CustomDatePicker`** - Styled date picker

### Feature Components
- **`TestimonialCard`** - Customer review display
- **`BlogPreview`** - Blog post preview cards
- **`CounterEle`** - Animated statistics counter
- **`ClientReviews`** - Client review section
- **`Brands`** - Partner brand logos

---

## 🔧 Services

### `appointmentService.ts`

Handles all appointment-related operations:

```typescript
interface AppointmentBooking {
  id?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  service: string;
  staffName?: string;
  date: string;          // YYYY-MM-DD
  time: string;          // HH:MM (24-hour)
  status?: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  bookedBy: 'customer' | 'admin' | 'staff';
  // ... more fields
}
```

**Available Functions:**
- `bookAppointment(data)` - Customer self-booking
- `createAppointment(data)` - Admin/staff booking
- `getAllAppointments()` - Fetch all appointments
- `updateAppointment(id, data)` - Update appointment
- `cancelAppointment(id)` - Cancel appointment

### `adminService.ts`
- User CRUD operations
- Staff management
- Service management
- Dashboard statistics

### `bookingService.ts`
- Booking-specific operations
- Availability checking
- Time slot management

---

## 🔐 Authentication & Authorization

### Authentication Flow

1. User submits credentials on `/login`
2. Backend validates and returns JWT token
3. Token stored in `localStorage`
4. Token sent with each API request via `Authorization` header

### `useUserData` Hook

```typescript
const user = useUserData();
// Returns: { id, username, role, phoneNumber, password }
```

### Protected Route Component

```tsx
<ProtectedRoute allowedRoles={['admin', 'staff']}>
  <AdminDashboard />
</ProtectedRoute>
```

### Role-Based Access
- **customer** - Can book appointments, access profile
- **staff** - Can manage assigned appointments
- **admin** - Full system access

---

## 🎭 Virtual Try-On Feature

### Overview

The Virtual Try-On feature uses AI/ML to detect user's face and overlay hairstyle models in real-time.

### Technologies Used

- **TensorFlow.js** - ML runtime
- **face-api.js** - Face detection & landmark detection
- **MediaPipe FaceLandmarker** - Advanced face mesh
- **MediaPipe ImageSegmenter** - Background segmentation
- **Three.js** - 3D hairstyle rendering

### AI Models (Located in `/public/models/`)

| Model | Purpose |
|-------|---------|
| `tiny_face_detector` | Fast face detection |
| `ssd_mobilenetv1` | Accurate face detection |
| `face_landmark_68` | 68-point face landmarks |
| `face_recognition` | Face recognition |
| `age_gender_model` | Age/gender prediction |
| `face_expression` | Emotion detection |

### Available Hairstyles

| Style | Category | Difficulty |
|-------|----------|------------|
| Classic Crew Cut | Short | Low |
| Modern Pompadour | Medium | Medium |
| Textured Crop | Short | Low |
| Side Part | Medium | Medium |
| Undercut | Short | High |
| Quiff | Medium | Medium |

### Features
- Real-time camera feed processing
- Face shape detection
- Age estimation
- Skin tone analysis
- Hairstyle recommendations based on face attributes
- 3D model overlay on detected face

---

## 📅 Appointment System

### Booking Flow

1. **Customer Self-Booking**
   - Select service → Choose date/time → Confirm booking
   - Marked as `bookedBy: 'customer'`

2. **Admin/Staff Booking**
   - Select customer → Choose service → Assign staff → Set date/time
   - Marked as `bookedBy: 'admin'` or `bookedBy: 'staff'`

### Appointment Status

| Status | Description |
|--------|-------------|
| `PENDING` | Awaiting confirmation |
| `CONFIRMED` | Approved and scheduled |
| `COMPLETED` | Service delivered |
| `CANCELLED` | Appointment cancelled |

### Available Services

| Service | Category | Duration | Price |
|---------|----------|----------|-------|
| Haircut | Hair | 60 min | $50 |
| Premium Haircut & Styling | Hair | 90 min | $85 |
| Hair Coloring & Highlights | Hair | 150 min | $125 |
| Beard Styling & Trim | Hair | 45 min | $35 |
| Tattoo | Tattoo | 180 min | $120 |
| Piercing | Piercing | 30 min | $40 |
| Spa | Spa | 90 min | $80 |
| Full Spa Package | Spa | 120 min | $150 |
| Manicure & Pedicure | Nails | 75 min | $65 |

---

## 👨‍💼 Admin Dashboard

### Dashboard Sections

1. **Overview** (`/dashboard/admin`)
   - Statistics cards
   - Recent appointments
   - Quick actions

2. **User Management** (`/dashboard/users`)
   - View all customers
   - Edit user details
   - Activate/deactivate accounts

3. **Staff Management** (`/dashboard/adminstaff`)
   - View all staff
   - Edit staff details
   - Manage specialties

4. **Service Management** (`/dashboard/services`)
   - Add/edit/delete services
   - Set pricing and duration
   - Enable/disable services

5. **Appointment Management** (`/dashboard/appointments`)
   - Calendar and list views
   - Filter by status/date/staff
   - Approve/reschedule/cancel

---

## 🔌 API Integration

### Base URL
```
http://localhost:8080/api
```

### Authentication Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | User login |
| POST | `/auth/register` | User registration |
| GET | `/auth/me` | Get current user |

### Appointment Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/appointments` | Get all appointments |
| POST | `/appointments` | Create appointment |
| PUT | `/appointments/:id` | Update appointment |
| DELETE | `/appointments/:id` | Cancel appointment |

### Service Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/services` | Get all services |
| POST | `/services` | Create service |
| PUT | `/services/:id` | Update service |
| DELETE | `/services/:id` | Delete service |

---

## 🎨 Styling

### Tailwind CSS

The project uses Tailwind CSS with custom configuration:

```javascript
// Custom Colors
colors: {
  purple: {
    50: '#f5f3ff',
    // ... up to 900
  }
}

// Custom Fonts
fontFamily: {
  inter: ['Inter', 'sans-serif'],
  abril: ['"Abril Fatface"', 'serif'],
}
```

### Animation

Using **AOS (Animate On Scroll)** for scroll-based animations:

```tsx
useEffect(() => {
  AOS.init({ once: false });
}, []);
```

---

## 📜 Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Development | `npm run dev` | Start dev server |
| Build | `npm run build` | Production build |
| Preview | `npm run preview` | Preview production build |
| Lint | `npm run lint` | Run ESLint |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style
- Use TypeScript for all new files
- Follow ESLint configuration
- Use functional components with hooks
- Write meaningful commit messages

---

## 📄 License

This project is private and proprietary. All rights reserved.

---

## 📞 Support

For support, please contact the development team.

---

## 🙏 Acknowledgments

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TensorFlow.js](https://www.tensorflow.org/js)
- [face-api.js](https://github.com/justadudewhohacks/face-api.js)
- [Three.js](https://threejs.org/)
- [MediaPipe](https://mediapipe.dev/)

---

