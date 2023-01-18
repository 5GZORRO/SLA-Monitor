bash k8s.sh

export KUBECONFIG=k8s/bcn_kubeconfig.yaml      

kubectl delete -f k8s/sla-monitor.yaml -n sla-monitor

kubectl apply -f k8s/sla-monitor.yaml -n sla-monitor

sleep 4

kubectl get pods -n sla-monitor

# watch kubectl logs -n sla-monitor sla-monitor-deployment-7b88f6468-sk7cd

# watch kubectl logs -n portal-kafka-consumer portal-kafka-consumer-deployment-7b4b884b85-96bsx