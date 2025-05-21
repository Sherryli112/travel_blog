FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# 設定 NODE_ENV，讓 next build 使用 `.env.production`
ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_URL=http://localhost:4001/api

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]

