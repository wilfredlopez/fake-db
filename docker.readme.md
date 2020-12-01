## Docker

1. Install dependencies via `yarn` or `npm install`
2. Run `docker-compose up -d` to start mongodb
3. use connection string `mongodb://127.0.0.1:27017`

### Docker Utilities

#### KILL Docker Mongo DB

> This should do it.

```
docker-compose down
```

> If not you can do it manually

1. find the process running `docker ps` and get the `ID`.
2. `docker stop {ID}`
3. IF you want to remove the image use `docker rm {ID}`

&nbsp;

##### Stop All Containers

```docker
  docker stop `docker ps -qa`
```

###### Remove All Containers

```docker
  docker rm `docker ps -qa`
```

###### Remove All Images

```docker
  docker rmi -f `docker images -qa`
```

###### Remove All Volumes

```docker
  docker volume rm $(docker volume ls -qf dangling="true")
```

###### Remove All Networks

```docker
  docker network rm `docker network ls -q`
```
