FROM node:20

ENV NODE_ENV development

WORKDIR /usr/src/app

COPY /services .

RUN npm install

EXPOSE 8080

CMD npm run start --host 0.0.0.0