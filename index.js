'use strict';

const fs = require('fs');

const moment = require('moment');
const pinyin = require('pinyin');
const pangu = require('pangu');
const Mustache = require('mustache');
const rp = require('request-promise');

const debug = require('debug')('githubIssue2Blog');

function getPinyinTitle(title) {
  const pinyinTitle = pinyin(title, {
    style: pinyin.STYLE_NORMAL,
  });

  return pinyinTitle
    .map(t => t[0]).join('-')
    .replace(/\s/g, '-')
    .toLowerCase();
}

function getEnTitleFromBody(body) {
  const enTitle = body.match(/<!--\s+en_title:\s*([^\s]+)\s+-->/i);
  return enTitle && enTitle[1]
}

exports.renderMDFiles = function renderMDFiles(templateFile, posts) {
  const template = fs.readFileSync(templateFile).toString();
  Mustache.parse(template);

  return posts.map((post) => {
    const tags = post.labels.map(l => l.name).join(',');
    const date = moment(post.created_at).format('YYYY-MM-DD HH:mm:ss');

    const enTitle = getEnTitleFromBody(post.body);
    const pinyinTitle = getPinyinTitle(post.title);

    debug('Title', post.title, pinyinTitle, enTitle);

    const content = Mustache.render(
      template, {
        date,
        tags,
        post,
      }
    );

    return {
      title: enTitle || pinyinTitle,
      content: pangu.spacing(content),
    };
  });
}

exports.writeFiles = function writeFiles(dir, renderedFiles) {
  for (const rendered of renderedFiles) {
    fs.writeFileSync(`${dir}/${rendered.title}.md`, rendered.content);
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
