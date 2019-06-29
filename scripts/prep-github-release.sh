#!/bin/sh

create_temp_dir() {
    rm -rf .temp
    mkdir .temp
}

remove_git() {
    rm -rf .git
}

remove_coverage() {
    rm -rf coverage
    rm -f .coveralls.yml
}

remove_coverage() {
    rm -f .idea
}

remove_node_modules() {
    rm -rf node_modules
}

archive_zip() {
    zip -r operationkit.zip ./
}

move() {
    mv operationkit.zip .temp/
}

create_temp_dir
remove_git
remove_coverage
remove_idea
remove_node_modules
archive_zip
move