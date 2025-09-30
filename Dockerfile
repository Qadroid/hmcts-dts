FROM denoland/deno:alpine-1.46.3

WORKDIR /app

COPY deno.json* ./
COPY import_map.json ./

COPY . .

EXPOSE 5173

CMD ["task", "dev", "--", "--host", "0.0.0.0"]