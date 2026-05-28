
# DocMate

DocMate is a comprehensive SaaS Clinic Management System designed to streamline traditional clinic processes with three distinct user interfaces for doctors, receptionists, and medicine personnel. It offers robust CRUD functionalities, enabling efficient data management and updates. Additionally, its real-time queue management system enhances workflow automation, ensuring a smooth transition from patient registration to prescription management and medicine preparation, thereby improving overall clinic efficiency and patient care.


## Demo

https://clinic-management-sys.vercel.app/

## API Documentation (Swagger)

https://clinic-management-system-5x88.onrender.com/api-docs/

## Run Locally

Clone the project

```bash
git clone https://github.com/Priyanshu-web-tech/Clinic-Management-System.git
```

Go to the project directory

```bash
cd Clinic-Management-System
```

### Backend Setup

Go to the server directory

```bash
cd server
```

Install dependencies

```bash
npm install
```

Generate RSA key pair (required for JWT RS256 signing)

```bash
openssl genrsa -out private.key 2048
openssl rsa -in private.key -pubout -out public.key
```

Create a `.env` file by copying the sample and filling in your values

```bash
cp .sampleEnv .env
```

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `PORT` | Port the server listens on (default `3000`) |
| `NODE_ENV` | `development` or `production` |
| `COOKIE_SECRET` | Random secret used to sign cookies |
| `TOKEN_EXPIRES_IN` | Access token lifetime (e.g. `1d`) |
| `REFRESH_TOKEN_EXPIRES_IN` | Refresh token lifetime (e.g. `7d`) |
| `SECRET_KEY` | Additional secret key for signing |
| `JWT_ALGO` | JWT algorithm — must be `RS256` |
| `JWT_ISSUER` | JWT issuer claim (e.g. `DOCMATE`) |
| `ROUND` | bcrypt salt rounds (e.g. `10`) |
| `BREVO_API_KEY` | Brevo (Sendinblue) API key for sending emails |
| `BREVO_SENDER_EMAIL` | Verified sender email address in Brevo |
| `CRON_SECRET` | Secret token to authenticate scheduled cron job requests |
| `OTP_EXPIRES_IN` | OTP validity window (e.g. `15m`) |
| `OTP_DIGIT` | Number of OTP digits (e.g. `6`) |
| `OTP_BYPASS` | Set `true` in dev to skip real OTP sending |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed CORS origins |
| `SERVER_REDIRECT_URI` | Base URI used for server-side redirects |

Start the server

```bash
npm run dev
```

### Frontend Setup

Go to the client directory

```bash
cd client
```

Install dependencies

```bash
npm install
```

Create a `.env` file and add the following

```bash
VITE_BASE_URL=http://localhost:3000/api/v1/
```

Start the client

```bash
npm run dev
```


## Tech Stack

**Client:** React, Redux Toolkit, TailwindCSS

**Server:** Node, Express

**Database:** MongoDB with Mongoose

**Auth:** JWT (RS256), HTTP-only cookies, OTP via Brevo email API


## Screenshots

![App Screenshot](https://ik.imagekit.io/pz4meracm/Screenshot%20from%202024-05-25%2013-24-42.png)
