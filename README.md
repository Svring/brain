docker build --platform linux/amd64 -t brain:latest .
docker tag brain puddlecat/brain:latest
docker push puddlecat/brain:latest

docker buildx build \
 --platform linux/amd64,linux/arm64 \
 -t puddlecat/brain:latest \
 --push .
