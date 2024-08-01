FROM node:20.11.1-alpine3.19 as builder

WORKDIR /usr/src/app

COPY /client .

RUN npm install

RUN npm run build

FROM nginx:alpine

COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

RUN rm /etc/nginx/conf.d/default.conf

COPY /client/nginx.conf /etc/nginx/conf.d

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]