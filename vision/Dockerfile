FROM ultralytics/ultralytics:8.3.82-cpu

WORKDIR /vision

# Install ffmpeg
RUN apt-get update && \
    apt-get install -y ffmpeg && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    pip install yt-dlp

COPY ./vision.py ./yolo11x.pt ./

ENTRYPOINT ["python", "vision.py"]
