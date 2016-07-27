# Oxypogon

Oxypogon.js is a simple static website/blog assembling utility that is build over Node.js.

I decided to make a simple blog engine named Colibri years ago (maybe near 2009), but unfortunately this name on npm is already taken. So I've browsed wiki and some sites about birds and found a [beautiful and a bit grumpy hummingbird (colibri)](https://cloud.githubusercontent.com/assets/2196347/17130607/74000fb2-532a-11e6-9ed4-dc604296367c.jpg) which name is Oxypogon. That is, meet Oxypogon.js!

**The development is in progress, so it can be unsafe to use the code right now.**

## Features

- sources in markdown
  - support for metadata like in MultiMarkdown format
- assembling static pages
- lists of pages
- tags and lists of tags
- ...

## Underlying technologies

Oxypogon.js was meant to be as simple and lightweight as possible. So there are just a few libraries used for development:

- all content is extracted from markdown sources using [marked](https://github.com/chjj/marked)
  - I also use [metamd](https://github.com/chrisjaure/metamd) to parse out the metadata from the articles
- as Oxypogon deals with filesystem and file patterns it uses:
  - [glob](https://github.com/isaacs/node-glob) for pattern recognition
  - [mkdirp](https://github.com/substack/node-mkdirp) for recursive directory creation
- [moment.js](https://github.com/moment/moment) for date formatting
- [jade](https://github.com/pugjs/pug) (or Pug? I don't understand why is `jade` package available yet) for templating

## TODO

features:
- add RSS support
- make possible pagination for lists
- find out how to deal with static content
- make oxypogon an executable file that looks for the config and builds the site according to it
- enable inserting dynamic parts into `pieces`
- add `target="blank"` attribute to all links inside content
- make sure that preview creation works like was desired

development:
- combine Reader and Writer into one IO module
- figure out a way to pass tags
- try some options for templating to find the best way of passing data
- set default templates in config, not it the sources

promotion:
- write readme with examples and options
- make a site on github pages
