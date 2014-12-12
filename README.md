Ubuntu Web Application Starter Pack
===================================

# Getting Started

A few dependencies need to be downloaded before using this pack. In a terminal, type the following commands to install node.js, SASS, gulp.js and install the required dependencies.

```bash
  # Install Ruby (necessary for SASS) and node.js
  sudo apt-get install ruby ruby-dev nodejs-legacy
  # Install SASS
  sudo gem install sass
  # Install gulp.js
  sudo npm install -g gulp
  # Install starter pack dependencies
  npm install
```

Once all dependencies are installed, you can perform the following actions:

- Serve the application locally. Changes made to the code will trigger a livereload *gulp serve*
- Run the unit tests (in Chrome by default): *gulp test*
- Build your application (for production): *gulp*
- Serve the production version of your application: *gulp serve:dist*
- Package the application and deploy it on your Ubuntu Touch device: *gulp ubuntu*

Do not forget to edit the *ubuntu-packager.json* to provide details about your application, see https://github.com/jfmoy/webapp-packager for more information.
