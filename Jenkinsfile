pipeline {
  agent any

  triggers {
    githubPush()
    pollSCM('H/2 * * * *')
  }

  options {
    disableConcurrentBuilds()
    timestamps()
  }

  environment {
    IMAGE_REPOSITORY = 'queueflow'
    KUBE_NAMESPACE = 'queueflow'
    DEPLOYMENT_NAME = 'queueflow'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build and push image') {
      steps {
        withCredentials([usernamePassword(
          credentialsId: 'dockerhub-credentials',
          usernameVariable: 'DOCKERHUB_USERNAME',
          passwordVariable: 'DOCKERHUB_TOKEN'
        )]) {
          sh '''
            set -eu
            IMAGE="$DOCKERHUB_USERNAME/$IMAGE_REPOSITORY"
            echo "$DOCKERHUB_TOKEN" | docker login --username "$DOCKERHUB_USERNAME" --password-stdin
            docker build --pull -t "$IMAGE:$BUILD_NUMBER" -t "$IMAGE:latest" .
            docker push "$IMAGE:$BUILD_NUMBER"
            docker push "$IMAGE:latest"
            docker logout
          '''
        }
      }
    }

    stage('Deploy to Kubernetes') {
      steps {
        withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
          withCredentials([usernamePassword(
            credentialsId: 'dockerhub-credentials',
            usernameVariable: 'DOCKERHUB_USERNAME',
            passwordVariable: 'DOCKERHUB_TOKEN'
          )]) {
            sh '''
              set -eu
              IMAGE="$DOCKERHUB_USERNAME/$IMAGE_REPOSITORY:$BUILD_NUMBER"
              kubectl apply -f k8s/namespace.yaml
              kubectl apply -f k8s/service.yaml
              sed "s|IMAGE_PLACEHOLDER|$IMAGE|g" k8s/deployment.yaml | kubectl apply -f -
              kubectl -n "$KUBE_NAMESPACE" rollout status "deployment/$DEPLOYMENT_NAME" --timeout=180s
            '''
          }
        }
      }
    }
  }

  post {
    always {
      sh 'docker logout >/dev/null 2>&1 || true'
    }
  }
}