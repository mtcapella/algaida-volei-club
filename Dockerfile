FROM node:lts-alpine
ENV NODE_ENV=production
WORKDIR /usr/src/app

#forzamos el uso de UTF-8 para evitar problemas con caracteres especiales
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8

# Copiamos los archivos de configuración de npm y package.json
COPY package*.json ./
RUN npm install

COPY . .

# Volcamos el archivo .env.docker a .env y ejecutamos dotenv-cli para construir el proyecto
RUN npm install -g dotenv-cli && \
    cp .env.docker .env && \
    dotenv -e .env -- npm run build

# exponemos el puerto 3000 para la aplicación en ejecución
EXPOSE 3000
RUN chown -R node /usr/src/app
USER node
CMD ["npm", "start"]
