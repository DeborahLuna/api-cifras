#!/bin/bash
set -e

DOCKER_USERNAME="${DOCKER_USERNAME:-deborahluna}"

docker compose down

docker pull "$DOCKER_USERNAME/api-cifras:latest"

docker compose up -d

echo "Deploy concluído. Container em execução:"
docker compose ps
