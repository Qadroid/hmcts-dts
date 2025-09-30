FROM alpine:latest

ARG PB_VERSION=0.30.0
ARG TARGETARCH

RUN apk add --no-cache \
    unzip \
    ca-certificates

RUN set -eux; \
    if [ "$TARGETARCH" = "amd64" ]; then \
        PB_ARCH=linux_amd64; \
    elif [ "$TARGETARCH" = "arm64" ]; then \
        PB_ARCH=linux_arm64; \
    else \
        echo "Unsupported architecture: $TARGETARCH"; exit 1; \
    fi; \
    wget -O /tmp/pb.zip https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_${PB_ARCH}.zip; \
    unzip /tmp/pb.zip -d /pb/

EXPOSE 8080

# start PocketBase
CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8080"]