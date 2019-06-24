#!/bin/sh

setup_git() {
  git config --global user.email "${ENV_EMAIL}"
  git config --global user.name "Travis CI"
}

commit_files() {
  git checkout test-push
  npm run build
  ls -al
  git status
  git add dist/operationkit.min.js
  git add dist/operationkit.min.js.map
  git commit --message "Travis build: ${TRAVIS_BUILD_NUMBER}"
}

upload_files() {
  git push
}

setup_git
commit_files
upload_files