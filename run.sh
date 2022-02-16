# Script to run docker-compose locally that contains Kafka and SLA-Monitor
 
docker-compose down
docker-compose up -d --build

printf "\033c"
echo "\n\trunning on 8080\n"

sleep 3s
curl localhost:8080 -m 2
docker logs --follow SLA-Monitor