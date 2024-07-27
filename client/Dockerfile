FROM node:20

WORKDIR /usr/src/app

COPY ./client .

RUN npm i

EXPOSE 5173

CMD ["npm", "run", "build"]