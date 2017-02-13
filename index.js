'use strict';

const fs = require('fs');
const moment = require('moment');
const pinyin = require('pinyin');
const pangu = require('pangu');
const commonTags = require('common-tags');
const rp = require('request-promise');
const debug = require('debug')('githubIssue2Blog');

exports.writeFiles = function writeFiles(dir, blogs) {
  for (const blog of blogs) {
    const tags = blog.labels.map(l => l.name).join(',');
    const date = moment(blog.created_at).format('YYYY-MM-DD HH:mm:ss');

    const pinyinTitle = pinyin(blog.title, {
      style: pinyin.STYLE_NORMAL,
    })

    const title = pinyinTitle
      .map(t => t[0]).join('-')
      .replace(/\s/g, '-')
      .toLowerCase();

    console.log('Title', blog.title, title);

    const content = commonTags.stripIndents `
		---
		title: ${blog.title}
		date: ${date}
		tags: [${tags}]
		original_url: ${blog.url}
		author: ${blog.user.login}
		---
		${blog.body}
		`;

    fs.writeFileSync(`${dir}/${title}.md`, pangu.spacing(content));
  }
}

exports.getIssues = async function getIssues(user, repo) {
  const url = `https://api.github.com/repos/${user}/${repo}/issues`;
  return await _getIssues(url);
};

async function _getIssues(url) {
  const response = await rp.get({
    url,
    headers: {
      'User-Agent': 'node',
      'Accept': 'application/vnd.github.v3+json'
    },
    json: true,
    resolveWithFullResponse: true,
  });

  let issues = response.body;

  const matches = response.headers.link.match(/<([^>]+)>; rel="(\w+)"/);
  let nextUrl;
  for (let i = 0; i < matches.length; i++) {
    if (matches[i] === 'next') {
      nextUrl = matches[i - 1];
    }
  }

  if (nextUrl) {
    issues = issues.concat(await _getIssues(nextUrl));
  }

  debug(`Get issues length: ${issues.length}`);
  return issues;
}