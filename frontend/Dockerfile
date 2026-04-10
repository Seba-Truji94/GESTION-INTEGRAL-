# Dockerfile para DESARROLLO (Local)
FROM node:20-alpine

WORKDIR /app

# Instalar dependencias
COPY package.json package-lock.json* ./
RUN npm install

# El código se monta vía volumen en docker-compose, 
# pero dejamos esto como fallback
COPY . ./

# Exponer el puerto de Vite
EXPOSE 5173

# El comando se define en docker-compose.yml (npm run dev)
CMD ["npm", "run", "dev", "--", "--host"]
