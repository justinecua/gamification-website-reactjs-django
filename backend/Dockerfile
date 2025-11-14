FROM ubuntu:20.04
RUN apt-get update
RUN apt-get install -y software-properties-common
RUN add-apt-repository ppa:deadsnakes/ppa
RUN apt-get install -y python3.9
RUN python3.9 --version
RUN apt-get install -y python3.9-dev build-essential
RUN apt-get install -y python3-dev default-libmysqlclient-dev build-essential
RUN apt-get install -y libssl1.1
RUN apt-get install -y libssl-dev
RUN apt-get install -y libmysqlclient-dev
RUN ln /usr/bin/python3.9 /usr/bin/python
RUN apt-get install -y python3-pip
RUN pip install --upgrade pip
ENV PYTHONUNBUFFERED=1
WORKDIR /api
COPY requirements.txt /api/
RUN pip install -r requirements.txt
COPY . /api/
RUN apt-get install -y apt-utils vim curl
EXPOSE 8005
