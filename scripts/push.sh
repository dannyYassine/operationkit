#!/bin/sh

setup_git() {
  git config --global user.email "${ENV_EMAIL}"
  git config --global user.name "Travis CI"
}

commit_files() {
  git checkout -b test-push
  ls -al
  git status
  git add .
  git commit --message "Travis build: ${TRAVIS_BUILD_NUMBER}"
}

upload_files() {
  git push test-push
}

setup_git
commit_files
upload_files