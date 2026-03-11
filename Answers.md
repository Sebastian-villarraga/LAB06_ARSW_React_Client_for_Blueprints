# Laboratorio 6 - React for Blueprints

**Realizado por**

Juan Carlos Leal

Sebastián Villarraga

## **Inicio. Requerimientos para Empezar**
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


