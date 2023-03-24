#!/bin/bash

read -p "Microbond name: " name

if [ -z "$name" ];
then
  echo "Microbond name is required"
  exit
fi

git clone https://github.com/beezwax/bzbond-server-microbond-example.git "$name"
cd "$name"
rm -rf .git
sed -i -n 's/"name": "bzmb-hello-world"/"name": "my-microbond"/' package.json
sed -i -n 's/"version": "1.0.0"/"version": "0.1.0"/' package.json
sed -i -n 's/"author": "Beezwax"/"author": "author"/' package.json
sed -i -n 's/minimal example //' package.json
git init

echo
echo "Microbond $name created!"
echo "A git repository has been created for you."
echo
echo "Next steps:"
echo " - Read the documentation in README.md"
echo " - Start hacking away by editing the 'index.js' file"
echo " - Manage your microbond's version, name, and description in package.json"
