FROM golang:1.21-alpine AS builder

WORKDIR /app
COPY go.mod ./
RUN go mod download
COPY . ./

RUN go build -o chat-go main.go

FROM alpine:latest
WORKDIR /root/
COPY --from=builder /app/chat-go .

EXPOSE 9000
CMD ["./chat-go"]
