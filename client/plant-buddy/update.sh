docker rm -f plant_buddy

yes | docker volume prune
yes | docker image prune

docker pull erikth2355/plant_buddy

docker run \
    -d \
    -e TLSCERT=/etc/letsencrypt/live/www.erikth.me/fullchain.pem \
    -e TLSKEY=/etc/letsencrypt/live/www.erikth.me/privkey.pem \
    -v /etc/letsencrypt:/etc/letsencrypt:ro \
    -p 80:80 \
    -p 443:443 \
    --name plant_buddy \
    erikth2355/plant_buddy

exit
