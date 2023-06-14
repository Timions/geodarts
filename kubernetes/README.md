Um es lokal zu testen:

1. Docker Desktop starten


2. Minikube starten
$ minikube start


3. Redis Service hinzufügen
$ kubectl apply -f redis.yml


4. Geodarts-Redis Service hinzufügen
$ kubectl apply -f deployment.yml


5. Zusätzlich kann man sich das Dashboard anzeigen lassen
$ minikube dashboard


6. Ip-Adresse bekommen
$ minikube service geodarts-redis-service