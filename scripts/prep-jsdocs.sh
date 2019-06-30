#!/bin/sh

generate_jsdocs() {
    npm run docs
}

move_docs() {
    if [ -d "docs" ]
    then
        rm -rf docs
    fi
    mv jsdocs docs
}

commit() {
    git checkout gh-pages
    git add docs
    git commit -m "Build ${TRAVIS_BUILD_NUMBER}: Updated github pages"
    git push "https://${ENV_GITHUB_USERNAME}:${ENV_GITHUB_PASSWORD}@github.com/dannyYassine/operationkit.git/"
}

generate_jsdocs
move_docs
commit