# Script that Builds and pushes image to docker so that it can be used in K8S

docker image rm sfranciscobarao/sla-monitor

docker build . -t sfranciscobarao/sla-monitor
docker push sfranciscobarao/sla-monitor
