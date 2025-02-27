FROM ubuntu:24.04 AS builder

ENV DEBIAN_FRONTEND=noninteractive

RUN set -eux ;\
      apt-get update ;\
      apt-get install --no-install-recommends --no-install-suggests -y gnupg2 ca-certificates curl \
            git build-essential libopencv-dev ;\
      rm -rf /var/lib/apt/lists/*

RUN set -eux ;\
      git clone https://github.com/pjreddie/darknet ;\
      cd darknet ;\
      make

RUN curl -SsL https://pjreddie.com/media/files/yolov2-tiny.weights > yolov2-tiny.weights

FROM ubuntu:24.04

ARG NODEJS_VERSION=23.9.0

WORKDIR /darknet

COPY --from=builder /yolov2-tiny.weights ./
COPY --from=builder /darknet/darknet /usr/local/bin/darknet
COPY --from=builder /darknet/cfg ./cfg
COPY --from=builder /darknet/data ./data

RUN set -eux ;\
      curl -SsL https://deb.nodesource.com/setup_${NODEJS_VERSION} | bash ;\
      apt-get update ;\
      apt-get install --no-install-recommends --no-install-suggests -y nodejs ffmpeg ;\
      rm -rf /var/lib/apt/lists/*

COPY vision.mjs ./vision.mjs

ENTRYPOINT ["node", "vision.mjs"]
