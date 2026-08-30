FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN cp dist/ecommerce/browser/index.csr.html dist/ecommerce/browser/index.html

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=4000
COPY --from=build /app/dist/ecommerce/browser ./browser
COPY static-server.mjs ./
EXPOSE 4000
CMD ["node", "static-server.mjs"]
