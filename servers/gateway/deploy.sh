# gateway build
sh ./build.sh

# DB build
cd ../db
sh ./build.sh

# Posts build
cd ../posts
sh ./build.sh
cd ../gateway

# push new builds to dockerhub
docker push erikth2355/gateway
docker push erikth2355/db
docker push erikth2355/posts_server

ssh ec2-user@api.erikth.me < update.sh
