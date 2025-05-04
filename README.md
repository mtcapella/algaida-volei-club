# Algaida Volei Club – Proyecto TFG

Este repositorio contiene el proyecto desarrollado como Trabajo Final de Grado (TFG) para la UOC.

## Requisitos

- Docker instalado: https://www.docker.com/products/docker-desktop
- Docker Compose instalado (normalmente ya viene con Docker Desktop)

## Instrucciones

1. Clonar o descomprimir el repositorio.
2. Abrir una terminal en la raíz del proyecto.
3. Ejecutar el siguiente comando para construir las imágenes:

```bash
docker compose build
```

4. Una vez construido, levantar los contenedores con:

```bash
docker compose up
```

5. Acceder a la aplicación desde el navegador en: `http://localhost:3000`

> 🔒 Este entorno se ejecuta en modo desarrollo. Para funcionalidades completas (como conexión con Firebase), es necesario configurar las variables de entorno en un archivo `.env.local`.

## Estructura del proyecto

- `/app`: Aplicación Next.js (frontend y backend)
- `/db`: Base de datos MySQL
- `/api`: Rutas API (servidor serverless)
- `docker-compose.yml`: define los contenedores

## Sobre el Dockerfile

El archivo `Dockerfile` está diseñado para crear una imagen de producción basada en Node.js. Se encarga de instalar las dependencias del proyecto y lanzar el entorno Next.js en el puerto 3000. 

Junto con `docker-compose.yml`, se automatiza la configuración del contenedor, permitiendo levantar toda la aplicación con un solo comando.

## Autor

Miquel Antoni Capellà Arrom  
TFG – UOC – Desarrollo web
