FROM postgres:9.3
ENV POSTGRES_USER docker
ENV POSTGRES_PASSWORD dragon
ENV POSTGRES_DB wiki
ADD createdb.sql /docker-entrypoint-initdb.d/
