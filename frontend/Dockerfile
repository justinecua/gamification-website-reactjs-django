#-------development version ------
FROM node:22.16.0-slim
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
EXPOSE 5174
CMD ["npm", "run", "dev"]

#-------production version ------
# FROM node:22.16.0-slim
# WORKDIR /app

# COPY package.json package-lock.json ./
# RUN npm install

# COPY . .
# EXPOSE 5174
# CMD ["yarn", "dev", "--host", "0.0.0.0", "--port", "5174"]
