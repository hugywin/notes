## 关键词说明 ##
* GitLab-CI : GitLab提供可持续集成服务。只要在你的仓库根目录 [创建一个.gitlab-ci.yml 文件][yaml语法]， 并为该项目指派一个Runner，当有合并请求或者 push的时候就会触发CI pipeline。
* .gitlab-ci.yml 执行脚本
* GitLab-Runner gitlab-ci.yml脚本执行者  执行script部分

## 项目执行流程 ##

#### 项目 -> push -> GitLab -> GitLab-CI -> GitLab-Runner(远端服务器)

###
  GitLab-Runner类型： shared Runner 共享型(系统管理员权限)、 specific Runner 指定型（修改 Lock to current projects 可以共享）

###
  安装 [GitLab-Runner](https://docs.gitlab.com/runner/install/)

  centOS
    ```
    ## 添加源
    curl -L https://packages.gitlab.com/install/repositories/runner/gitlab-ci-multi-runner/script.rpm.sh | sudo bash
    yum install gitlab-ci-multi-runner
    ```
  MacOs

    ```
    sudo curl --output /usr/local/bin/gitlab-runner https://gitlab-runner-downloads.s3.amazonaws.com/latest/binaries/gitlab-runner-darwin-amd64
    cd ～
    sudo chmod +x /usr/local/bin/gitlab-runner
    ```


  [注册Runner](https://docs.gitlab.com/runner/register/index.html)
  ```
  gitlab-runner register
  ###Please enter the gitlab-ci coordinator URL (e.g. https://gitlab.com/):
  https://git.yidian-inc.com:8021/
  ###Please enter the gitlab-ci token for this runner:
  JXhBW9HDJ9z6i13HP_cj
  Please enter the gitlab-ci description for this runner:（runner 描述）
  [localhost]: test-runner
  Please enter the gitlab-ci tags for this runner (comma separated): （tag名称）
  test-tag
  Whether to run untagged builds [true/false]:
  [false]: true
  Whether to lock the Runner to current project [true/false]:
  [true]: true
  Registering runner... succeeded                     runner=JXhBW9HD
  Please enter the executor: parallels, virtualbox, docker+machine, kubernetes, docker-ssh+machine, docker, docker-ssh, shell, ssh: （选择执行者类型）
  shell
  Runner registered successfully. Feel free to start it, but if it's running already the config should be automatically reloaded!
  ```

  ### [GitLab Runner Commands](https://docs.gitlab.com/runner/commands/README.html)


  ### [GitLab .gitlab-ci.yml](https://docs.gitlab.com/ce/ci/yaml/README.html)
  demo 如下：
  ```
  #  变量定义
  variables:
    # 基础镜像名
    DOCKER_IMAGE_NAME:
    # 构建后的镜像名前缀, 最后为小写的project name
    DEPLOY_IMAGE_NAME_PREFIX:
    HOST_PORT: "7700"
    DOCKER_PORT: "7700"
    PROJECT_NODE_MODULE_VER: 1

  image:
    name: $DOCKER_IMAGE_NAME
  # 定义 stages
  stages:
    - install_deps
    - build
    - assemble
    - deploy

  before_script:
    - echo "CACHE_KEY $CI_PROJECT_NAME-$PROJECT_NODE_MODULE_VER-modules"

  install_dependence:
    stage: install_deps
    cache:
      key: "$CI_PROJECT_NAME-$PROJECT_NODE_MODULE_VER-modules"
      untracked: true
      paths:
        - node_modules/        *只缓存node_modules？*
    script:
      - npm install
    tags:
      - node

  build_project:
    stage: build
    cache:
      key: "$CI_PROJECT_NAME-$PROJECT_NODE_MODULE_VER-modules"
      paths:
        - node_modules/
      policy: pull    // 缓存的策略 可以指定单一的行为 缓存操作的默认行为在执行开始下载结束上传
    script:
      - tar -cf release.tar.gz .
      - ls -la
    artifacts:
      paths:
        - release.tar.gz
      expire_in: 1 days
    tags:
      - node

  build_docker:
    variables:
      DEPLOY_DOCKER_NAME: $DEPLOY_IMAGE_NAME_PREFIX-$CI_PIPELINE_ID
    stage: assemble
    script:
      - ls -la
      - docker pull $DOCKER_IMAGE_NAME
      - echo "FROM $DOCKER_IMAGE_NAME" > Dockerfile
      - echo "ADD ./release.tar.gz /home/$CI_PROJECT_NAME" >> Dockerfile
      - docker build -t $DEPLOY_DOCKER_NAME .
      - docker push $DEPLOY_DOCKER_NAME
    dependencies:
      - build_project
    tags:
      - 10_103_35_78_shell


  deploy_79:
    variables:
      DEPLOY_DOCKER_NAME: $DEPLOY_IMAGE_NAME_PREFIX-$CI_PIPELINE_ID
    stage: deploy
    script:
      - echo "fetch helpful"
      - curl https://gitlab.com/wemedia-js/ci-helpful/repository/master/archive.tar.gz > ci.tar.gz
      - tar -xf ci.tar.gz
      - mv ci-helpful-master* ci-helpful

      - export CONTAINER_NAME_PREFIX="$CI_PROJECT_NAME-ui"
      # 移除旧版本container
      - bash ci-helpful/remove_old_docker.sh $CONTAINER_NAME_PREFIX
      # 移除同源docker
      - docker pull $DEPLOY_DOCKER_NAME
      - docker run -d -t -e LANG=en_US.UTF-7 -e TZ=Asia/Shanghai --name $CONTAINER_NAME_PREFIX-$CI_JOB_ID-image --net=host -p $HOST_PORT:$DOCKER_PORT $DEPLOY_DOCKER_NAME /bin/bash -c "cd /home/$CI_PROJECT_NAME && pm2 run build && pm2 logs"
      - bash ci-helpful/check_port.sh $HOST_PORT  // netstat 查看端口状态
    tags:
      - 10_103_35_79_shell
   ```
