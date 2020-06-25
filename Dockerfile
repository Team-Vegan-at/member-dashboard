### STAGE 1
# Check out https://hub.docker.com/_/node to select a new base image
FROM node:12-slim as build-stage

# Set to a non-root built-in user `node`
USER node

# Create app directory (with user `node`)
RUN mkdir -p /home/node/app

WORKDIR /home/node/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY --chown=node package*.json ./

RUN npm install

# Bundle app source code
COPY --chown=node . .

RUN npm run build && \
  npm prune --production

### STAGE 2
FROM nginx:alpine as run-stage

WORKDIR /usr/share/nginx/html

# Copy cache from Stage 1
COPY --from=build-stage --chown=nginx /home/node/app/build /usr/share/nginx/html
COPY --from=build-stage /home/node/app/build .

COPY ./nginx/default.conf /etc/nginx/conf.d/
COPY ./nginx/nginx.htpasswd /etc/nginx/conf.d/

# Build-time metadata as defined at http://label-schema.org
ARG BUILD_DATE
ARG VCS_REF
ARG VERSION
LABEL org.label-schema.build-date=$BUILD_DATE \
  org.label-schema.name="Team Vegan.at Dashboard" \
  org.label-schema.description="Team Vegan.at Dashboard" \
  org.label-schema.url="https://dashboard.teamvegan.at/" \
  org.label-schema.vcs-ref=$VCS_REF \
  org.label-schema.vcs-url="https://github.com/Team-Vegan-at/member-dashboard/" \
  org.label-schema.vendor="Team Vegan.at" \
  org.label-schema.version=$VERSION \
  org.label-schema.schema-version="1.0"

EXPOSE 80