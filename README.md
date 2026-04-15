# Portfolio Full Stack - Elias Oulkadi

> **Portfolio personal con backend Node.js/Express y frontend vanilla JavaScript**
> 
> Un proyecto que muestra mis habilidades como desarrollador Full Stack, construido desde cero sin frameworks frontend.

## **¿Qué es este proyecto?**

Este es mi portfolio profesional donde demuestro mis capacidades técnicas en desarrollo web full stack. Lo construí completamente por mí mismo como parte de mi aprendizaje autodidacta en programación.

### **Características principales**

- **Frontend vanilla**: HTML5, CSS3, JavaScript ES6+ (sin React, Vue o Angular)
- **Backend REST API**: Node.js + Express con autenticación JWT
- **Base de datos**: Supabase (PostgreSQL)
- **Despliegue**: Vercel con serverless functions
- **Diseño responsive**: Mobile-first con CSS Grid y Flexbox

---

## **Tecnologías utilizadas**

### **Backend**
```
Node.js          - Runtime JavaScript
Express.js       - Framework web minimalista
JWT              - Autenticación con tokens
bcryptjs         - Encriptación de contraseñas
Supabase         - Base de datos PostgreSQL
CORS             - Compartir recursos entre orígenes
dotenv           - Variables de entorno
```

### **Frontend**
```
HTML5            - Estructura semántica
CSS3             - Diseño Swiss Minimalist
JavaScript ES6+ - Lógica del cliente
IntersectionObserver - Animaciones scroll
Fetch API        - Peticiones HTTP
CSS Grid/Flexbox - Layout responsive
```

### **DevOps**
```
Vercel           - Hosting y despliegue
Git              - Control de versiones
Nodemon          - Desarrollo local
```

---

## **Estructura del proyecto**

```
WEB/
|
|-- backend/                 # API REST
|   |-- middleware/          # Middleware personalizado
|   |-- routes/             # Endpoints de la API
|   |-- server.js           # Servidor principal
|   |-- supabase.js         # Cliente de base de datos
|   |-- .env                # Variables de entorno
|
|-- frontend/               # Aplicación web
|   |-- css/               # Hojas de estilo
|   |-- js/                # Lógica JavaScript
|   |-- index.html         # Portfolio principal
|   |-- admin.html         # Panel admin
|   |-- panel.html         # Dashboard tareas
|   |-- dashboard.html     # Vista completa
|
|-- vercel.json            # Configuración Vercel
|-- setup.sql              # Script base de datos
|-- install.bat            # Instalación Windows
```

---

## **Funcionalidades**

### **Portfolio principal**
- **Navegación smooth scroll** con scrollspy activo
- **Animaciones reveal** al hacer scroll
- **Anotaciones SVG** que explican el código (solo pantallas grandes)
- **Formulario de contacto** con validación y envío a Supabase
- **Typing animation** en el hero section
- **Live stats** desde la base de datos

### **Panel de administración**
- **Login seguro** con JWT y bcrypt
- **Gestión de proyectos** CRUD completo
- **Sistema de tareas** personal
- **API Explorer** para probar endpoints
- **Dashboard** con métricas en tiempo real

### **API REST**
```
GET    /api/projects     - Obtener todos los proyectos
POST   /api/contact      - Enviar mensaje contacto
POST   /api/auth/login   - Iniciar sesión
GET    /api/tasks        - Obtener tareas (auth requerido)
POST   /api/tasks        - Crear tarea (auth requerido)
```

---

## **Instalación local**

### **Prerrequisitos**
- Node.js 16+
- Git
- Cuenta Supabase (opcional para demo)

### **Pasos**

1. **Clonar el repositorio**
```bash
git clone https://github.com/eliasoulkadi/portfolio.git
cd portfolio
```

2. **Instalar dependencias**
```bash
# Windows
install.bat

# O manualmente
cd backend && npm install
```

3. **Configurar variables de entorno**
```bash
cd backend
cp .env.example .env
# Editar .env con tus credenciales de Supabase
```

4. **Iniciar servidor**
```bash
npm run dev
```

5. **Abrir navegador**
```
http://localhost:3000
```

---

## **¿Por qué esta arquitectura?**

### **Frontend vanilla JavaScript**
Quería demostrar que puedo construir aplicaciones complejas sin depender de frameworks. Me ayuda a entender mejor los fundamentos del web development.

### **Node.js + Express**
Es el stack más popular para backend JavaScript. Express es minimalista pero potente, perfecto para una API REST.

### **Supabase**
Me encanta PostgreSQL pero quería una solución serverless para el despliegue. Supabase me da lo mejor de ambos mundos.

### **Vercel**
El hosting más fácil para aplicaciones Node.js serverless. Integración perfecta con Git y despliegue automático.

---

## **Desafíos técnicos que resolví**

### **1. Anotaciones SVG sin librerías**
Las anotaciones que explican el código están hechas con SVG vanilla. Tuve que calcular las posiciones dinámicamente y evitar colisiones entre ellas.

### **2. Autenticación JWT segura**
Implementé tokens JWT con refresh tokens y validación robusta sin dependencias externas.

### **3. Animaciones performantes**
Usé IntersectionObserver para animaciones que no afectan el rendimiento, con stagger effects personalizados.

### **4. API REST escalable**
Diseñé la API siguiendo principios RESTful con middleware personalizado para rate limiting y validación.

---

## **Mejoras futuras**

- [ ] **PWA**: Service Worker y manifest
- [ ] **Testing**: Unit tests con Jest
- [ ] **CI/CD**: GitHub Actions
- [ ] **Analytics**: Google Analytics 4
- [ ] **i18n**: Soporte multiidioma
- [ ] **Dark/Light mode**: Toggle de tema

---

## **Contacto**

- **Email**: elias.oulkadi@example.com
- **GitHub**: [@eliasoulkadi](https://github.com/eliasoulkadi)
- **LinkedIn**: [elias-oulkadi](https://linkedin.com/in/elias-oulkadi)
- **Portfolio**: [eliasoulkadi.dev](https://eliasoulkadi.vercel.app)

---

## **Licencia**

MIT License - puedes usar este código para aprender o inspirarte.

---

**Built with passion by Elias Oulkadi** © 2024

> *"El mejor código es el código que funciona y que otros pueden entender"*
