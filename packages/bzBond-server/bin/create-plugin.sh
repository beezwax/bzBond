#!/bin/bash

read -p "Plugin name: " name

if [ -z "$name" ];
then
  exit
fi

git clone https://github.com/beezwax/bzbond-server-plugin-example.git "$name"
cd "$name"
rm -rf .git
git init

echo
echo "Plugin $name created!"
echo "A git repository has been created for you."
echo
echo "Next steps:"
echo " - Read the documentation in README.md"
echo " - Edit package.json and change your plugin's name and description"
echo " - Start hacking away by editing the 'index.js' file"
