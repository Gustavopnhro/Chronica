FROM golang:1.23-alpine AS builder

WORKDIR /app

COPY . .

RUN go mod download

RUN CGO_ENABLED=0 go build -o /postmortem-creator .

FROM alpine:latest

WORKDIR /app
RUN apk update && apk upgrade --no-cache

COPY --from=builder /postmortem-creator .
COPY fonts ./fonts

EXPOSE 8080
CMD ["./postmortem-creator"]
