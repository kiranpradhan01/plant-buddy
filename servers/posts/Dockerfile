FROM node
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
EXPOSE 4000
ENTRYPOINT ["node", "index.js"]
