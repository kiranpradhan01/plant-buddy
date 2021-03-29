# add the necessary instructions
# to create a Docker container image
# for your Go API gateway server

FROM alpine
# FROM ubuntu
RUN apk add --no-cache bash coreutils grep sed
RUN apk add --no-cache ca-certificates
COPY gateway /gateway
EXPOSE 80
EXPOSE 443
ENTRYPOINT ["/gateway"]
