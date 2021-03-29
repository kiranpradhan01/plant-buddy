# Removing old images
docker rm -f redis_server
docker rm -f gateway
docker rm -f sqlDB
docker rm -f mongo_server
docker rm -f posts_server

# prune volumes and images to save space
yes | docker volume prune
yes | docker image prune

# create the network
docker network rm customNetwork
docker network create customNetwork

# pull the latest container from docker
docker pull erikth2355/gateway
docker pull erikth2355/db
docker pull erikth2355/posts_server

export DB_NAME=dev
export TLSCERT=/etc/letsencrypt/live/api.erikth.me/fullchain.pem
export TLSKEY=/etc/letsencrypt/live/api.erikth.me/privkey.pem
export SESSIONKEY=$(openssl rand -base64 18)
export REDISADDR=redis_server:6379
export POSTSSERVER=http://posts_server:4000
export DSN="root:password@tcp(sqlDB:3306)/dev"
export MYSQL_ADDR=sqlDB
export MYSQL_PASS=password
export MONGO_ENDPT=mongodb://mongo_server:27017/plantbuddy
export PLANT_TOKEN=wVz82cdV76B30gEglNaLc2ygsvGh6FG8zJ_khAmM1kw

# Run sqlDB container
docker run -d \
    -e MYSQL_ROOT_PASSWORD=$MYSQL_PASS \
    -e MYSQL_DATABASE=$DB_NAME \
    -p 3306:3306 \
    --name sqlDB \
    --network customNetwork \
    erikth2355/db


# Run mongo server
docker run -d \
    --name mongo_server \
    --network customNetwork \
    mongo

# Run redis server
docker run -d \
    --name redis_server \
    --network customNetwork \
    redis

echo "Waiting for databases to start..."
sleep 5

# Run posts server
docker run -d \
    -e MYSQL_PASS=$MYSQL_PASS \
    -e MYSQL_ADDR=$MYSQL_ADDR \
    -e MYSQL_DB=$DB_NAME \
    -e MONGO_ENDPT=$MONGO_ENDPT \
    -e PLANT_TOKEN=$PLANT_TOKEN  \
    -p 4000:4000 \
    --name posts_server \
    --network customNetwork \
    --restart unless-stopped \
    erikth2355/posts_server

sleep 5

# Run gateway
docker run -d \
    -p 443:443 \
    --name gateway \
    --network customNetwork \
    -v /etc/letsencrypt:/etc/letsencrypt:ro \
    -e TLSCERT=$TLSCERT \
    -e TLSKEY=$TLSKEY \
    -e SESSIONKEY=$SESSIONKEY \
    -e REDISADDR=$REDISADDR \
    -e POSTSSERVER=$POSTSSERVER \
    -e DSN=$DSN \
    --restart unless-stopped \
    erikth2355/gateway
exit
