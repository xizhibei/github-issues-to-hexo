#!/usr/bin/env node --harmony-async-await

'use strict';

const fs = require('fs');
const path = require('path');

const program = require('commander');
const debug = require('debug')('githubIssue2Blog');

const pkg = require('./package.json')
const issue2Hexo = require('./');

const defaultTemplateFile = path.join(__dirname, './template.md');

program
  .version(pkg.version)
  .description(pkg.description)
  .command('init [filname]', 'init your custom template file')
  .action((action, arg) => {
    if (action === 'init') {
      const file = path.resolve(arg);
      fs.writeFileSync(file, fs.readFileSync(defaultTemplateFile));
      console.log(`Write template file to ${file}`);
      process.exit(0);
    }

    if (action === 'help') {
      console.log(`Example: github-issue-to-hexo init your-template.md`);
    }

    process.exit(0);
  })
  .option('-u, --user [user]', 'User name')
  .option('-r, --repo [repo]', 'Repo name')
  .option('-d, --dir [dir]', 'Output dir, default: "source/_posts/"', String, 'source/_posts/')
  .option('-t, --template [filePath]', 'Template file path')
  .parse(process.argv);

debug(`Args: user ${program.user}, repo ${program.repo}`);

issue2Hexo.getIssues(program.user, program.repo)
  .then((posts) => {
    const dir = path.resolve(program.dir);
    let templateFile = defaultTemplateFile;
    if (program.template) {
      templateFile = path.resolve(program.template);
    }
    console.log(`Using template ${templateFile}`);

    debug(`Write to dir ${dir}`);
    return issue2Hexo.writeFiles(templateFile, dir, posts);
  })
  .then(() => {
    console.log('Done');
    process.exit(0);
  })
  .catch(e => {
    console.log(e.stack);
    process.exit(1);
  })
