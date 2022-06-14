# Script to run docker-compose locally that contains Kafka and SLA-Monitor
 
docker-compose down 
docker-compose up -d --build

printf "\033c"
echo "running on 8080"

sleep 2s
curl localhost:8080 -m 3
docker logs --follow SLA-Monitor