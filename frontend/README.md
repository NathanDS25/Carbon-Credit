# Carbon Credit Marketplace - Frontend

A clean, minimalistic carbon credit marketplace built with React, TypeScript, and Tailwind CSS featuring a transparent light green theme with macOS-inspired design.

## Features

### Three Dashboard Types

1. **NGO Dashboard**
   - Manage plantation data and track trees planted
   - Upload plantation images
   - View companies seeking carbon credits
   - Schedule meetings with companies
   - Access trading marketplace

2. **Company Dashboard**
   - Create credit purchase requests
   - Browse NGO partners
   - Schedule meetings with NGOs
   - Access trading marketplace

3. **Admin Dashboard**
   - Monitor all companies and NGOs
   - View blockchain transactions
   - Access satellite verification images
   - Monitor trading activity

### Trading Features
- Real-time price charts
- Trading volume analytics
- Market share distribution
- Order book (buy/sell orders)
- Recent trades history

## Tech Stack

- **React 18.3.1** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS 4.1** - Styling
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **Vite** - Build tool

## Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── CompanyDashboard.tsx
│   │   │   ├── NGODashboard.tsx
│   │   │   ├── TradingDashboard.tsx
│   │   │   └── ScheduleMeetModal.tsx
│   │   └── App.tsx
│   └── styles/
│       ├── theme.css
│       └── fonts.css
├── package.json
└── vite.config.ts
```

## Design System

### Colors
- Primary: `#2d8659` (Money green)
- Background: `rgba(245, 255, 247, 0.95)` (Light green with transparency)
- Cards: `rgba(255, 255, 255, 0.85)` (Frosted glass effect)
- Border: `rgba(45, 134, 89, 0.15)`

### Key Design Principles
- Transparent, glassmorphic UI elements
- Clean, minimalistic layout
- macOS-inspired spacing and typography
- Smooth transitions and hover effects
- Responsive design

## Usage

1. Select your dashboard type (NGO, Company, or Admin)
2. Navigate between Overview and Trading tabs
3. Use "Schedule Meet" to book meetings with partners
4. Access real-time trading data and analytics

## License

Proprietary - Carbon Credit Marketplace
