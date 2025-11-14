
FROM node:22.16.0-slim
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
EXPOSE 5174
CMD ["npm", "run", "dev"]

