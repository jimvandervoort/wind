FROM ultralytics/ultralytics:8.3.82-cpu

WORKDIR /vision

# Install ffmpeg
RUN apt-get update && \
    apt-get install -y ffmpeg && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    pip install yt-dlp

RUN curl -SsfL https://github.com/ultralytics/assets/releases/download/v8.3.0/yolo11x.pt -o yolo11x.pt

COPY ./vision.py ./

ENTRYPOINT ["python", "vision.py"]
