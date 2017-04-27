# Sample Starter App

1. [Prerequisites](#prerequisites)
1. [Installation](#installation)
1. [Running](#running)

## Prerequisites

[Install MongoDB](INSTALL.md)

## Installation

```sh
npm install --global gulp-cli
npm install --global bower
npm install --global yarn
git clone git@github.com:caseconsulting/express-starter-app.git
cd express-starter-app
yarn install
bower install
```

create your initial user account

```sh
node ./bin/setup.js
```

Add to your generated .env file. [see the sample](env.example)

To show all gulp tasks run:

```sh
gulp list
```
or show all tasks with comments:

```sh
gulp task-list
```

## Running

### Locally

```sh
gulp
```
