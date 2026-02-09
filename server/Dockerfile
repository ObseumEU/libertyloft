FROM node:22-alpine

WORKDIR /app

COPY server/calendar-cache-server.mjs ./server/calendar-cache-server.mjs

ENV CALENDAR_BACKEND_PORT=3001
EXPOSE 3001

CMD ["node", "server/calendar-cache-server.mjs"]
