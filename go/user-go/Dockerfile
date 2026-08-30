FROM golang:1.21-alpine AS builder

WORKDIR /app
COPY go.mod ./
COPY main.go ./

RUN go build -o user-go main.go

FROM alpine:latest
WORKDIR /root/
COPY --from=builder /app/user-go .

EXPOSE 8081
CMD ["./user-go"]
