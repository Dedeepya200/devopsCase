# Queueflow

A virtual queue operations dashboard for a service venue. The dashboard includes a live ticket list, waiting and in-service filters, search, estimated waits, queue metrics, and a wait-time trend chart.

## Queue workflows

- Add walk-ins with a customer name and service type.
- Call a waiting ticket, start service, complete the visit, or mark a ticket as a no-show.
- Search by customer, ticket number, or service; filter by ticket status.
- Queue tickets persist in this browser using `localStorage`.

This is a front-end prototype. Queue data is local to the browser and is not shared between devices or staff members; a production multi-user service needs an API and shared database.

## Container deployment

This repository contains a containerized React/Vite application; it is not a Flask service. The Dockerfile builds the frontend and serves the static output with Nginx.

Build and run locally:

```sh
docker build -t queueflow:local .
docker run --rm -p 8080:80 queueflow:local
```

Open <http://localhost:8080>.

Deploy to a Kubernetes cluster with `kubectl` configured:

```sh
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/service.yaml
IMAGE=your-dockerhub-username/queueflow:latest
sed "s|IMAGE_PLACEHOLDER|$IMAGE|g" k8s/deployment.yaml | kubectl apply -f -
kubectl -n queueflow port-forward service/queueflow 8080:80
```

Publish the image before deploying it. For a private Docker Hub repository, create an `imagePullSecret` named `dockerhub-registry` in the `queueflow` namespace and add it to the pod spec. The service is also exposed as NodePort `30080`.

## Jenkins CI/CD

Create a Jenkins Pipeline job pointing at this repository and configure these Jenkins credentials:

- `dockerhub-credentials`: Username with password credentials containing a Docker Hub username and access token.
- `kubeconfig`: Secret file containing a kubeconfig for the target cluster. The Jenkins agent must be able to reach that cluster and run Docker and `kubectl`.

Make the Docker Hub repository public for cluster pulls, or provision an `imagePullSecret` for the `queueflow` namespace and reference it in `k8s/deployment.yaml`.

Install the Jenkins Git and GitHub plugins. Configure the repository's push webhook to `https://JENKINS_URL/github-webhook/` (with push events enabled). `githubPush()` triggers on webhook delivery; the two-minute SCM polling schedule is a fallback. Every run builds and pushes both a build-number tag and `latest`, applies the namespace, service, and build-number deployment image, then waits for rollout completion.

The manifests expose the app on NodePort `30080` when the cluster nodes are reachable. Alternatively, use the port-forward command above to validate access locally. Remote SCM push, registry publication, webhook delivery, and cluster rollout require credentials and infrastructure configured outside this repository; none are committed here.

## Run locally

```sh
npm install
npm run dev
```

Create and type-check a production build with:

```sh
npm run build
```