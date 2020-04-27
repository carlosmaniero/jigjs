#!/bin/sh

install_and_test()
{
  echo "_______________________________________________________________"
  echo "🚚 Installing dependencies for $1"
  yarn --cwd "$1";
  echo "_______________________________________________________________"
  echo "🧪 Testing $1"
  yarn --cwd "$1" test
}

install_and_test "frontends/cart" &&
install_and_test "frontends/catalog" &&
install_and_test "frontends/checkout" &&
install_and_test "pokeshop-entry"
