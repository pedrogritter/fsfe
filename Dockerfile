FROM node:19-alpine3.16
RUN mkdir -p /home/node/fsfe/node_modules && chown -R node:node /home/node/fsfe
WORKDIR /home/node/fsfe
COPY --chown=node:node package*.json ./
USER node
RUN npm install
COPY --chown=node:node . .
EXPOSE 3000
CMD ["node", "simpleProjectBackup/app.js"]
