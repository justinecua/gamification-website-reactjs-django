FROM python:3.9-slim

ENV PYTHONUNBUFFERED=1
ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    build-essential \
    libssl-dev \
    libmariadb-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /api

COPY requirements.txt /api/

RUN pip install --upgrade pip setuptools wheel
RUN pip install -r requirements.txt

COPY . /api/

EXPOSE 8005
