
> Collaborate across tools.

*This project is still at an early stage and should considered experimental.*

CrossCheck lets you use [Asana](http://asana.com) as a frontend to manage work 
in other end systems. Currently only GitHub is supported, with some big limitations 
(see below).   
Check out [**The Big Picture**]
(https://github.com/marcboscher/crosscheck/wiki/The-Big-Picture).

#### Things you can already do

- View and edit GitHub issues from Asana, while remaining completely transparent
  to GitHub users.
- Manage issues in multiple GitHub repositories from a single Asana view.
- Add existing Asana task to a GitHub repo simply by assigning a project in Asana.
- Manage GitHub issues and non-GitHub tasks in the same view by assigning multiple Asana projects.
- Order github issues in Asana to prioritize them.
- Quickly add a bunch of issues using Asana's superfast UI.
- Easily add links to other Asana tasks using Asana's link auto-complete.

#### ~~Limitations~~ Roadmap

- ~~Synchronize Comments~~ done!
- Map GitHub labels to Asana tags
- Map GitHub milestones to Asana tags
- Map GitHub assignees to Asana assignees (only if assigned to you)
- Synchronize attachments
- Support Asana sections
- OAuth support

#### How It Works
To sync an Asana project with a GitHub repo, prefix the project name with `#gh` and specify the `#gh.owner` and `#gh.repo` in the project description. There's nothing to do on the GitHub side. Note the prefixes in the **image below are outdated**.

![Asana project config](asana-setup.png)



## Getting Started

Setup the configuration by creating a file config/local.yml within your 
working directory. You can also use json, properties and more.
See [node-config](https://github.com/lorenwest/node-config/wiki/Configuration-Files)

```yaml
crosscheck:
    asana:
        apiKey: YOUR-ASANA-API-KEY
        
    github:
        # Recommended see https://help.github.com/articles/creating-an-access-token-for-command-line-use/
        personalAccessToken: YOUR-GITHUB-ACCESS-TOKEN
        # Alternative
        userName: YOUR-GITHUB-USER
        password: YOUR-GITHUB-PSW

```


Install with cli command

```sh
$ npm install -g crosscheck
$ crosscheck --help
$ crosscheck                # sync once
$ crosscheck -t 300         # sync every 5 minutes
```


Or install the module with: `npm install crosscheck`

```js
var crosscheck = require('crosscheck');
crosscheck.sync();
```





## Documentation

The API doc is not online yet, but you can generate it locally. 
Check out the project and `cd` into it:

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
