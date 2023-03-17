#!/bin/bash

read -p "Microbond name: " name

if [ -z "$name" ];
then
  exit
fi

git clone https://github.com/beezwax/bzbond-server-microbond-example.git "$name"
cd "$name"
rm -rf .git
git init

echo
echo "Microbond $name created!"
echo "A git repository has been created for you."
echo
echo "Next steps:"
echo " - Read the documentation in README.md"
echo " - Edit package.json and change your microbond's name and description"
echo " - Start hacking away by editing the 'index.js' file"
