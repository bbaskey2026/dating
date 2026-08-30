FROM golang:1.21-alpine AS builder

WORKDIR /app
COPY go.mod ./
COPY . ./

RUN go build -o matching-go main.go

FROM alpine:latest
WORKDIR /root/
COPY --from=builder /app/matching-go .

EXPOSE 8080
CMD ["./matching-go"]
