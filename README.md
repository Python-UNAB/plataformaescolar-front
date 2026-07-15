# Plataforma Escolar — Frontend


---

## Tabla de contenidos

- [Tecnologías principales](#tecnologías-principales)
- [Librerías y dependencias](#librerías-y-dependencias)
- [Herramientas de desarrollo](#herramientas-de-desarrollo)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Roles y permisos](#roles-y-permisos)
- [Páginas y rutas](#páginas-y-rutas)
- [Componentes reutilizables](#componentes-reutilizables)
- [Servicios (capa de API)](#servicios-capa-de-api)
- [Autenticación](#autenticación)
- [Variables de entorno](#variables-de-entorno)
- [Scripts disponibles](#scripts-disponibles)
- [Despliegue](#despliegue)

---

## Tecnologías principales

| Tecnología | Versión | Descripción |
|---|---|---|
| [React](https://react.dev/) | 19.2.5 | Librería principal de UI |
| [TypeScript](https://www.typescriptlang.org/) | ~6.0.2 | Tipado estático sobre JavaScript |
| [Vite](https://vite.dev/) | 8.0.10 | Bundler y servidor de desarrollo |
| [React Router DOM](https://reactrouter.com/) | 7.14.2 | Enrutamiento client-side (SPA) |

---

## Librerías y dependencias

### UI y componentes

| Librería | Versión | Uso |
|---|---|---|
| [@mui/material](https://mui.com/) | 7.1.0 | Componentes de Material Design (diálogos, inputs, chips, etc.) |
| [@mui/x-data-grid](https://mui.com/x/react-data-grid/) | 8.5.0 | Tabla de datos avanzada con paginación, ordenamiento y filtros |
| [@emotion/react](https://emotion.sh/) | 11.14.0 | Motor de CSS-in-JS requerido por MUI |
| [@emotion/styled](https://emotion.sh/) | 11.14.0 | API de componentes estilizados para Emotion |
| [lucide-react](https://lucide.dev/) | 0.460.0 | Librería de íconos SVG (GraduationCap, Users, BookOpen, etc.) |

### HTTP y comunicación

| Librería | Versión | Uso |
|---|---|---|
| [axios](https://axios-http.com/) | 1.15.2 | Cliente HTTP con soporte para interceptores de request/response |

---

## Herramientas de desarrollo

| Herramienta | Versión | Descripción |
|---|---|---|
| [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react) | 6.0.1 | Plugin de Vite para soporte de JSX/TSX con Fast Refresh |
| [eslint](https://eslint.org/) | 10.2.1 | Linter de código JavaScript/TypeScript |
| [typescript-eslint](https://typescript-eslint.io/) | 8.58.2 | Reglas de ESLint para TypeScript |
| [eslint-plugin-react-hooks](https://www.npmjs.com/package/eslint-plugin-react-hooks) | 7.1.1 | Reglas de linting para hooks de React |
| [eslint-plugin-react-refresh](https://www.npmjs.com/package/eslint-plugin-react-refresh) | 0.5.2 | Valida que los componentes sean compatibles con Fast Refresh |
| [@types/react](https://www.npmjs.com/package/@types/react) | 19.2.14 | Tipos de TypeScript para React |
| [@types/react-dom](https://www.npmjs.com/package/@types/react-dom) | 19.2.3 | Tipos de TypeScript para React DOM |
| [@types/node](https://www.npmjs.com/package/@types/node) | 24.12.2 | Tipos de TypeScript para Node.js |
| [globals](https://www.npmjs.com/package/globals) | 17.5.0 | Definiciones de variables globales para ESLint |

---

## Estructura del proyecto

```
src/
├── assets/                  # Recursos estáticos (imágenes, fuentes)
├── components/              # Componentes UI reutilizables
│   ├── Alert/
│   ├── Badge/
│   ├── Breadcrumbs/
│   ├── Button/
│   ├── Card/
│   ├── DataTable/
│   ├── EmptyState/
│   ├── Footer/
│   ├── Layout/
│   ├── Loading/
│   ├── Modal/
│   ├── PageHeader/
│   ├── ProtectedRoute/
│   └── index.ts             # Barrel export de todos los componentes
├── context/
│   └── AuthContext.tsx      # Contexto global de autenticación
├── pages/                   # Páginas por feature
│   ├── Courses/
│   ├── Dashboard/
│   ├── Enrollments/
│   ├── Login/
│   ├── Students/
│   ├── Subjects/
│   ├── TeacherSubjects/
│   └── Users/
├── services/                # Capa de comunicación con la API
│   ├── api.ts               # Instancia base de Axios + interceptores
│   ├── auth.service.ts
│   ├── course.service.ts
│   ├── enrollment.service.ts
│   ├── grade.service.ts
│   ├── subject.service.ts
│   └── user.service.ts
├── styles/
│   └── global.css           # Estilos globales
├── types/
│   └── index.ts             # Tipos e interfaces compartidos
├── App.tsx                  # Definición de rutas y providers
└── main.tsx                 # Punto de entrada de la aplicación
```

---

## Roles y permisos

La aplicación maneja cinco roles definidos en el backend. Cada rol habilita un conjunto diferente de rutas y funcionalidades en el dashboard:

| Rol | Descripción |
|---|---|
| `DIRECTIVO` | Acceso completo: usuarios, cursos, materias, inscripciones y alumnos |
| `SECRETARIO` | Gestión de cursos, materias, inscripciones y búsqueda de alumnos |
| `PRECEPTOR` | Visualización de cursos y búsqueda de alumnos con historial |
| `DOCENTE` | Gestión de sus materias asignadas y carga de calificaciones |
| `ALUMNO` | Visualización de su propio historial académico y calificaciones |

---

## Páginas y rutas

| Ruta | Página | Roles con acceso |
|---|---|---|
| `/login` | Login | Pública |
| `/dashboard` | Dashboard (dinámico por rol) | Todos |
| `/usuarios` | Gestión de usuarios | DIRECTIVO |
| `/cursos` | Listado de cursos | DIRECTIVO, SECRETARIO, PRECEPTOR |
| `/cursos/:id` | Detalle de curso | DIRECTIVO, SECRETARIO, PRECEPTOR |
| `/materias` | Gestión de materias | DIRECTIVO, SECRETARIO |
| `/inscripciones` | Gestión de inscripciones | DIRECTIVO, SECRETARIO |
| `/alumnos` | Búsqueda de alumnos | DIRECTIVO, SECRETARIO, PRECEPTOR |
| `/alumnos/:id` | Historial académico del alumno | DIRECTIVO, SECRETARIO, PRECEPTOR |
| `/mis-materias` | Materias asignadas al docente | DOCENTE |
| `/mis-materias/:id` | Gestión de calificaciones por materia | DOCENTE |

### Dashboard por rol

El componente `Dashboard` renderiza una vista diferente según el rol del usuario autenticado:

- **DashboardDirectivo** — Estadísticas generales del establecimiento
- **DashboardSecretario** — Resumen de cursos e inscripciones
- **DashboardPreceptor** — Acceso rápido a cursos y alumnos
- **DashboardDocente** — Listado de materias asignadas
- **DashboardAlumno** — Calificaciones y materias propias

---

## Componentes reutilizables

Todos los componentes se exportan desde `src/components/index.ts` mediante barrel exports.

| Componente | Descripción |
|---|---|
| `Button` | Botón con soporte para variantes, tamaños y estado de carga |
| `Card` | Contenedor con subcomponentes `Header`, `Body`, `Footer`, `Filters` y `DataCard` |
| `DataTable` | Tabla de datos configurable con columnas, chips de estado, acciones y paginación |
| `Modal` | Diálogo modal genérico con soporte para formularios dinámicos |
| `ConfirmDialog` | Modal de confirmación para acciones destructivas |
| `Alert` | Alerta informativa con variantes (`error`, `warning`, `success`, `info`) y botón de cierre |
| `Badge` | Indicador visual de estado o conteo |
| `Breadcrumbs` | Navegación de migas de pan con rutas configurables |
| `PageHeader` | Encabezado de página con título y acciones |
| `Layout` | Estructura principal con barra de navegación lateral filtrada por rol |
| `ProtectedRoute` | HOC que valida autenticación y permisos de rol antes de renderizar una ruta |
| `Loading` | Indicador de carga (spinner) |
| `EmptyState` | Vista de estado vacío para listas sin resultados |
| `Footer` | Pie de página de la aplicación |
| `TableActions` | Menú de acciones por fila en tablas (editar, eliminar, ver, etc.) |

---

## Servicios (capa de API)

La comunicación con el backend se centraliza en `src/services/api.ts`, que crea una instancia de Axios configurada con:

- **Base URL** desde la variable de entorno `VITE_API_URL`
- **Interceptor de request**: agrega automáticamente el header `Authorization: Bearer <token>` desde `localStorage`
- **Interceptor de response**: maneja errores `401` redirigiendo al login

### Servicios disponibles

| Servicio | Endpoints cubiertos |
|---|---|
| `authService` | `POST /auth/login`, `GET /auth/me`, logout local |
| `userService` | CRUD de usuarios con filtros por rol, búsqueda y paginación |
| `courseService` | CRUD de cursos con detalle (materias + inscripciones) |
| `subjectService` | CRUD de materias, asignación de docentes |
| `enrollmentService` | CRUD de inscripciones, historial académico del alumno |
| `gradeService` | Carga y actualización de calificaciones por materia, período y alumno |

---

## Autenticación

El sistema usa **JWT (JSON Web Token)** con el siguiente flujo:

1. El usuario ingresa credenciales en `/login`
2. El `authService` realiza `POST /auth/login` y almacena el token en `localStorage`
3. Al inicializar la app, `AuthContext` verifica el token existente vía `GET /auth/me` y restaura la sesión
4. Todas las peticiones HTTP incluyen el token automáticamente mediante el interceptor de Axios
5. Si la API devuelve `401`, el usuario es redirigido al login y el token es eliminado

El estado de autenticación se expone globalmente mediante el hook `useAuth()`:

```tsx
const { user, isAuthenticated, isLoading, login, logout, refreshUser } = useAuth();
```

### Control de acceso por rol

El componente `ProtectedRoute` verifica:
1. Que el usuario esté autenticado (sino redirige a `/login`)
2. Que el rol del usuario esté incluido en `allowedRoles` (sino redirige a `/dashboard`)

---

## Variables de entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
VITE_API_URL=http://localhost:3001/api
```

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `VITE_API_URL` | URL base de la API REST del backend | `http://localhost:3001/api` |

---

## Scripts disponibles

```bash
# Iniciar servidor de desarrollo con Hot Module Replacement
npm run dev

# Compilar TypeScript y generar build de producción
npm run build

# Previsualizar el build de producción localmente
npm run preview

# Ejecutar el linter ESLint
npm run lint
```

---

## Despliegue

El proyecto está configurado para desplegarse en **[Netlify](https://www.netlify.com/)**.

El archivo `netlify.toml` define:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

La regla de redirección es necesaria para que React Router DOM maneje correctamente el enrutamiento client-side (SPA) en producción: todas las rutas devuelven `index.html` y el router se encarga del resto.

