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
    const updated = moment(post.updated_at).format('YYYY-MM-DD HH:mm:ss');

    const enTitle = getEnTitleFromBody(post.body);
    const pinyinTitle = getPinyinTitle(post.title);

    debug('Title', post.title, pinyinTitle, enTitle);

    const content = Mustache.render(
      template, {
        date,
        updated,
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

exports.getIssues = async function getIssues(params) {
  const url = `https://api.github.com/repos/${params.user}/${params.repo}/issues`;
  const qs = {};
  if (params.since) {
    qs.since = moment(params.since).toISOString();
  }
  return await _getIssues(url, qs);
};

async function _getIssues(url, qs) {
  const response = await rp.get({
    url,
    qs,
    headers: {
      'User-Agent': 'node',
      'Accept': 'application/vnd.github.v3+json'
    },
    json: true,
    resolveWithFullResponse: true,
  });
  if (response.statusCode >= 400) {
    throw new Error(response.body);
  }

  let issues = response.body;
  if (!response.headers.link) {
    return issues;
  }

  const matches = response.headers.link.match(/<([^>]+)>; rel="(\w+)"/);
  let nextUrl;
  for (let i = 0; i < matches.length; i++) {
    if (matches[i] === 'next') {
      nextUrl = matches[i - 1];
    }
  }

  if (nextUrl) {
    issues = issues.concat(await _getIssues(nextUrl, qs));
  }

  debug(`Get issues length: ${issues.length}`);
  return issues;
}
