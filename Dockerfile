FROM node:latest

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package*.json ./

USER node

RUN npm install

COPY --chown=node:node . .

USER root

RUN chmod 0744 ./index.js

RUN apt-get update && apt-get -y install cron

# Copy main-cron file to the cron.d directory
COPY main-cron /etc/cron.d/main-cron

# Give execution rights on the cron job
RUN chmod 0644 /etc/cron.d/main-cron

# Apply cron job
RUN crontab /etc/cron.d/main-cron

# Create the log file to be able to run tail
RUN touch /var/log/cron.log

# Run the command on container startup
CMD cron && tail -f /var/log/cron.log