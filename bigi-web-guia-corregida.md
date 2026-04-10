# Bigi Web — Guía de desarrollo desde cero (versión corregida)

> Aplicación web de gestión de infraestructura de red con editor 3D, cableado visual y exportación.
> Stack: React + TypeScript · NestJS · PostgreSQL · Three.js · Hosting: IONOS VPS Ubuntu 22.04
>
> ⚠️ Esta guía usa versiones específicas probadas. No actualices sin leer las notas de cada paso.

---

## Índice

- [Fase 01 — Entorno de desarrollo](#fase-01--entorno-de-desarrollo)
- [Fase 02 — Monorepo y estructura](#fase-02--monorepo-y-estructura)
- [Fase 03 — Base de datos con Docker](#fase-03--base-de-datos-con-docker)
- [Fase 04 — Backend: NestJS + Prisma 5 + Auth](#fase-04--backend-nestjs--prisma-5--auth)
- [Fase 05 — Frontend: React + Vite + TailwindCSS](#fase-05--frontend-react--vite--tailwindcss)
- [Fase 06 — Editor 3D con React Three Fiber](#fase-06--editor-3d-con-react-three-fiber)
- [Fase 07 — Sistema de cableado y VLANs](#fase-07--sistema-de-cableado-y-vlans)
- [Fase 08 — Panel de propiedades y capas](#fase-08--panel-de-propiedades-y-capas)
- [Fase 09 — Exportación (PDF, PNG, Excel)](#fase-09--exportación-pdf-png-excel)
- [Fase 10 — Roles de usuario y permisos](#fase-10--roles-de-usuario-y-permisos)
- [Fase 11 — Deploy en IONOS VPS](#fase-11--deploy-en-ionos-vps)
- [Fase 12 — Verificación final y mantenimiento](#fase-12--verificación-final-y-mantenimiento)

---

## Fase 01 — Entorno de desarrollo

> ⏱ Estimación: 1 día

### 1.1 Software a instalar

| Herramienta | Versión exacta | Descarga |
|---|---|---|
| Node.js | **20 LTS** | nodejs.org/en/download |
| npm | 10+ (incluido con Node) | — |
| Git | 2.40+ | git-scm.com |
| Docker Desktop | 4.x | docker.com/products/docker-desktop |
| VS Code | 1.85+ | code.visualstudio.com |

> ⚠️ **Usa Node 20 LTS**, no la versión "Current". NestJS y Prisma 5 tienen mejor compatibilidad con Node 20.

Verifica las versiones instaladas:

```bash
node --version    # debe mostrar v20.x.x
npm --version     # debe mostrar 10.x.x
docker --version  # debe mostrar Docker version 24.x o superior
```

### 1.2 Extensiones de VS Code recomendadas

Instálalas desde el panel de extensiones (`Ctrl+Shift+X`):

- `prisma.prisma` — resaltado de sintaxis para schema.prisma
- `dbaeumer.vscode-eslint` — ESLint
- `esbenp.prettier-vscode` — Prettier
- `bradlc.vscode-tailwindcss` — Tailwind CSS IntelliSense
- `rangav.vscode-thunder-client` — para probar la API REST sin salir de VS Code
- `eamodio.gitlens` — GitLens

---

## Fase 02 — Monorepo y estructura

> ⏱ Estimación: 1–2 horas

### 2.1 Crear la carpeta raíz e inicializar Git

```bash
mkdir bigi-web && cd bigi-web
git init
```

### 2.2 Crear el frontend con Vite

```bash
npm create vite@latest frontend -- --template react-ts
```

### 2.3 Crear el backend con NestJS CLI

> ⚠️ Usa `@nestjs/cli` con `npx` para no instalarlo globalmente y evitar conflictos de versiones.

```bash
npx @nestjs/cli new backend --package-manager npm
```

Cuando pregunte el gestor de paquetes, selecciona `npm`.

### 2.4 Crear carpeta de tipos compartidos

```bash
mkdir -p shared/types
```

### 2.5 Crear .gitignore en la raíz

Crea el archivo `bigi-web/.gitignore` con este contenido:

```
node_modules
.env
.env.local
dist
.DS_Store
```

### 2.6 Estructura final

```
bigi-web/
├── frontend/          ← Vite + React + TypeScript
│   └── src/
├── backend/           ← NestJS
│   └── src/
├── shared/
│   └── types/         ← Interfaces TypeScript comunes
├── docker-compose.yml
└── .gitignore
```

---

## Fase 03 — Base de datos con Docker

> ⏱ Estimación: 30 minutos

### 3.1 Crear docker-compose.yml

En la raíz `bigi-web/` crea el archivo `docker-compose.yml`:

```yaml
version: '3.8'
services:
  db:
    image: postgres:16
    container_name: bigi_postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: bigi_web
      POSTGRES_USER: bigi
      POSTGRES_PASSWORD: bigi_local_pass
    ports:
      - '5432:5432'
    volumes:
      - pgdata:/var/lib/postgresql/data
volumes:
  pgdata:
```

> ⚠️ **Importante:** anota bien estos tres valores. El `.env` del backend debe coincidir exactamente:
> - Usuario: `bigi`
> - Contraseña: `bigi_local_pass`
> - Base de datos: `bigi_web`

### 3.2 Arrancar PostgreSQL

```bash
docker compose up -d
```

### 3.3 Verificar que está corriendo

```bash
docker ps
```

Debes ver `bigi_postgres` con status `Up`.

### 3.4 Verificar conexión directa

```bash
docker exec -it bigi_postgres psql -U bigi -d bigi_web
```

Si ves el prompt `bigi_web=#` todo está correcto. Escribe `\q` para salir.

> ⚠️ **Si el contenedor ya existía antes con otras credenciales** y da error de autenticación, borra el volumen y vuelve a crearlo:
> ```bash
> docker compose down -v
> docker compose up -d
> ```
> El flag `-v` borra el volumen con los datos antiguos. Solo hazlo en desarrollo.

---

## Fase 04 — Backend: NestJS + Prisma 5 + Auth

> ⏱ Estimación: 5–7 días

> ⚠️ **Todos los comandos de esta fase se ejecutan dentro de la carpeta `backend/`.**
> Asegúrate siempre de estar ahí antes de ejecutar cualquier comando.
>
> ```bash
> cd backend
> ```

### 4.1 Instalar dependencias — versiones exactas

```bash
# Prisma 5 — NO instales la versión 6 o 7, tienen breaking changes
npm install prisma@5 @prisma/client@5

# Autenticación
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
npm install -D @types/passport-jwt @types/bcrypt

# Subida de archivos
npm install multer
npm install -D @types/multer

# Variables de entorno
npm install @nestjs/config

# Validación de datos
npm install class-validator class-transformer
```

### 4.2 Crear el archivo .env del backend

Crea el archivo `backend/.env` con este contenido exacto:

```env
DATABASE_URL="postgresql://bigi:bigi_local_pass@localhost:5432/bigi_web"
JWT_SECRET="un_secreto_largo_y_aleatorio_minimo_32_caracteres_aqui"
JWT_EXPIRES_IN=7d
PORT=3000
```

> ⚠️ Los valores de `DATABASE_URL` deben coincidir exactamente con los del `docker-compose.yml`.

### 4.3 Inicializar Prisma

```bash
npx prisma init
```

Esto crea `prisma/schema.prisma` y modifica el `.env`.

> ⚠️ **Si tienes un archivo `prisma.config.ts` en la carpeta `backend/`**, bórralo. Es un residuo de Prisma 7 y causa errores con Prisma 5.

### 4.4 Definir el schema de Prisma

Reemplaza **todo** el contenido de `backend/prisma/schema.prisma`:

> ⚠️ Los **enums deben ir antes que los modelos** que los usan. Si los pones al final da error de validación.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ── ENUMS — siempre antes de los modelos ──────────────────

enum UserRole    { ADMIN EDITOR READER }
enum DeviceState { ACTIVE RESERVE BROKEN }
enum DeviceType  { PC SWITCH RACK AP_WIFI PATCH_PANEL SERVER PRINTER }
enum CableType   { CAT6 CAT6A FIBER COAX }

// ── MODELOS ───────────────────────────────────────────────

model User {
  id           String        @id @default(uuid())
  email        String        @unique
  passwordHash String
  name         String
  role         UserRole      @default(READER)
  createdAt    DateTime      @default(now())
  projects     ProjectUser[]
}

model Project {
  id        String        @id @default(uuid())
  name      String
  createdAt DateTime      @default(now())
  floors    Floor[]
  users     ProjectUser[]
}

model ProjectUser {
  projectId String
  userId    String
  role      UserRole
  project   Project  @relation(fields: [projectId], references: [id])
  user      User     @relation(fields: [userId], references: [id])
  @@id([projectId, userId])
}

model Floor {
  id           String   @id @default(uuid())
  projectId    String
  name         String
  order        Int      @default(0)
  floorPlanUrl String?
  project      Project  @relation(fields: [projectId], references: [id])
  devices      Device[]
  cables       Cable[]
}

model Device {
  id         String      @id @default(uuid())
  floorId    String
  name       String
  type       DeviceType
  ip         String?
  mac        String?
  vlan       Int?
  switchPort Int?
  state      DeviceState @default(ACTIVE)
  notes      String?
  posX       Float       @default(0)
  posY       Float       @default(0)
  posZ       Float       @default(0)
  rotation   Float       @default(0)
  floor      Floor       @relation(fields: [floorId], references: [id])
  cablesFrom Cable[]     @relation("CableFrom")
  cablesTo   Cable[]     @relation("CableTo")
}

model Cable {
  id           String    @id @default(uuid())
  floorId      String
  fromDeviceId String
  toDeviceId   String
  cableType    CableType @default(CAT6)
  vlan         Int?
  pathPoints   Json?
  label        String?
  floor        Floor     @relation(fields: [floorId], references: [id])
  fromDevice   Device    @relation("CableFrom", fields: [fromDeviceId], references: [id])
  toDevice     Device    @relation("CableTo", fields: [toDeviceId], references: [id])
}
```

### 4.5 Ejecutar la migración

```bash
npx prisma migrate dev --name init
npx prisma generate
```

Debes ver:
```
✔ Generated Prisma Client
```

### 4.6 Crear el módulo Prisma

> ⚠️ Usa siempre `npx nest g` (no `npx generate`, que es una herramienta diferente y sin relación con NestJS).

```bash
npx nest g module prisma
npx nest g service prisma
```

Reemplaza el contenido de `src/prisma/prisma.service.ts`:

```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

Reemplaza el contenido de `src/prisma/prisma.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],  // ← imprescindible para que otros módulos puedan usarlo
})
export class PrismaModule {}
```

### 4.7 Crear los módulos de Auth y Users

```bash
npx nest g module auth
npx nest g service auth
npx nest g controller auth
npx nest g module users
npx nest g service users
```

### 4.8 Crear el servicio de autenticación

Reemplaza el contenido de `src/auth/auth.service.ts`:

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user: User | null = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) throw new UnauthorizedException('Credenciales incorrectas');

    const valid: boolean = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Credenciales incorrectas');

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwt.sign(payload),
      user,
    };
  }

  async register(email: string, password: string, name: string): Promise<User> {
    const hash: string = await bcrypt.hash(password, 10);
    return this.prisma.user.create({
      data: {
        email,
        passwordHash: hash,
        name,
        role: 'READER',
      },
    });
  }
}
```

### 4.9 Crear el guard de roles

Crea el archivo `src/auth/roles.guard.ts`:

```typescript
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

interface RequestUser {
  role: string;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.get<string[]>('roles', context.getHandler());
    if (!required) return true;

    const { user } = context.switchToHttp().getRequest<{ user: RequestUser }>();
    return required.includes(user.role);
  }
}
```

### 4.10 Crear el decorador de roles

Crea el archivo `src/auth/roles.decorator.ts`:

```typescript
import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
```

### 4.11 Crear el controlador de auth

Reemplaza el contenido de `src/auth/auth.controller.ts`:

```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

class LoginDto {
  email!: string;
  password!: string;
}

class RegisterDto {
  email!: string;
  password!: string;
  name!: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.email, dto.password, dto.name);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }
}
```

> ⚠️ Las propiedades de las clases DTO deben llevar `!` (por ejemplo `email!: string`) porque TypeScript en modo estricto exige que las propiedades estén inicializadas en el constructor. El `!` le indica que el valor llegará desde fuera.

### 4.12 Configurar el módulo de auth

Reemplaza el contenido de `src/auth/auth.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },  // string literal, no leer del .env aquí
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
```

### 4.13 Registrar los módulos en AppModule

Reemplaza el contenido de `src/app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
  ],
})
export class AppModule {}
```

### 4.14 Arrancar el servidor y probar

```bash
npm run start:dev
```

Debes ver en la terminal:
```
[NestJS] Application is running on: http://localhost:3000
```

**Prueba con Thunder Client:**

Registrar usuario — `POST http://localhost:3000/auth/register`:
```json
{
  "email": "admin@bigi.com",
  "password": "123456",
  "name": "Administrador"
}
```

Login — `POST http://localhost:3000/auth/login`:
```json
{
  "email": "admin@bigi.com",
  "password": "123456"
}
```

La respuesta del login debe devolver un `access_token`. Guárdalo, lo necesitarás para los siguientes endpoints.

---

## Fase 05 — Frontend: React + Vite + TailwindCSS

> ⏱ Estimación: 3–4 días

> ⚠️ **Todos los comandos de esta fase se ejecutan dentro de la carpeta `frontend/`.**
>
> ```bash
> cd frontend
> ```

### 5.1 Instalar dependencias

```bash
# UI y estilos
npm install tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p

# Estado global y peticiones HTTP
npm install zustand @tanstack/react-query axios

# Router
npm install react-router-dom

# Formularios
npm install react-hook-form

# Iconos
npm install lucide-react

# Tipos
npm install -D @types/react @types/react-dom
```

### 5.2 Configurar Tailwind

Reemplaza el contenido de `frontend/tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'bigi-blue': '#1A5FA8',
        'bigi-teal': '#0F6E56',
        'bigi-dark': '#1C1C2E',
      },
    },
  },
  plugins: [],
}
```

Añade las directivas de Tailwind al inicio de `frontend/src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 5.3 Crear el archivo .env del frontend

Crea `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000
```

### 5.4 Estructura de carpetas del frontend

Crea manualmente esta estructura dentro de `frontend/src/`:

```
frontend/src/
├── components/
│   ├── Editor3D/         ← Canvas Three.js
│   ├── Sidebar/          ← Panel propiedades + capas
│   ├── Toolbar/          ← Barra inferior de acciones
│   ├── FloorTabs/        ← Selector de plantas
│   └── UI/               ← Componentes reutilizables
├── pages/
│   ├── LoginPage.tsx
│   ├── ProjectsPage.tsx
│   └── EditorPage.tsx
├── stores/
│   ├── useEditorStore.ts
│   └── useAuthStore.ts
├── hooks/
│   ├── useDevices.ts
│   └── useCables.ts
├── api/
│   └── client.ts
└── types/
    └── index.ts
```

### 5.5 Cliente Axios con interceptor JWT

Crea `frontend/src/api/client.ts`:

```typescript
import axios from 'axios';
import { useAuthStore } from '../stores/useAuthStore';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

### 5.6 Store de autenticación

Crea `frontend/src/stores/useAuthStore.ts`:

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthUser {
  id: string;
  name: string;
  role: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  setAuth: (token: string, user: AuthUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    { name: 'bigi-auth' }
  )
);
```

### 5.7 Store del editor

Crea `frontend/src/stores/useEditorStore.ts`:

```typescript
import { create } from 'zustand';

type EditorMode = 'select' | 'move' | 'cable' | 'rotate';

interface EditorState {
  mode: EditorMode;
  selectedDeviceId: string | null;
  cableOriginId: string | null;
  layers: {
    cabling: boolean;
    devices: boolean;
    racks: boolean;
  };
  activeFloorId: string | null;
  setMode: (mode: EditorMode) => void;
  selectDevice: (id: string | null) => void;
  setCableOrigin: (id: string | null) => void;
  toggleLayer: (layer: keyof EditorState['layers']) => void;
  setActiveFloor: (id: string) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  mode: 'select',
  selectedDeviceId: null,
  cableOriginId: null,
  layers: { cabling: true, devices: true, racks: true },
  activeFloorId: null,
  setMode: (mode) => set({ mode }),
  selectDevice: (id) => set({ selectedDeviceId: id }),
  setCableOrigin: (id) => set({ cableOriginId: id }),
  toggleLayer: (layer) =>
    set((s) => ({ layers: { ...s.layers, [layer]: !s.layers[layer] } })),
  setActiveFloor: (id) => set({ activeFloorId: id }),
}));
```

### 5.8 Página de login

Crea `frontend/src/pages/LoginPage.tsx`:

```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuthStore } from '../stores/useAuthStore';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setAuth(data.access_token, data.user);
      navigate('/projects');
    } catch {
      setError('Credenciales incorrectas');
    }
  };

  return (
    <div className="min-h-screen bg-bigi-dark flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm flex flex-col gap-4"
      >
        <h1 className="text-2xl font-bold text-bigi-blue text-center">Bigi Web</h1>
        <p className="text-sm text-gray-500 text-center">Gestión de infraestructura de red</p>

        {error && (
          <p className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</p>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bigi-blue"
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bigi-blue"
          required
        />
        <button
          type="submit"
          className="bg-bigi-blue text-white rounded-lg py-2 font-medium hover:bg-blue-700 transition"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
```

### 5.9 Componente ProtectedRoute

Crea `frontend/src/components/UI/ProtectedRoute.tsx`:

```tsx
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';

interface Props {
  children: React.ReactNode;
  requiredRole?: 'ADMIN' | 'EDITOR' | 'READER';
}

export function ProtectedRoute({ children, requiredRole }: Props) {
  const { token, user } = useAuthStore();

  if (!token) return <Navigate to="/login" replace />;

  if (requiredRole && user?.role !== 'ADMIN' && user?.role !== requiredRole) {
    return <Navigate to="/no-access" replace />;
  }

  return <>{children}</>;
}
```

### 5.10 Configurar el router principal

Reemplaza el contenido de `frontend/src/main.tsx`:

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginPage } from './pages/LoginPage';
import { ProtectedRoute } from './components/UI/ProtectedRoute';
import './index.css';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          {/* Las rutas protegidas se añaden aquí en fases posteriores */}
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
```

### 5.11 Arrancar el frontend

```bash
npm run dev
```

Abre `http://localhost:5173` — debes ver la pantalla de login.

---

## Fase 06 — Editor 3D con React Three Fiber

> ⏱ Estimación: 7–10 días

> ⚠️ **Esta es la fase más compleja del proyecto.** Lee la documentación de React Three Fiber en [docs.pmnd.rs](https://docs.pmnd.rs) antes de empezar. No te saltes este paso.

### 6.1 Instalar librerías 3D

```bash
# Dentro de frontend/
npm install three @react-three/fiber @react-three/drei
npm install -D @types/three
```

### 6.2 Componente principal del editor

Crea `frontend/src/components/Editor3D/Editor3D.tsx`:

```tsx
import { Canvas } from '@react-three/fiber';
import { OrthographicCamera, OrbitControls, Grid } from '@react-three/drei';

export function Editor3D() {
  return (
    <div className="w-full h-full">
      <Canvas shadows>
        {/* Cámara ortográfica — produce el efecto isométrico de la captura */}
        <OrthographicCamera
          makeDefault
          position={[15, 15, 15]}
          zoom={60}
          near={0.1}
          far={500}
        />
        {/* Controles: zoom y paneo sí, rotación libre no */}
        <OrbitControls
          enableRotate={false}
          enableZoom={true}
          enablePan={true}
        />
        {/* Iluminación */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 20, 10]} intensity={1} castShadow />
        {/* Suelo y cuadrícula */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial color="#2a2a3e" />
        </mesh>
        <Grid
          args={[50, 50]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#3a3a5e"
          sectionSize={5}
        />
      </Canvas>
    </div>
  );
}
```

### 6.3 Helpers de dispositivos

Crea `frontend/src/components/Editor3D/deviceHelpers.ts`:

```typescript
export type DeviceType =
  | 'PC' | 'SWITCH' | 'RACK' | 'AP_WIFI'
  | 'PATCH_PANEL' | 'SERVER' | 'PRINTER';

export function getDeviceSize(type: DeviceType): [number, number, number] {
  const sizes: Record<DeviceType, [number, number, number]> = {
    PC:          [0.8, 0.5, 0.8],
    SWITCH:      [2.0, 0.2, 0.8],
    RACK:        [1.0, 2.0, 0.6],
    AP_WIFI:     [0.6, 0.1, 0.6],
    PATCH_PANEL: [2.0, 0.15, 0.5],
    SERVER:      [0.8, 1.8, 0.6],
    PRINTER:     [1.0, 0.6, 0.8],
  };
  return sizes[type] ?? [0.8, 0.8, 0.8];
}

export function getDeviceColor(type: DeviceType): string {
  const colors: Record<DeviceType, string> = {
    PC:          '#4A90D9',
    SWITCH:      '#2C7A4B',
    RACK:        '#1C1C2E',
    AP_WIFI:     '#F5A623',
    PATCH_PANEL: '#7B68EE',
    SERVER:      '#555555',
    PRINTER:     '#888888',
  };
  return colors[type] ?? '#AAAAAA';
}
```

### 6.4 Componente de dispositivo

Crea `frontend/src/components/Editor3D/DeviceModel.tsx`:

```tsx
import { useRef } from 'react';
import { useCursor, TransformControls } from '@react-three/drei';
import { useEditorStore } from '../../stores/useEditorStore';
import { getDeviceSize, getDeviceColor, DeviceType } from './deviceHelpers';
import type { Mesh } from 'three';

interface Device {
  id: string;
  name: string;
  type: DeviceType;
  posX: number;
  posY: number;
  posZ: number;
  rotation: number;
}

interface Props {
  device: Device;
  onMove?: (id: string, x: number, y: number, z: number) => void;
}

export function DeviceModel({ device, onMove }: Props) {
  const ref = useRef<Mesh>(null);
  const { mode, selectedDeviceId, selectDevice } = useEditorStore();
  const isSelected = selectedDeviceId === device.id;

  useCursor(mode === 'select');

  return (
    <>
      <mesh
        ref={ref}
        position={[device.posX, device.posY + getDeviceSize(device.type)[1] / 2, device.posZ]}
        rotation={[0, device.rotation, 0]}
        onClick={(e) => {
          e.stopPropagation();
          selectDevice(device.id);
        }}
        castShadow
      >
        <boxGeometry args={getDeviceSize(device.type)} />
        <meshStandardMaterial
          color={isSelected ? '#FFD700' : getDeviceColor(device.type)}
          emissive={isSelected ? '#FFD700' : '#000000'}
          emissiveIntensity={isSelected ? 0.2 : 0}
        />
      </mesh>

      {isSelected && mode === 'move' && ref.current && (
        <TransformControls
          object={ref.current}
          mode="translate"
          onMouseUp={() => {
            if (ref.current && onMove) {
              const pos = ref.current.position;
              onMove(device.id, pos.x, pos.y, pos.z);
            }
          }}
        />
      )}

      {isSelected && mode === 'rotate' && ref.current && (
        <TransformControls
          object={ref.current}
          mode="rotate"
        />
      )}
    </>
  );
}
```

---

## Fase 07 — Sistema de cableado y VLANs

> ⏱ Estimación: 5–6 días

### 7.1 Colores por VLAN

| VLAN | Color | Hex | Uso típico |
|---|---|---|---|
| 10 | Azul | `#2196F3` | Usuarios / PCs |
| 20 | Verde | `#4CAF50` | Servidores |
| 30 | Rojo | `#F44336` | Gestión / admin |
| 40 | Naranja | `#FF9800` | VoIP |
| 50 | Morado | `#9C27B0` | DMZ / invitados |
| 99 | Gris | `#607D8B` | Sin asignar |

### 7.2 Componente de cable

Crea `frontend/src/components/Editor3D/CableLine.tsx`:

```tsx
import { useMemo } from 'react';
import * as THREE from 'three';

const VLAN_COLORS: Record<number, string> = {
  10: '#2196F3',
  20: '#4CAF50',
  30: '#F44336',
  40: '#FF9800',
  50: '#9C27B0',
};

interface PathPoint { x: number; z: number; }

interface CableProps {
  fromPos: { x: number; z: number };
  toPos:   { x: number; z: number };
  vlan?:   number;
  pathPoints?: PathPoint[];
}

export function CableLine({ fromPos, toPos, vlan, pathPoints = [] }: CableProps) {
  const points = useMemo(() => {
    const all = [
      new THREE.Vector3(fromPos.x, 0.05, fromPos.z),
      ...pathPoints.map((p) => new THREE.Vector3(p.x, 0.05, p.z)),
      new THREE.Vector3(toPos.x, 0.05, toPos.z),
    ];

    if (pathPoints.length > 0) {
      const curve = new THREE.CatmullRomCurve3(all);
      return curve.getPoints(50);
    }
    return all;
  }, [fromPos, toPos, pathPoints]);

  const geometry = useMemo(
    () => new THREE.BufferGeometry().setFromPoints(points),
    [points]
  );

  const color = VLAN_COLORS[vlan ?? 99] ?? '#607D8B';

  return (
    <line geometry={geometry}>
      <lineBasicMaterial color={color} linewidth={2} />
    </line>
  );
}
```

### 7.3 Flujo de creación de cable en la UI

El flujo tiene estos pasos en el store y la UI:

1. Usuario hace clic en **"Crear Cableado"** → `setMode('cable')`
2. Clic en dispositivo origen → `setCableOrigin(device.id)`
3. Clic en dispositivo destino → llamada a `POST /floors/:id/cables` con ambos IDs
4. El cable aparece en el canvas inmediatamente
5. Clic en un punto del cable → se puede arrastrar para curvar el spline

---

## Fase 08 — Panel de propiedades y capas

> ⏱ Estimación: 3–4 días

### 8.1 Panel de propiedades del dispositivo

Crea `frontend/src/components/Sidebar/DeviceProperties.tsx`:

```tsx
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';

interface Device {
  id: string;
  name: string;
  ip?: string;
  mac?: string;
  vlan?: number;
  switchPort?: number;
  state: 'ACTIVE' | 'RESERVE' | 'BROKEN';
  notes?: string;
}

export function DeviceProperties({ device }: { device: Device }) {
  const queryClient = useQueryClient();
  const { register, handleSubmit } = useForm<Device>({ defaultValues: device });

  const update = useMutation({
    mutationFn: (data: Partial<Device>) =>
      api.patch(`/devices/${device.id}`, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['devices'] }),
  });

  return (
    <form
      onSubmit={handleSubmit((d) => update.mutate(d))}
      className="flex flex-col gap-3 p-4 text-sm"
    >
      <h2 className="font-bold text-base text-bigi-blue">Editar Dispositivo</h2>

      <label className="font-medium">Nombre</label>
      <input {...register('name')} className="border rounded px-2 py-1" />

      <label className="font-medium">IP</label>
      <input {...register('ip')} placeholder="192.168.1.x" className="border rounded px-2 py-1" />

      <label className="font-medium">MAC</label>
      <input {...register('mac')} placeholder="00:1A:2B:3C:4D:5E" className="border rounded px-2 py-1" />

      <label className="font-medium">VLAN</label>
      <input {...register('vlan', { valueAsNumber: true })} type="number" min={1} max={4094} className="border rounded px-2 py-1" />

      <label className="font-medium">Puerto Switch</label>
      <input {...register('switchPort', { valueAsNumber: true })} type="number" min={1} max={48} className="border rounded px-2 py-1" />

      <label className="font-medium">Estado</label>
      <select {...register('state')} className="border rounded px-2 py-1">
        <option value="ACTIVE">Activo</option>
        <option value="RESERVE">Reserva</option>
        <option value="BROKEN">Averiado</option>
      </select>

      <label className="font-medium">Observaciones</label>
      <textarea {...register('notes')} rows={3} className="border rounded px-2 py-1 resize-none" />

      <button
        type="submit"
        className="bg-bigi-blue text-white rounded py-1.5 font-medium hover:bg-blue-700 transition mt-1"
      >
        Guardar cambios
      </button>
    </form>
  );
}
```

### 8.2 Control de capas

Crea `frontend/src/components/Sidebar/LayerControl.tsx`:

```tsx
import { useEditorStore } from '../../stores/useEditorStore';

export function LayerControl() {
  const { layers, toggleLayer } = useEditorStore();

  const items = [
    { key: 'cabling' as const, label: 'Cableado' },
    { key: 'devices' as const, label: 'Equipos' },
    { key: 'racks'   as const, label: 'Racks' },
  ];

  return (
    <div className="p-4 border-t">
      <h3 className="font-bold mb-2 text-xs uppercase tracking-wider text-gray-500">
        Mostrar capas
      </h3>
      {items.map(({ key, label }) => (
        <label key={key} className="flex items-center gap-2 mb-1 cursor-pointer">
          <input
            type="checkbox"
            checked={layers[key]}
            onChange={() => toggleLayer(key)}
            className="accent-bigi-blue"
          />
          <span className="text-sm">{label}</span>
        </label>
      ))}
    </div>
  );
}
```

---

## Fase 09 — Exportación (PDF, PNG, Excel)

> ⏱ Estimación: 3–4 días

### 9.1 Instalar librerías

```bash
# Dentro de frontend/
npm install jspdf html2canvas exceljs
```

### 9.2 Exportar PNG

Crea `frontend/src/utils/export/exportPNG.ts`:

```typescript
import { useThree } from '@react-three/fiber';

export function useExportPNG() {
  const { gl } = useThree();

  return (filename = 'plano-red') => {
    // Forzar un render antes de capturar
    gl.render(gl.domElement as any, null as any);
    const canvas = gl.domElement;
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
  };
}
```

### 9.3 Exportar PDF

Crea `frontend/src/utils/export/exportPDF.ts`:

```typescript
import jsPDF from 'jspdf';

export async function exportPDF(
  canvasElement: HTMLCanvasElement,
  projectName: string
) {
  const imgData = canvasElement.toDataURL('image/png', 1.0);
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  // Cabecera
  pdf.setFontSize(14);
  pdf.setTextColor(26, 95, 168);
  pdf.text(`Bigi Web — ${projectName}`, 10, 12);

  pdf.setFontSize(9);
  pdf.setTextColor(120);
  pdf.text(
    `Exportado: ${new Date().toLocaleDateString('es-ES')}`,
    pageW - 60,
    12
  );

  pdf.setDrawColor(26, 95, 168);
  pdf.line(10, 15, pageW - 10, 15);

  // Imagen del canvas 3D
  pdf.addImage(imgData, 'PNG', 10, 20, pageW - 20, pageH - 30);

  pdf.save(`${projectName}-plano.pdf`);
}
```

### 9.4 Exportar Excel

Crea `frontend/src/utils/export/exportExcel.ts`:

```typescript
import ExcelJS from 'exceljs';

interface Device {
  name: string;
  type: string;
  ip?: string;
  mac?: string;
  vlan?: number;
  switchPort?: number;
  state: string;
  notes?: string;
}

export async function exportExcel(devices: Device[], projectName: string) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Bigi Web';
  wb.created = new Date();

  const ws = wb.addWorksheet('Inventario');

  ws.columns = [
    { header: 'Nombre',        key: 'name',       width: 22 },
    { header: 'Tipo',          key: 'type',       width: 14 },
    { header: 'IP',            key: 'ip',         width: 16 },
    { header: 'MAC',           key: 'mac',        width: 20 },
    { header: 'VLAN',          key: 'vlan',       width: 8  },
    { header: 'Puerto Switch', key: 'switchPort', width: 14 },
    { header: 'Estado',        key: 'state',      width: 12 },
    { header: 'Observaciones', key: 'notes',      width: 35 },
  ];

  // Estilo de cabecera
  ws.getRow(1).eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1A5FA8' },
    };
    cell.font  = { color: { argb: 'FFFFFFFF' }, bold: true };
    cell.border = {
      bottom: { style: 'medium', color: { argb: 'FF0F6E56' } },
    };
  });

  // Filas con color alternado
  devices.forEach((d, i) => {
    const row = ws.addRow(d);
    if (i % 2 === 0) {
      row.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF4F4F2' },
        };
      });
    }
  });

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${projectName}-inventario.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}
```

---

## Fase 10 — Roles de usuario y permisos

> ⏱ Estimación: 2–3 días

### 10.1 Tabla de permisos

| Acción | Admin | Editor | Solo lectura |
|---|:---:|:---:|:---:|
| Ver proyectos | ✓ | ✓ | ✓ |
| Crear proyecto | ✓ | ✗ | ✗ |
| Añadir dispositivos | ✓ | ✓ | ✗ |
| Editar propiedades | ✓ | ✓ | ✗ |
| Eliminar dispositivos | ✓ | ✗ | ✗ |
| Crear cableado | ✓ | ✓ | ✗ |
| Exportar datos | ✓ | ✓ | ✓ |
| Gestionar usuarios | ✓ | ✗ | ✗ |

### 10.2 Hook de permisos

Crea `frontend/src/hooks/usePermissions.ts`:

```typescript
import { useAuthStore } from '../stores/useAuthStore';

export function usePermissions() {
  const role = useAuthStore((s) => s.user?.role);
  return {
    canEdit:        role === 'ADMIN' || role === 'EDITOR',
    canDelete:      role === 'ADMIN',
    canManageUsers: role === 'ADMIN',
    canExport:      true,
  };
}

// Uso en cualquier componente:
// const { canEdit, canDelete } = usePermissions();
// {canEdit && <button>Editar</button>}
// {canDelete && <button>Eliminar</button>}
```

---

## Fase 11 — Deploy en IONOS VPS

> ⏱ Estimación: 3–5 días

> ⚠️ **Prerequisitos:**
> - VPS en IONOS con Ubuntu 22.04 LTS
> - Acceso SSH como root
> - Un dominio apuntando a la IP del VPS

### 11.1 Especificaciones del VPS recomendadas

| Recurso | Mínimo | Recomendado |
|---|---|---|
| CPU | 2 vCPU | 4 vCPU |
| RAM | 2 GB | 4 GB |
| Disco | 20 GB SSD | 40 GB SSD |
| OS | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |

### 11.2 Preparar el servidor

```bash
ssh root@IP_DEL_VPS

# Actualizar sistema
apt update && apt upgrade -y

# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# PostgreSQL 16
apt install -y postgresql postgresql-contrib

# Nginx
apt install -y nginx

# PM2
npm install -g pm2

# SSL
apt install -y certbot python3-certbot-nginx
```

### 11.3 Configurar PostgreSQL en producción

```bash
sudo -u postgres psql
```

```sql
CREATE DATABASE bigi_web;
CREATE USER bigi_prod WITH PASSWORD 'contraseña_segura_aqui';
GRANT ALL PRIVILEGES ON DATABASE bigi_web TO bigi_prod;
\q
```

### 11.4 Desplegar el backend

```bash
cd /var/www
git clone https://github.com/tuusuario/bigi-web.git
cd bigi-web/backend

cat > .env << EOF
DATABASE_URL="postgresql://bigi_prod:contraseña_segura_aqui@localhost:5432/bigi_web"
JWT_SECRET="secreto_produccion_muy_largo_minimo_32_caracteres"
PORT=3000
EOF

npm install
npx prisma migrate deploy
npm run build

pm2 start dist/main.js --name bigi-backend
pm2 save
pm2 startup
```

### 11.5 Desplegar el frontend

```bash
cd /var/www/bigi-web/frontend

echo 'VITE_API_URL="https://tudominio.com/api"' > .env.production

npm install
npm run build
```

### 11.6 Configurar Nginx

Crea `/etc/nginx/sites-available/bigi-web`:

```nginx
server {
    listen 80;
    server_name tudominio.com www.tudominio.com;

    root /var/www/bigi-web/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        rewrite ^/api(.*) $1 break;
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }

    client_max_body_size 50M;
}
```

```bash
ln -s /etc/nginx/sites-available/bigi-web /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

certbot --nginx -d tudominio.com -d www.tudominio.com
```

### 11.7 Backup automático

```bash
cat > /root/backup_db.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
PGPASSWORD="contraseña_segura_aqui" pg_dump -U bigi_prod bigi_web \
  > /var/backups/bigi_$DATE.sql
ls -t /var/backups/bigi_*.sql | tail -n +8 | xargs rm -f
EOF

chmod +x /root/backup_db.sh

# Crontab — cada día a las 2:00 AM
# Ejecuta: crontab -e
# Añade: 0 2 * * * /root/backup_db.sh
```

---

## Fase 12 — Verificación final y mantenimiento

> ⏱ Estimación: 1–2 días

### 12.1 Checklist de verificación

- [ ] Abrir `https://tudominio.com` — carga la página de login
- [ ] Registrar usuario de prueba y hacer login
- [ ] Crear un proyecto nuevo
- [ ] Subir un plano base (imagen PNG)
- [ ] Añadir al menos 3 dispositivos distintos (PC, switch, rack)
- [ ] Crear cables entre dispositivos con diferentes VLANs
- [ ] Editar propiedades de un dispositivo (IP, MAC, estado)
- [ ] Activar y desactivar cada capa (cableado, equipos, racks)
- [ ] Exportar el plano en PDF
- [ ] Exportar el inventario en Excel
- [ ] Probar con usuario tipo `editor` — no debe poder borrar
- [ ] Probar con usuario tipo `reader` — solo lectura
- [ ] Verificar SSL activo (candado en el navegador)
- [ ] Reiniciar el VPS y comprobar que PM2 arranca solo: `sudo reboot`

### 12.2 Comandos de mantenimiento

| Acción | Comando |
|---|---|
| Ver logs del backend | `pm2 logs bigi-backend` |
| Reiniciar backend | `pm2 restart bigi-backend` |
| Estado procesos | `pm2 status` |
| Actualizar backend | `cd /var/www/bigi-web/backend && git pull && npm run build && pm2 restart bigi-backend` |
| Actualizar frontend | `cd /var/www/bigi-web/frontend && git pull && npm run build` |
| Reiniciar Nginx | `systemctl reload nginx` |
| Logs de Nginx | `tail -f /var/log/nginx/error.log` |
| Backup manual | `/root/backup_db.sh` |
| Espacio en disco | `df -h` |
| Uso de RAM | `free -h` |

### 12.3 Resumen de tiempos

| Fase | Descripción | Solo | Equipo (2 pers.) |
|---|---|---|---|
| 01–03 | Entorno + monorepo + BD | 2–3 días | 1 día |
| 04 | Backend + Auth + Prisma 5 | 5–7 días | 3–4 días |
| 05 | Frontend base | 3–4 días | 2 días |
| 06 | Editor 3D | 7–10 días | 4–5 días |
| 07 | Cableado y VLANs | 5–6 días | 3 días |
| 08 | Panel propiedades + capas | 3–4 días | 2 días |
| 09 | Exportación | 3–4 días | 2 días |
| 10 | Roles y permisos | 2–3 días | 1–2 días |
| 11 | Deploy IONOS | 3–5 días | 2–3 días |
| 12 | Verificación | 1–2 días | 1 día |
| **Total** | | **10–14 semanas** | **5–7 semanas** |

---

## Errores comunes y soluciones

| Error | Causa | Solución |
|---|---|---|
| `P1000 Authentication failed` | Las credenciales del `.env` no coinciden con el Docker | Igualar usuario/contraseña en `.env` y `docker-compose.yml`, luego `docker compose down -v && docker compose up -d` |
| `P1012 url is no longer supported` | Prisma 7 instalado en lugar de Prisma 5 | `npm install prisma@5 @prisma/client@5` y borrar `prisma.config.ts` |
| `Type UserRole is not an enum` | Los enums están declarados después de los modelos | Mover todos los `enum` al principio del `schema.prisma`, antes de los `model` |
| `Cannot find module prisma/prisma.service` | El `PrismaModule` no está importado en el módulo que lo usa | Añadir `PrismaModule` al array `imports` del módulo correspondiente |
| `Property has no initializer` | TypeScript en modo estricto en clases DTO | Añadir `!` después del nombre de la propiedad: `email!: string` |
| `npx generate service auth` falla | Comando incorrecto — `generate` es otra herramienta | Usar `npx nest g service auth` |
| `npm run start:dev` falla con ENOENT | Ejecutado en la carpeta raíz en vez de en `backend/` | `cd backend` antes de ejecutar comandos de NestJS |

---

*Bigi Web — Guía corregida con versiones probadas · Prisma 5 · NestJS 10 · React 18 · Three.js r3f*
