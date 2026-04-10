# Etapa 1: Construcción
FROM node:20-alpine AS build-stage

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json* ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . ./

# Construir la aplicación para producción
RUN npm run build

# Etapa 2: Servidor de producción (Nginx)
FROM nginx:stable-alpine AS production-stage

# Copiar el build desde la etapa anterior
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copiar la configuración de Nginx para el fallback de SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer el puerto 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
