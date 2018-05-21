FROM node

ENV http_proxy="http://proxy.tcs.com:8080"
ENV https_proxy="http://proxy.tcs.com:8080"

# Create app directory
WORKDIR /usr/src/app

#Install app dependencies
COPY package.json .

RUN npm install

COPY . .

ENV http_proxy=""
ENV https_proxy=""

EXPOSE 4000
CMD [ "npm", "start" ]
