FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3001

RUN npx prisma generate
RUN npm run build

CMD ["npm", "start"]

# CMD ["npm", "run", "dev"] 