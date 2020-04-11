# Project Starter

A quickly thrown together boilerplate that serves as a start to developing modern JS applications. 

## Getting Started

- Ensure you have the proper dependencies installed on your machine. You will need Node, NPM, and Docker.

> note while you can run this with Docker right now it is not recommended yet

### Cloning and installing

- Clone this project directory down, cd into it and run npm install

```
git clone http://github.com/Bashkir15/Project-Scaffold.git 
cd Project-Scaffold && npm install
```

Once this it done, it is a good idea to edit the package.json to provide it with your own project information such as name, version etc.

### Running the Starter

The starter currently runs in 2 modes: A production mode where all assets are bundled, minified, etc., and a development mode that has live code reloading.

#### Dev mode

Run the below in your terminal
```
npm run dev
```

To build and launch the application on a server

#### Prod mode

For prod, since we don't have a dev server that rebuilds our assets, we need to build the application and then provide start our own server.

```
npm run build && npm run start
```






