# Laboratorio 6 - React for Blueprints

**Realizado por**

Juan Carlos Leal

Sebastián Villarraga

## **Inicio. Requerimientos para Empezar**
Para tener en cuenta, revisar el sigueinte repo:

[ARSW_Lab5_Security (Backend)](https://github.com/JuanLeal1105/ARSW_Lab5_BluePrints_Security)
### **CORS Config. ¿Funcionan las Requests a la API desde el front?**
Por defecto, los navegadores web implementan una medida de seguridad llamada Política del Mismo Origen (Same-Origin Policy). Esta política bloquea las peticiones HTTP realizadas desde un origen (en nuestro caso, el frontend de React ejecutándose en `http://localhost:5173`) hacia un origen distinto (nuestro backend en Spring Boot ejecutándose en `http://localhost:8080`).

Dado que nuestra arquitectura separa el cliente del servidor, fue estrictamente necesario habilitar y configurar CORS en la clase `SecurityConfig` del backend. Esto le indica al navegador que confíe en las peticiones entrantes desde nuestro frontend, permitiendo además el envío de credenciales y encabezados de autorización (necesarios para los tokens JWT).

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    // Se permite explícitamente el origen del frontend
    configuration.setAllowedOrigins(List.of("http://localhost:5173")); 
    // ...
}
```

### **Docker y Backend con SpringBoot**
Es necesrio para el funcionamiento del front que el backend esté corriendo antes de iniciar cualquier operación con el front y de igual forma la base de datos que se creo de PostgreSQL haciendo uso de docker debe de estar corriendo, de tal forma que para ello se usa el sigueinte comando:
```bash
docker compose up -d
```

Lo anterior funciona debido a que dentro del Backend se tiene un `docker-compose.yml`.

## **Parte 1. Canvas**
Para permitir la visualización y futuro dibujo de los planos, se integró un elemento HTML <canvas> encapsulado en su propio componente de React.
- Agregar un lienzo y componente propio: Se tiene el componente `BlueprintCanvas.jsx`, el cual recibe los puntos del plano seleccionado y se encarga de renderizarlos utilizando la API 2D de Canvas. Este componente tiene su propio identificador para facilitar pruebas y referencias.
- Dimensiones adecuadas: Se definieron las dimensiones por defecto en 520×360 píxeles. Esto asegura que el lienzo tenga un tamaño funcional para visualizar los trazos sin desbordar la pantalla ni romper el diseño en cuadrícula (grid) de la página principal.

Teniendo en cuenta lo anterior se dejó la implementación del canvas en `BlueprintPage.jsx`

## **Parte 2. Listar Planos de un Autor**
Se implementó un panel de búsqueda y una tabla dinámica para consultar y listar los planos de forma eficiente.
- Consulta desde el backend (o mock): Se incluyó un campo de texto (<input>) que actualiza el estado local. Al hacer clic en el botón, se despacha una acción asíncrona mediante Redux (fetchByAuthor) que se comunica con el blueprintsService. Este servicio es capaz de alternar dinámicamente entre datos simulados (apimock) y peticiones reales al backend dependiendo de las variables de entorno (VITE_USE_MOCK).
- Mostrar resultados en una tabla: La respuesta se mapea en una tabla HTML convencional, respetando estrictamente las columnas solicitadas: Nombre del plano, Número de puntos y un botón de acción.

### **Cambio Importante. `blueprintService.js`**
Por defecto, la librería `axios` envuelve la respuesta HTTP del servidor dentro de un objeto, colocando el cuerpo de la respuesta en la propiedad res.data. Sin embargo, nuestro backend en Spring Boot (`BlueprintsAPIController.java`) también implementa su propio patrón de diseño para las respuestas, envolviendo los datos en la clase ApiResponseWrapper (que contiene statusCode, message y data).

Si no se maneja esto, el frontend intentaría iterar sobre un objeto en lugar del arreglo de planos, causando que la aplicación falle al desactivar los datos falsos (mock).

**La solución:**
Se actualizó el servicio apiReal para "desempaquetar" la respuesta dos veces accediendo a res.data.data. El primer .data remueve la envoltura de Axios, y el segundo .data extrae los planos reales de la envoltura de nuestro backend.
```java
const apiReal = {
  getAll: async () => {
    // La petición se hace al endpoint real expuesto por el controlador
    const res = await api.get("/v1/blueprints") 
    // Se extrae la propiedad 'data' del ApiResponseWrapper del backend
    return res.data.data 
  },
```

## **Parte 3. Seleccionar un Plano y Graficarlo**
Para cumplir con este requerimiento, se integró el estado global de la aplicación (Redux) con el componente de renderizado gráfico (`BlueprintCanvas`). El flujo funciona de la siguiente manera:
**1. Disparador de la acción (Botón Open)**

Al hacer clic en el botón "Open" dentro de la tabla de resultados, se ejecuta una función que despacha la acción `fetchBlueprint`. Esta acción se comunica con el backend (o mock) enviando el autor y el nombre del plano para obtener el detalle completo, incluyendo sus coordenadas (points).
```java
const openBlueprint = (bp) => {
  dispatch(fetchBlueprint({ author: bp.author, name: bp.name }))
}
```

**2. Actualización de los Campos de Texto**

Una vez que Redux resuelve la petición HTTP, actualiza el estado global almacenando el plano en la propiedad current. La interfaz reacciona automáticamente a este cambio de estado y actualiza el título en la pantalla, mostrando el nombre del plano seleccionado.

**3. Dibujar segmentos de recta y marcar puntos en el Canvas**

El arreglo de puntos (`current?.points`) se pasa como una propiedad (prop) al componente `<BlueprintCanvas points={current?.points || []} />`. Dentro de este componente, un `useEffect` detecta cualquier cambio en los puntos y utiliza la API nativa de HTML5 Canvas (Contexto 2D) para realizar el renderizado.

Primero se iteran los puntos para trazar los segmentos de recta conectados mediante lineTo y stroke. Posteriormente, se vuelve a iterar el arreglo para dibujar un círculo sólido (arc y fill) en cada coordenada exacta, marcando visiblemente cada punto sobre las líneas.

## **Parte 4. Servicios: `ApiMock` y `ApiClient`**
Se tienen dos implementaciones que respetan estrictamente la misma interfaz (getAll, getByAuthor, getByAuthorAndName, create):
- `apimock.js`: Retorna datos estáticos desde un arreglo en memoria.
- `apiClient.js` (Axios): Instancia configurada para comunicarse con el servidor en http://localhost:8080/api.

### **Alternacnia dinámica**
Para cumplir con el requerimiento de cambiar entre el mock y el API real con una sola línea de código, se tiene un servicio integrador (`blueprintsService.js`) que lee la variable de entorno `VITE_USE_MOCK` desde el archivo .env.

Además, el servicio real (apiReal) se encarga de "desempaquetar" la respuesta del backend (que viene dentro de un `ApiResponseWrapper`), extrayendo .data.data para que la estructura final sea idéntica a la que devuelve el apimock.
```java
const service = useMock ? apimock : apiReal
export default service
```

### **Configuración `.env`**
Para alternar los servicios, basta con modificar el archivo .env en la raíz del proyecto React:
```java
VITE_API_BASE_URL=http://localhost:8080/api
VITE_USE_MOCK=true  # true usa apimock, false usa apiClient
```

## **Evolución Arquitectónica de la Interfaz ❗️**
Para mejorar la escalabilidad y la experiencia de usuario (UX), la aplicación fue refactorizada hacia una arquitectura basada en componentes modulares, enrutamiento y hooks personalizados:
- Enrutamiento (React Router DOM): Se implementó `react-router-dom` para separar la lógica en vistas distintas (`/login`, `/blueprint`, `/blueprint/:author/:name`), evitando recargas de página y mejorando la navegación.
- Gestión de Estado y Formularios (Modales): Las acciones de creación (POST) y actualización (PUT) se extrajeron de las vistas principales y se encapsularon en componentes modulares (`CreateBlueprintModal.jsx`, `UpdateBlueprintModal.jsx`). Esto mantiene la vista de lista y de detalle limpias y enfocadas en la lectura de datos.
- Custom Hooks para API: Se crearon los hooks `usePost` y `useUpdate` para abstraer la lógica de comunicación con Axios, gestionar estados de carga (`isLoading`), y centralizar el manejo de errores HTTP 403 (RBAC - Control de Acceso Basado en Roles).
- Seguridad UI: Se integró un `LogoutButton` global con renderizado condicional basado en la ruta actual (`useLocation`), permitiendo limpiar el token JWT del `localStorage` de forma segura.

## **Parte 5. Interfaz con React**
- Estado Global (Redux) en el DOM: Se garantizó que la vista de detalle del plano (nombre, autor y puntos) sea un reflejo estricto del estado global. El componente `BlueprintDetailPage` utiliza el hook `useSelector` para extraer la propiedad current del estado de Redux (`state.blueprints`). Al actualizarse este estado global mediante acciones, el DOM de React reacciona y renderiza el nombre automáticamente, manteniendo una única fuente de la verdad.
- Cero Manipulación Directa del DOM: Se evitó por completo el uso de anti-patrones en React como `document.getElementById` o `document.querySelector`. Toda la manipulación de la interfaz se realiza a través del estado (`useState`), propiedades (props) y, para el caso específico de la API de HTML5 Canvas, se utilizó el hook `useRef` para mantener una referencia segura y acoplada al ciclo de vida del componente.

## **Sugerencias Implementadas (Obligatorias) 👀**
### **1. Redux Avanzado**
- **Estados Loading/Error por Thunk:** El slice de Redux (`blueprintsSlice.js`) se diseñó con estados independientes para las listas (`listStatus`, `listError`) y para los detalles (`detailStatus`, `detailError`). La interfaz de usuario lee estos estados ('idle', 'loading', 'succeeded', 'failed') para renderizar condicionalmente spinners de carga, banners de error o el contenido real, evitando bloqueos en la UI.
- **Memo Selectors (Top-5):** Se implementó la función createSelector de `@reduxjs/toolkit` para derivar el Top 5 de planos con mayor cantidad de puntos (`selectTop5Blueprints`). Al ser un selector memorizado, esta costosa operación de ordenamiento solo se recalcula si la lista subyacente de planos (`allItems`) sufre alguna mutación, optimizando drásticamente el rendimiento de la aplicación.

### **2. Rutas Protegidas**
Se implementó un componente envoltorio `<PrivateRoute>` que intercepta la navegación. Este componente verifica la existencia de un token JWT válido en el localStorage. Si el usuario no está autenticado, es redirigido automáticamente a la vista de `/login`. Las rutas de visualización y edición (`/blueprint` y `/blueprint/:author/:name`) están encapsuladas dentro de este componente en el enrutador principal (`App.jsx`).

### **3. CRUD Completo y Actualizaciones Optimistas**
**Corrección de Endpoints y Seguridad** 

Para lograr un CRUD verdaderamente completo, fue necesario intervenir el backend en Spring Boot. Se crearon los endpoints correspondientes (`@DeleteMapping`) y se implementó la lógica de borrado desde el controlador hasta la capa de persistencia (Tanto en memoria como en PostgreSQL). Además, se actualizaron los permisos (`SecurityConfig`) para garantizar que solo roles autorizados puedan ejecutar operaciones destructivas.

**Optimistic Updates**

Las operaciones de actualización (PUT para añadir puntos) y borrado (DELETE) utilizan Thunks con actualizaciones optimistas. En el extraReducers, cuando la acción está en estado pending, la UI se actualiza inmediatamente (añadiendo el punto al canvas o borrando el plano de la tabla) asumiendo que el servidor responderá exitosamente. Si la promesa es rejected (ej. por falta de permisos 403), el estado ejecuta un "rollback" (revierte el cambio) para mantener la consistencia con la base de datos.

### **4. Dibujo Interactivo**
El `<svg>` estático fue reemplazado por un componente `<BlueprintCanvas>` interactivo. Utilizando el evento `onClick` sobre el canvas y calculando el `getBoundingClientRect()`, se obtienen las coordenadas exactas X e Y del ratón relativas al lienzo.

Estas coordenadas temporales se pintan instantáneamente en la pantalla para dar retroalimentación visual al usuario. Al hacer clic en el botón "Guardar", se itera sobre estos nuevos puntos y se envían al backend a través del Thunk optimista de Redux para persistirlos definitivamente.

### **5. Errores y Retry (Reintentos)**
Se implementó un mecanismo de resiliencia en la vista de detalles. Si el Thunk encargado del método GET falla (por ejemplo, si el servidor se cae o hay problemas de red), el componente intercepta el estado `detailStatus === 'failed'` y oculta el canvas. En su lugar, despliega un banner de error acompañado de un botón "Reintentar", el cual vuelve a despachar la acción `fetchBlueprint` sin necesidad de recargar la página completa, como se puede ver a continuación:
```java
if (detailStatus === 'failed') return (
  <div className="card" style={{ background: '#fee2e2', color: '#991b1b' }}>
    <p>Error: {detailError}</p>
    <button className="btn" onClick={() => dispatch(fetchBlueprint({ author, name }))}>
      Reintentar
    </button>
  </div>
)
```
