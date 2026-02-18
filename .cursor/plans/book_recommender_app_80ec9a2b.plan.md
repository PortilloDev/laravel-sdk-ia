---
name: Book Recommender App
overview: Transformar la aplicación en un recomendador de libros con landing pública, autenticación con login social preparado, onboarding de preferencias al registrarse, y una interfaz de recomendaciones con IA personalizada.
todos:
  - id: migration
    content: Crear migración para añadir book_preferences a users
    status: completed
  - id: user-model
    content: "Actualizar User model: fillable + cast book_preferences"
    status: completed
  - id: onboarding-controller
    content: Crear OnboardingController y OnboardingRequest
    status: completed
  - id: middleware
    content: Crear EnsureOnboardingComplete middleware y registrar en bootstrap/app.php
    status: completed
  - id: librarian-agent
    content: Actualizar LibrarianAgent para aceptar y usar userPreferences
    status: completed
  - id: recommendation-controller
    content: Crear RecommendationController
    status: completed
  - id: routes
    content: Actualizar routes/web.php con nuevas rutas
    status: completed
  - id: welcome-page
    content: Rediseñar pages/welcome.tsx como landing del recomendador
    status: completed
  - id: onboarding-page
    content: Crear pages/onboarding.tsx con selector de géneros
    status: completed
  - id: dashboard-page
    content: Rediseñar pages/dashboard.tsx como interfaz de recomendaciones
    status: completed
  - id: auth-social
    content: Añadir botones de login social placeholder en login.tsx y register.tsx
    status: completed
  - id: tests
    content: Crear OnboardingTest y RecommendationTest y ejecutarlos
    status: completed
isProject: false
---

# Book Recommender App

## Arquitectura del flujo

```mermaid
flowchart TD
    Landing["/ Landing pública"] --> Login["auth/login"]
    Landing --> Register["auth/register"]
    Login -->|"auth OK"| CheckOnboarding{"¿preferences?"}
    Register -->|"Fortify redirect"| CheckOnboarding
    CheckOnboarding -->|"null"| Onboarding["/onboarding"]
    CheckOnboarding -->|"completadas"| Dashboard["/dashboard (recomendador)"]
    Onboarding -->|"guardar"| Dashboard
```



## Cambios en Base de Datos

- **Nueva migración**: añadir columna `book_preferences` (nullable JSON) a `users`
- `**User` model** ([app/Models/User.php](app/Models/User.php)): añadir `book_preferences` a `$fillable` y cast `array`

## Backend

- `**OnboardingController**` (nuevo): `show()` renderiza el formulario, `store()` guarda preferencias y redirige a `/dashboard`
- `**OnboardingRequest**` (nuevo): valida que `genres` sea array con al menos 1 ítem y que `notes` sea string opcional
- `**EnsureOnboardingComplete` middleware** (nuevo): en rutas `auth`, si `book_preferences === null` redirige a `/onboarding`. Exime a `/onboarding` y `/settings/*`
- `**bootstrap/app.php**`: registrar el middleware como alias `onboarding`
- `**LibrarianAgent**` ([app/Ai/Agents/LibrarianAgent.php](app/Ai/Agents/LibrarianAgent.php)): añadir propiedad `$userPreferences` (array) usada en las instrucciones del agente para personalizar recomendaciones
- `**RecommendationController**` (nuevo): recibe el query del usuario, construye el prompt con sus preferencias y llama al `LibrarianAgent`
- `**routes/web.php**` ([routes/web.php](routes/web.php)): añadir rutas `/onboarding` (GET/POST con `auth` + `onboarding`), actualizar `/dashboard` para renderizar el recomendador, añadir `/recommendations` (POST, auth)

## Frontend

- `**pages/welcome.tsx**` — Landing moderna con: hero con CTA, sección de características (IA, personalización, búsqueda vectorial), y nav con login/registro. Diseño limpio con tipografía grande y paleta dark/light
- `**pages/onboarding.tsx**` — Formulario de preferencias: grid de tarjetas clickables para géneros (Ciencia Ficción, Fantasía, Misterio, Romance, Historia, Thriller, Terror, Clásicos...) + campo de texto libre para matices. Solo accesible tras login
- `**pages/dashboard.tsx**` — Interfaz del recomendador: campo de búsqueda semántica, botón "Recomendar", cards de resultado con título/autor/descripción/motivo. Estado de carga animado mientras espera la IA
- `**pages/auth/login.tsx**` ([resources/js/pages/auth/login.tsx](resources/js/pages/auth/login.tsx)) — Añadir separador "O continuar con" y botones de Google/GitHub como placeholders (links deshabilitados con tooltip "Próximamente")
- `**pages/auth/register.tsx**` — Igual que login, con botones sociales placeholder

## Tests

- `**tests/Feature/OnboardingTest.php**`: verifica que usuario sin preferencias es redirigido, que el formulario guarda correctamente y redirige al dashboard
- `**tests/Feature/RecommendationTest.php**`: verifica que el endpoint de recomendaciones requiere auth y que el formato de respuesta es correcto

## Notas

- El login social (Socialite) queda preparado a nivel UI con botones placeholder. La integración real requiere añadir `laravel/socialite` (necesita aprobación)
- El `Book` model no necesita cambios; el seeder tampoco
- `History` model queda sin cambios por ahora

