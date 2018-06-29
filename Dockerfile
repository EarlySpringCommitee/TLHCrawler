FROM mhart/alpine-node:latest

# Create app directory
RUN mkdir -p /app
WORKDIR /app
# Bundle app source
COPY . /app
# Install app dependencies
RUN npm install --production

EXPOSE 3000
CMD ["npm", "start"]