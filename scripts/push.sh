#!/bin/sh

setup_git() {
  git config --global user.email "${ENV_EMAIL}"
  git config --global user.name "${TRAVIS_USERNAME}"
}

build() {
  npm run build
}

commit_files() {
  git checkout master
  ls -al
  git status
  git add dist/operationkit.min.js
  git add dist/operationkit.min.js.map
  ls -al
  git status
  git commit --message "${ENV_TRAVIS_COMMIT_MESSAGE}"
}

upload_files() {
  git push "https://${ENV_GITHUB_USERNAME}:${ENV_GITHUB_PASSWORD}@github.com/dannyYassine/operationkit.git/"
}

setup_git
build
commit_files
upload_files