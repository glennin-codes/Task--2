#!/bin/bash

# Configuration
DOCKER_USERNAME=${DOCKER_USERNAME:-"your-dockerhub-username"}
MONGO_PASSWORD=${MONGO_PASSWORD:-"password"}
COMPOSE_FILE="docker-compose.prod.yml"
VERSION_FILE=".current_version"

# Function to list available versions
list_versions() {
    echo "Available versions:"
    curl -s "https://hub.docker.com/v2/repositories/${DOCKER_USERNAME}/microservices-api/tags/" | \
        grep -o '"name":"[^"]*' | \
        grep -o '[^"]*$' | \
        grep -v "latest\|buildcache"
}

# Function to deploy specific version
deploy_version() {
    local version=$1
    echo "Deploying version: $version"
    
    # Export variables for docker-compose
    export DOCKER_USERNAME API_VERSION MONGO_PASSWORD
    API_VERSION=$version
    
    # Deploy with new version
    docker-compose -f $COMPOSE_FILE pull api
    docker-compose -f $COMPOSE_FILE up -d
    
    # Save current version
    echo $version > $VERSION_FILE
    
    echo "Deployment complete. Version $version is now running."
}

# Function to rollback to previous version
rollback() {
    if [ ! -f $VERSION_FILE ]; then
        echo "No version history found"
        exit 1
    fi
    
    # Get current version
    current_version=$(cat $VERSION_FILE)
    echo "Current version: $current_version"
    
    # List available versions for rollback
    echo "Available versions for rollback:"
    list_versions
    
    read -p "Enter version to rollback to: " rollback_version
    deploy_version $rollback_version
}

# Main script
case "$1" in
    deploy)
        if [ -z "$2" ]; then
            echo "Usage: $0 deploy <version>"
            echo "Available versions:"
            list_versions
            exit 1
        fi
        deploy_version $2
        ;;
    rollback)
        rollback
        ;;
    list)
        list_versions
        ;;
    *)
        echo "Usage: $0 {deploy|rollback|list}"
        echo "  deploy <version>  - Deploy specific version"
        echo "  rollback         - Interactive rollback to previous version"
        echo "  list             - List available versions"
        exit 1
        ;;
esac

# Set these in production
export DOCKER_USERNAME=yourusername
export MONGO_PASSWORD=yourpassword 