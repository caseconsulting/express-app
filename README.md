# Sample Starter App

1. [Prerequisites](#prerequisites)
1. [Installation](#installation)
1. [Running](#running)
1. [Testing](#testing)
1. [Todo](#todo)

## Prerequisites

[Install MongoDB](INSTALL.md)

## Installation

```sh
npm install --global gulp-cli
npm install --global bower
npm install --global yarn
npm install --global istanbul
git clone git@github.com:caseconsulting/express-starter-app.git
cd express-starter-app
yarn install
bower install
```

create your initial user account

```sh
yarn setup
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

to add additional test users

```sh
node ./bin/adduser.js
```

If you want to add other images you can take the raw, unresized version, put it in ./images/ and run:

```sh
gulp images
```

## Running

### Locally

```sh
gulp
```

## Testing

Simply type:

```sh
yarn test
```

## Todo

1. set up email
2. add 'forgot' controller and logic
3. perhaps add oauth
4. add more tests
5. add editing of another user's profile
