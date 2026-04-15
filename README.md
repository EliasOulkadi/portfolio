# Full Stack Portfolio - Elias Oulkadi

> **Personal portfolio with Node.js/Express backend and vanilla JavaScript frontend**
> 
> A project showcasing my Full Stack development skills, built from scratch without frontend frameworks.

## **What is this project?**

This is my professional portfolio where I demonstrate my technical capabilities in web development. I built it completely by myself as part of my self-taught programming journey.

### **Key Features**

- **Vanilla Frontend**: HTML5, CSS3, JavaScript ES6+ (no React, Vue, or Angular)
- **REST API Backend**: Node.js + Express with JWT authentication
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel with serverless functions
- **Responsive Design**: Mobile-first with CSS Grid and Flexbox

---

## **Tech Stack**

### **Backend**
```
Node.js          - JavaScript Runtime
Express.js       - Minimalist Web Framework
JWT              - Token-based Authentication
bcryptjs         - Password Encryption
Supabase         - PostgreSQL Database
CORS             - Cross-Origin Resource Sharing
dotenv           - Environment Variables
```

### **Frontend**
```
HTML5            - Semantic Structure
CSS3             - Swiss Minimalist Design
JavaScript ES6+ - Client-side Logic
IntersectionObserver - Scroll Animations
Fetch API        - HTTP Requests
CSS Grid/Flexbox - Responsive Layout
```

### **DevOps**
```
Vercel           - Hosting & Deployment
Git              - Version Control
Nodemon          - Local Development
```

---

## **Project Structure**

```
WEB/
|
|-- backend/                 # REST API
|   |-- middleware/          # Custom Middleware
|   |-- routes/             # API Endpoints
|   |-- server.js           # Main Server
|   |-- supabase.js         # Database Client
|   |-- .env                # Environment Variables
|
|-- frontend/               # Web Application
|   |-- css/               # Stylesheets
|   |-- js/                # JavaScript Logic
|   |-- index.html         # Main Portfolio
|   |-- admin.html         # Admin Panel
|   |-- panel.html         # Tasks Dashboard
|   |-- dashboard.html     # Complete Dashboard
|
|-- vercel.json            # Vercel Configuration
|-- setup.sql              # Database Setup Script
|-- install.bat            # Windows Installation
```

---

## **Features**

### **Main Portfolio**
- **Smooth scroll navigation** with active scrollspy
- **Reveal animations** on scroll
- **SVG annotations** explaining the code (large screens only)
- **Contact form** with validation and Supabase integration
- **Typing animation** in hero section
- **Live stats** from database

### **Admin Panel**
- **Secure login** with JWT and bcrypt
- **Project management** with full CRUD
- **Personal task system**
- **API Explorer** for testing endpoints
- **Dashboard** with real-time metrics

### **REST API**
```
GET    /api/projects     - Get all projects
POST   /api/contact      - Send contact message
POST   /api/auth/login   - User login
GET    /api/tasks        - Get tasks (auth required)
POST   /api/tasks        - Create task (auth required)
```

---

## **Local Development**

### **Prerequisites**
- Node.js 16+
- Git
- Supabase account (optional for demo)

### **Setup**

1. **Clone repository**
```bash
git clone https://github.com/eliasoulkadi/portfolio.git
cd portfolio
```

2. **Install dependencies**
```bash
# Windows
install.bat

# Or manually
cd backend && npm install
```

3. **Configure environment**
```bash
cd backend
cp .env.example .env
# Edit .env with your Supabase credentials
```

4. **Start server**
```bash
npm run dev
```

5. **Open browser**
```
http://localhost:3000
```

---

## **Why This Architecture?**

### **Vanilla JavaScript Frontend**
I wanted to prove I can build complex applications without framework dependencies. It helps me better understand web development fundamentals.

### **Node.js + Express**
Most popular stack for JavaScript backend. Express is minimal but powerful, perfect for a REST API.

### **Supabase**
I love PostgreSQL but wanted a serverless solution for deployment. Supabase gives me the best of both worlds.

### **Vercel**
Easiest hosting for Node.js serverless applications. Perfect Git integration and automatic deployment.

---

## **Technical Challenges Solved**

### **1. SVG Annotations Without Libraries**
Code annotations built with vanilla SVG. Had to calculate positions dynamically and prevent collisions between them.

### **2. Secure JWT Authentication**
Implemented JWT tokens with refresh tokens and robust validation without external dependencies.

### **3. Performant Animations**
Used IntersectionObserver for performance-friendly animations with custom stagger effects.

### **4. Scalable REST API**
Designed API following RESTful principles with custom middleware for rate limiting and validation.

---

## **Future Improvements**

- [ ] **PWA**: Service Worker and manifest
- [ ] **Testing**: Unit tests with Jest
- [ ] **CI/CD**: GitHub Actions
- [ ] **Analytics**: Google Analytics 4
- [ ] **i18n**: Multi-language support
- [ ] **Dark/Light mode**: Theme toggle

---

## **Contact**

- **Email**: elias.oulkadi@example.com
- **GitHub**: [@eliasoulkadi](https://github.com/eliasoulkadi)
- **Portfolio**: [portafolio-elias-snowy.vercel.app](https://portafolio-elias-snowy.vercel.app)

---

## **License**

MIT License - feel free to use this code for learning or inspiration.

---

**Built with passion by Elias Oulkadi** © 2024

> *"The best code is code that works and that others can understand"*
