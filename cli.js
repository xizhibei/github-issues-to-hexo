#!/usr/bin/env node --harmony-async-await

'use strict';

const path = require('path');

const program = require('commander');
const debug = require('debug')('githubIssue2Blog');

const pkg = require('./package.json')
const issue2Blog = require('./');

program
    .version(pkg.version)
    .option('-u, --user [user]', 'User name', String, 'xizhibei')
    .option('-r, --repo [repo]', 'Repo name', String, 'blog')
    .option('-d, --dir [dir]', 'Output dir', String, 'source/_posts/')
    .parse(process.argv);

debug(`Args: user ${program.user}, repo ${program.repo}`);

issue2Blog.getIssues(program.user, program.repo)
  .then((blogs) => {
  	const dir = path.resolve(program.dir);
  	debug(`Write to dir ${dir}`);
  	return issue2Blog.writeFiles(dir, blogs);
  })
  .then(() => {
    console.log('Done');
    process.exit(0);
  })
  .catch(e => {
  	console.log(e.stack);
  	process.exit(1);
  })