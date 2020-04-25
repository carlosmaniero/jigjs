function installAndTest() {
    yarn --cwd $1 && yarn --cwd $1 test &&
}

installAndTest "frontends/cart" &&
installAndTest "frontends/catalog" &&
installAndTest "pokeshop-entry"
