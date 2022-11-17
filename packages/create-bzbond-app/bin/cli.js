#!/usr/bin/env node

const path = require("path");
const {execSync} = require("child_process");
const execPath = path.join(__dirname, "..");
execSync(`cd ${execPath} && npm install`, {stdio: "inherit"});
const CLI = require('../lib/cli/index.js');
const cli = new CLI();
cli.start(process.argv.slice(2));