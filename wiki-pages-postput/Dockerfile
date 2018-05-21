FROM gradle:4.3.1-jdk8
USER root
WORKDIR /usr/src/wiki-pages-postput
ENV GRADLE_USER_HOME="/usr/src/wiki-pages-postput/.gradle"
ENV JAVA_TOOL_OPTIONS="-Dhttp.proxyHost=proxy.tcs.com -Dhttp.proxyPort=8080 -Dhttps.proxyHost=proxy.tcs.com -Dhttps.proxyPort=8080"
COPY build.gradle .
RUN gradle getDeps
COPY . .
RUN gradle --offline build

FROM openjdk:8-alpine
COPY --from=0 /usr/src/wiki-pages-postput/build/libs /usr/src/myapp
WORKDIR /usr/src/myapp
EXPOSE 8181
CMD ["java", "-jar", "reducepostput-0.0.2.jar"]

