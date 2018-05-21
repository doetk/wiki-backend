FROM docker.elastic.co/logstash/logstash:6.2.2
RUN mkdir jdbc

ENV http_proxy="http://proxy.tcs.com:8080"
ENV https_proxy="http://proxy.tcs.com:8080"


RUN curl -L 'http://jdbc.postgresql.org/download/postgresql-42.2.1.jar' -o postgresql-42.2.1.jar
RUN rm -f /usr/share/logstash/pipeline/logstash.conf
COPY logstash.conf /usr/share/logstash/pipeline/
ENV XPACK_MONITORING_ENABLED=false

ENV http_proxy=""
ENV https_proxy=""

EXPOSE 9600

CMD ["bin/logstash", "-f", "/usr/share/logstash/pipeline"]
