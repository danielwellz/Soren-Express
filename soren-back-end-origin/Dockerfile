FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

FROM deps AS build
WORKDIR /app
COPY . .
RUN yarn build

FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache mariadb-client bash

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/yarn.lock ./yarn.lock
COPY --from=build /app/dist ./dist
COPY docker/entrypoint.sh ./docker/entrypoint.sh

RUN chmod +x ./docker/entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["./docker/entrypoint.sh"]
