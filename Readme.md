# Github issues to hexo

## Installation
Available from `npm`

```shell
npm install github-issues-to-blog -g
```

## Usage

Get help:

```shell
github-issues-to-hexo --help
```

Convert your blog:

```shell
cd /path/to/hexo-blog-source/
github-issues-to-hexo -u github-username -r github-repo --since 2017-09-01
```

Using template:
```shell
cd /path/to/hexo-blog-source/

# init template
github-issues-to-hexo init your-template.md

# edit your template
vim your-template.md

# convert your blog
github-issues-to-hexo -u github-username -r github-repo -t your-template.md
```

You may want to take a look of my template for reference: [template.md](https://github.com/xizhibei/blog/blob/master/template.md)

## License

MIT
