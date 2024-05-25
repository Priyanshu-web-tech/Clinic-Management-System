
# DocMate

DocMate is a comprehensive SaaS Clinic Management System designed to streamline traditional clinic processes with three distinct user interfaces for doctors, receptionists, and medicine personnel. It offers robust CRUD functionalities, enabling efficient data management and updates. Additionally, its real-time queue management system enhances workflow automation, ensuring a smooth transition from patient registration to prescription management and medicine preparation, thereby improving overall clinic efficiency and patient care.


## Demo

https://clinic-management-sys.vercel.app/
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

Go to the Backend directory

```bash
  cd Backend
```

Install dependencies

```bash
  npm install
```

Create .env file & add the following in it:

```bash
MONGO_URI= your mongodb database uri
PORT=3000//most used
JWT_KEY= your JWT key
CLIENT_ORIGIN=http://localhost:5173 (Change port number as applicable)
```

Start the server

```bash
  npm run dev
```
### Frontend Setup

Go to the Frontend directory

```bash
  cd Frontend
```

Install dependencies

```bash
  npm install
```

Create .env file & add the following in it:

```bash
VITE_BASE_URL=http://localhost:3000 (Change port number as applicable)
```

Start the server

```bash
  npm run dev
```


## Tech Stack

**Client:** React, Redux Tool Kit, TailwindCSS

**Server:** Node, Express

**Database:** MongoDB with ORM-Mongoose


## Screenshots

![App Screenshot](https://ik.imagekit.io/pz4meracm/Screenshot%20from%202024-05-25%2013-24-42.png?updatedAt=1716623704155)

