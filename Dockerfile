FROM node:14-alpine as build
WORKDIR /usr/gitfuck
COPY package*.json ./
RUN npm install
COPY tsconfig.json ./
COPY . .
RUN npm run build

FROM node:14-alpine as deps
WORKDIR /usr/gitfuck
COPY package*.json ./
RUN npm install --production

FROM node:14-alpine
WORKDIR /usr/gitfuck
# Installs latest Chromium (92) package.
RUN apk add --no-cache \
  chromium \
  nss \
  freetype \
  harfbuzz \
  ca-certificates \
  ttf-freefont
# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
  PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

COPY --from=build /usr/gitfuck/build ./build/
COPY --from=deps /usr/gitfuck/node_modules ./node_modules/

CMD ["node", "./build/index"]
