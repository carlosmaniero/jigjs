#!/bin/sh

install_and_test()
{
  yarn --cwd "$1";
  yarn --cwd "$1" test
}

install_and_test "frontends/cart" &&
install_and_test "frontends/catalog" &&
install_and_test "pokeshop-entry"
