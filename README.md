
> Manage Github issues from Asana



## Getting Started

Setup the configuration by creating a file config/local.yml within your 
working directory. You can also use json, properties and more.
See (node-config)[https://github.com/lorenwest/node-config/wiki/Configuration-Files]

```yml
crosscheck:
    asana:
        apiKey: YOUR-ASANA-API-KEY
        
    github:
        # Recommended see [GitHub Doc](https://help.github.com/articles/creating-an-access-token-for-command-line-use/)
        personalAccessToken: YOUR-GITHUB-ACCESS-TOKEN
        # Alternative
        userName: YOUR-GITHUB-USER
        password: YOUR-GITHUB-PSW
```


Install the module with: `npm install crosscheck`

```js
var crosscheck = require('crosscheck');
crosscheck.sync();
```

Install with cli command

```sh
$ npm install -g crosscheck
$ crosscheck --help
$ crosscheck                # sync once
$ crosscheck -t 300         # sync every 5 minutes
```




## Documentation

The API doc is not online yet, but you can generate it locally. 
Check out the project and cd into it:

```sh
$ npm install
$ grunt jsdoc
$ cd doc
```


## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style. 
Add unit tests for any new or changed functionality. 
Lint and test your code using [Grunt](http://gruntjs.com).


## License

MIT
Copyright (c) 2014 Marc Boscher
