# Usar imagen ligera de Node
FROM node:20-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json* ./

# Instalar dependencias
RUN npm install

# Copiar todo el código
COPY . /app/

# Exponer el puerto de Vite
EXPOSE 5173

# Comando para iniciar el entorno de desarrollo expuesto a todas las interfaces (-host)
CMD ["npm", "run", "dev", "--", "--host"]
