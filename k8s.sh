# Script that Builds and pushes image to docker so that it can be used in K8S

docker build . -t sla-monitor
docker tag sla-monitor ubiwhere/sla-monitor
docker push ubiwhere/sla-monitor