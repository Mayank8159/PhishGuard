FROM alpine:3.19

RUN apk add --no-cache wget unzip ca-certificates

WORKDIR /pb

# Download PocketBase (Linux amd64)
RUN wget -O pb.zip https://github.com/pocketbase/pocketbase/releases/download/v0.22.13/pocketbase_0.22.13_linux_amd64.zip \
  && unzip pb.zip \
  && rm pb.zip

EXPOSE 8090

# Persist data at /pb/pb_data (attach Render disk here)
CMD ["./pocketbase", "serve", "--http=0.0.0.0:8090", "--dir=/pb/pb_data"]
