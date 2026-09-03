# Debian (not alpine) so the native sqlite3 module builds/loads without extra apk deps.
FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm install --build-from-source sqlite3
RUN npm install
COPY . .
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
EXPOSE 5000
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npm", "run", "dev"]
