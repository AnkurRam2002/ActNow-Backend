# ActNow Backend

A comprehensive volunteer management system backend built with Node.js and Express. This API enables NGOs to create and manage volunteering events, volunteers to register and participate in events, and administrators to oversee the entire platform.

## 🌟 Features

### User Management
- **Multi-role System**: Support for volunteers, NGOs, and administrators
- **Secure Authentication**: JWT-based authentication with bcrypt password hashing
- **Admin Approval**: Registration requests require admin approval for enhanced security
- **Profile Management**: Users can manage their profiles, skills, and preferences

### Event Management
- **Event Creation**: NGOs can create and manage volunteering events
- **Event Discovery**: Search and filter events by location, skills, date range, and keywords
- **Event Registration**: Volunteers can register for events that match their skills
- **Event Tracking**: Automatic status updates (Upcoming → Ongoing → Completed)
- **Attendance Management**: Track volunteer attendance and participation

### Notifications & Communication
- **Push Notifications**: Real-time web push notifications for event updates
- **Email Notifications**: Automated email notifications for important events
- **SMS Notifications**: Twilio integration for SMS alerts
- **Scheduled Notifications**: Cron-based notification scheduler for upcoming events

### Certificates & Documentation
- **Auto-generated Certificates**: PDF certificates for volunteers who complete events
- **Payment Receipts**: Auto-generated receipts for donations/payments
- **Event Passes**: Digital passes for registered volunteers

### Additional Features
- **AI Chatbot**: Google GenAI-powered chatbot for user assistance
- **Payment Integration**: Razorpay integration for donations and payments
- **File Uploads**: Support for ID verification documents and event images
- **Activity Tracking**: Real-time activity monitoring and logging
- **Health Check**: API health monitoring endpoint

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT, bcryptjs
- **File Upload**: Multer
- **Payment**: Razorpay
- **Notifications**: 
  - Web Push
  - Nodemailer (Email)
  - Twilio (SMS)
- **AI**: Google GenAI
- **PDF Generation**: PDFKit
- **Task Scheduling**: node-cron
- **Security**: CORS, dotenv

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB instance
- npm or yarn package manager

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AnkurRam2002/ActNow-Backend.git
   cd ActNow-Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory with the following variables:
   ```env
   # Server Configuration
   PORT=5000

   # Database
   MONGO_URI=your_mongodb_connection_string

   # Authentication
   JWT_SECRET=your_jwt_secret_key

   # Email Service (Nodemailer)
   EMAIL_USER=your_email@example.com
   EMAIL_PASS=your_email_password

   # SMS Service (Twilio)
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number

   # Payment Gateway (Razorpay)
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret

   # Web Push Notifications
   VAPID_PUBLIC_KEY=your_vapid_public_key
   VAPID_PRIVATE_KEY=your_vapid_private_key
   VAPID_SUBJECT=mailto:your_email@example.com

   # Google GenAI
   GOOGLE_API_KEY=your_google_genai_api_key
   ```

4. **Start the server**
   ```bash
   node server.js
   ```

   The server will start on `http://localhost:5000`

## 📁 Project Structure

```
ActNow-Backend/
├── helpers/
│   ├── activityEmitter.js       # Event emitter for activity tracking
│   ├── activityListener.js      # Activity event listeners
│   ├── authMiddleware.js        # JWT authentication middleware
│   ├── emailService.js          # Email notification service
│   ├── eventStatusCron.js       # Cron job for event status updates
│   ├── generateCertificate.js   # Certificate PDF generator
│   ├── generateReceipt.js       # Receipt PDF generator
│   ├── googleAI.js              # Google GenAI configuration
│   ├── multerConfig.js          # File upload configuration
│   ├── notificationSchedulerCron.js  # Notification scheduler
│   ├── sendCertCron.js          # Certificate sender cron job
│   └── smsService.js            # SMS notification service
├── models/
│   ├── activity.model.js        # Activity tracking schema
│   ├── event.models.js          # Event schema
│   ├── pending.model.js         # Pending registration schema
│   └── user.models.js           # User schema
├── routes/
│   ├── admin.js                 # Admin-specific routes
│   ├── auth.js                  # Authentication routes
│   ├── chatbot.js               # AI chatbot routes
│   ├── events.js                # Event management routes
│   ├── health.js                # Health check routes
│   ├── pass.js                  # Event pass routes
│   ├── payment.js               # Payment processing routes
│   ├── pushrouter.js            # Push notification routes
│   └── user.js                  # User management routes
├── uploads/                     # User-uploaded files
├── .gitignore
├── package.json
└── server.js                    # Main application entry point
```

## 🔌 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Submit registration for admin approval (requires ID upload)
- `POST /login` - User login
- `POST /logout` - User logout (requires authentication)

### Events (`/api/events`)
- `GET /` - Get all events (supports filtering and search)
- `POST /` - Create new event (NGO only)
- `GET /:id` - Get event by ID
- `PUT /:id` - Update event (NGO owner only)
- `DELETE /:id` - Delete event (NGO owner only)
- `POST /:id/register` - Register for an event (Volunteer only)
- `POST /:id/mark-present` - Mark volunteer as present
- `POST /:id/complete` - Mark event as completed

### Users (`/api/users`)
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `GET /events` - Get user's events (registered/created)

### Admin (`/api/admin`)
- `GET /pending-registrations` - Get pending user registrations
- `POST /approve-registration/:id` - Approve user registration
- `DELETE /reject-registration/:id` - Reject user registration
- `GET /users` - Get all users
- `DELETE /users/:id` - Delete user

### Chatbot (`/api/chatbot`)
- `POST /chat` - Send message to AI chatbot

### Push Notifications (`/api/push`)
- `POST /subscribe` - Subscribe to push notifications
- `POST /send` - Send push notification

### Payment (`/api/payment`)
- `POST /create-order` - Create Razorpay order
- `POST /verify` - Verify payment

### Event Pass (`/api/pass`)
- `GET /:eventId` - Generate event pass for volunteer

### Health (`/api/health`)
- `GET /` - Check API health status

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 👥 User Roles

1. **Volunteer**: Can browse events, register for events, and receive certificates
2. **NGO**: Can create and manage events, mark attendance, and manage volunteers
3. **Admin**: Can approve/reject registrations and manage all users and events

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**Ankur Ram**

## 🙏 Acknowledgments

- Built as a final year project to facilitate volunteer management
- Thanks to all the open-source libraries that made this possible

---

**Note**: Make sure to keep your `.env` file secure and never commit it to version control. All sensitive credentials should be stored in environment variables.
