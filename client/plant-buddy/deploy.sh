sh ./build.sh

docker push erikth2355/plant_buddy

ssh -i ~/.ssh/id_rsa ec2-user@www.erikth.me < update.sh
