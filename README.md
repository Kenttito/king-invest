# Kings Invest - Full Stack Investment Platform

A modern, full-stack investment platform built with React.js frontend and Node.js backend, featuring real-time trading signals, user management, and cryptocurrency integration.

## 🚀 Features

### User Features
- **User Registration & Authentication** - Secure signup/login with email verification
- **Dashboard** - Real-time portfolio tracking and investment overview
- **Deposit/Withdrawal** - Cryptocurrency deposit with QR codes and withdrawal requests
- **Recent Activity** - Transaction history and activity tracking
- **Profile Management** - User profile editing and preferences
- **Demo Trading** - Practice trading with virtual funds
- **Multi-language Support** - Internationalization with 100+ languages

### Admin Features
- **Admin Dashboard** - User management and system overview
- **Transaction Approval** - Approve/decline deposit and withdrawal requests
- **Crypto Address Management** - Update cryptocurrency addresses and QR codes
- **User Management** - View and manage user accounts
- **Login as User** - Admin can log in as any user for support

### Technical Features
- **Real-time Updates** - WebSocket integration for live data
- **Responsive Design** - Mobile-first approach with modern UI
- **Security** - JWT authentication, role-based access control
- **File Upload** - QR code image uploads and management
- **Email Integration** - SendGrid email service for notifications

## 🛠️ Tech Stack

### Frontend
- **React.js** - Modern UI framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Bootstrap** - CSS framework for styling
- **Chart.js** - Data visualization
- **i18next** - Internationalization
- **QRCode.react** - QR code generation

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **Multer** - File upload handling
- **SendGrid** - Email service
- **WebSocket** - Real-time communication

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- SendGrid account (for email)

### Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
SENDGRID_API_KEY=your_sendgrid_api_key
SENDER_EMAIL=your_verified_email
PORT=5001
```

### Frontend Setup
```bash
cd frontend
npm install
```

## 🚀 Running the Application

### Development Mode

1. **Start Backend:**
```bash
cd backend
node server.js
```

2. **Start Frontend:**
```bash
cd frontend
npm start
```

3. **Access the Application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5001

### Production Deployment

The application can be deployed to various cloud platforms:

- **Frontend**: Vercel, Netlify, or any static hosting
- **Backend**: Railway, Render, Heroku, or any Node.js hosting
- **Database**: MongoDB Atlas (cloud database)

## 📁 Project Structure

```
Kings invest/
├── backend/                 # Node.js backend
│   ├── config/             # Database and email configuration
│   ├── controllers/        # Route controllers
│   ├── middlewares/        # Authentication and role middleware
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── scripts/            # Utility scripts
│   ├── uploads/            # File uploads (QR codes)
│   ├── websocket/          # WebSocket handlers
│   └── server.js           # Main server file
├── frontend/               # React.js frontend
│   ├── public/             # Static files
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── data/           # Static data (countries, currencies)
│   │   ├── locales/        # Translation files
│   │   └── App.js          # Main app component
│   └── package.json
└── README.md
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `SENDGRID_API_KEY` - SendGrid API key for emails
- `SENDER_EMAIL` - Verified sender email address
- `PORT` - Server port (default: 5001)

### Database Setup

1. Create a MongoDB database (local or MongoDB Atlas)
2. Update the `MONGODB_URI` in your `.env` file
3. The application will automatically create necessary collections

### Email Setup

1. Sign up for a SendGrid account
2. Verify your sender email address
3. Generate an API key
4. Update the email configuration in your `.env` file

## 👥 User Roles

### Regular User
- Register and login
- View dashboard and portfolio
- Make deposits and withdrawals
- Update profile information
- View transaction history

### Admin User
- All regular user permissions
- Access admin dashboard
- Approve/decline transactions
- Manage crypto addresses
- Login as any user
- View system statistics

## 🔒 Security Features

- JWT-based authentication
- Role-based access control
- Password hashing
- Email verification
- Input validation and sanitization
- CORS configuration
- Rate limiting (can be added)

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/forgot-password` - Password reset

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/wallet` - Get wallet information
- `GET /api/user/activity` - Get transaction history

### Transactions
- `POST /api/transaction/deposit` - Create deposit request
- `POST /api/transaction/withdrawal` - Create withdrawal request
- `GET /api/transaction/pending` - Get pending transactions (admin)

### Admin
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/transaction/:id` - Approve/decline transaction
- `GET /api/admin/crypto-addresses` - Get crypto addresses
- `PUT /api/admin/crypto-addresses` - Update crypto addresses

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team

## 🔄 Updates

Stay updated with the latest features and improvements by:
- Following the repository
- Checking the releases page
- Reading the changelog

---

**Built with ❤️ for the Kings Invest platform** 