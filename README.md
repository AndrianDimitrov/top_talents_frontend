# TopTalents - Football Talent Management System

A modern React frontend application for managing football talents, scouts, teams, and match data.

## Features

- User authentication (Login/Register)
- Role-based access control (Admin, Talent, Scout)
- Talent profile management
- Scout profile and talent following
- Team management
- Match calendar and history
- Modern UI with Material-UI components
- Form validation with react-hook-form and Yup
- State management with Redux Toolkit
- TypeScript for better type safety

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Modern web browser

## Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
cd toptalents-frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory and add your environment variables:
```env
VITE_API_URL=http://localhost:8080/api
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`.

## Project Structure

```
src/
├── components/         # Reusable components
│   ├── auth/          # Authentication components
│   ├── layout/        # Layout components
│   └── shared/        # Shared components
├── pages/             # Page components
│   ├── admin/         # Admin pages
│   ├── auth/          # Authentication pages
│   ├── matches/       # Match-related pages
│   ├── scouts/        # Scout-related pages
│   ├── talents/       # Talent-related pages
│   └── teams/         # Team-related pages
├── store/             # Redux store
│   ├── slices/        # Redux slices
│   └── index.ts       # Store configuration
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
├── App.tsx            # Main App component
└── main.tsx           # Application entry point
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 