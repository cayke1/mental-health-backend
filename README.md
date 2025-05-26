# Sereno - Healthcare Platform API

A comprehensive NestJS-based healthcare platform that connects mental health professionals with their patients, providing secure document sharing, therapy session management, and subscription-based services.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control (Professional/Patient)
- **User Management**: Professional and patient user registration and management
- **Document Management**: Secure file upload/download with Cloudflare R2 storage
- **Therapy Sessions**: Session scheduling and management
- **Subscription System**: Stripe integration for payment processing
- **Email Services**: Automated email notifications and templates
- **Invite System**: Professional-to-patient invitation workflow
- **Professional Reports**: Analytics and reporting for healthcare professionals
- **File Upload**: Multi-format document support with categorization
- **Logging**: Comprehensive logging with Discord webhook integration

## 🛠 Tech Stack

- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens with bcrypt password hashing
- **File Storage**: Cloudflare R2 (S3-compatible)
- **Payments**: Stripe integration
- **Email**: Resend API
- **Validation**: class-validator with DTOs
- **Documentation**: Swagger/OpenAPI
- **Task Scheduling**: @nestjs/schedule
- **Testing**: Jest

## 📋 Prerequisites

- Node.js (v18 or higher)
- pnpm package manager
- PostgreSQL database
- Cloudflare R2 account
- Stripe account
- Resend API key

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sereno-api
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**
   Edit `.env` file with your configuration:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/sereno"
   
   # JWT
   JWT_SECRET="your-jwt-secret"
   JWT_EXPIRES_IN="1d"
   
   # Cloudflare R2
   R2_ENDPOINT="https://your-account-id.r2.cloudflarestorage.com"
   R2_ACCESS_KEY_ID="your-access-key"
   R2_SECRET_ACCESS_KEY="your-secret-key"
   R2_BUCKET="your-bucket-name"
   CDN_URL="https://your-cdn-url.com"
   
   # Stripe
   STRIPE_SECRET_KEY="sk_test_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."
   
   # Email
   RESEND_API_KEY="re_..."
   EMAIL_FROM="noreply@yourapp.com"
   
   # Frontend
   FRONTEND_URL="http://localhost:3000"
   
   # Discord Logging
   DISCORD_LOG_PROJECT_ID="your-project-id"
   DISCORD_LOG_WEBHOOK_URL="https://discord.com/api/webhooks/..."
   ```

5. **Database setup**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma migrate dev
   
   # (Optional) Seed the database
   npx prisma db seed
   ```

## 🚀 Running the Application

```bash
# Development mode
pnpm run start:dev

# Production mode
pnpm run start:prod

# Watch mode
pnpm run start
```

The API will be available at `http://localhost:3000`

## 📚 API Documentation

Once the application is running, you can access the Swagger documentation at:
- **Swagger UI**: `http://localhost:3000/api`

## 🧪 Testing

```bash
# Unit tests
pnpm run test

# End-to-end tests
pnpm run test:e2e

# Test coverage
pnpm run test:cov

# Watch mode
pnpm run test:watch
```

## 📁 Project Structure

```
src/
├── auth/                 # Authentication module
├── users/               # User management
├── document/            # Document management
├── therapy-session/     # Therapy session management
├── subscription/        # Stripe subscription handling
├── invite/              # Invitation system
├── mail/                # Email services
├── upload/              # File upload utilities
├── professional-reports/ # Analytics and reporting
├── patient-professional/ # Professional-patient relationships
├── tasks/               # Scheduled tasks
├── logger/              # Logging module
├── prisma/              # Database configuration
├── custom/              # Custom decorators and utilities
└── main.ts              # Application entry point
```

## 🔐 Authentication

The API uses JWT-based authentication with role-based access control:

- **Roles**: `PROFESSIONAL`, `PATIENT`
- **Public endpoints**: Registration, login, password reset
- **Protected endpoints**: Require valid JWT token
- **Role-specific endpoints**: Additional role validation

### Example Authentication Flow

1. **Register/Login**
   ```bash
   POST /auth/register
   POST /auth/login
   ```

2. **Access protected endpoints**
   ```bash
   GET /auth/profile
   Authorization: Bearer <jwt-token>
   ```

## 📄 Key API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/register/patient` - Patient registration with professional link
- `GET /auth/profile` - Get user profile
- `POST /auth/forgot-password` - Password reset request
- `POST /auth/reset-password` - Reset password

### Documents
- `POST /document/upload` - Upload document
- `GET /document/my` - Get user's documents
- `GET /document/professional` - Get professional's documents (for patients)
- `GET /document/patients` - Get patients' documents (for professionals)
- `DELETE /document/:id` - Delete document

### Users
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update profile
- `GET /users/professionals` - List professionals

## 🔄 Deployment

### Using Mau (NestJS Official Platform)

```bash
# Install Mau CLI
pnpm install -g mau

# Deploy to AWS
mau deploy
```

### Manual Deployment

1. **Build the application**
   ```bash
   pnpm run build
   ```

2. **Set production environment variables**

3. **Run database migrations**
   ```bash
   npx prisma migrate deploy
   ```

4. **Start the application**
   ```bash
   pnpm run start:prod
   ```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the [MIT License](LICENSE).

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team

## 🔗 Related Links

- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Stripe API Documentation](https://stripe.com/docs/api)
- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
