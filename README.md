# Black 的个人网站

这是可以直接浏览的网站。GitHub 下载仓库 ZIP 并解压后，**双击根目录的 `index.html`** 即可打开；不需要安装 Node.js、运行命令或启动本地服务器。

也可以把仓库放到 GitHub Pages：在仓库的 **Settings → Pages** 中选择 **Deploy from a branch**，选择主分支和 **/(root)**。网站使用相对路径，适用于仓库子路径。

## 文件说明

* `index.html`：网站入口。

* `src/app/main.js`、`src/styles/site.css`：页面内容、交互和样式。

* `public/images/`：网站使用的背景、小猫图案和已选定的八张成果证明。

* `content/profile/proofs.json`：证明图片的标题和顺序。

* `content/profile/proofs.js`、`public/js/proof-carousel.js`、`public/js/proof-carousel.css`：已生成的浏览器文件，下载后直接打开所必需。

更新轮播源码或 `proofs.json` 后，可运行 `npm install` 和 `npm run build` 重新生成浏览器文件。浏览网站本身不需要这些开发步骤。字体在联网时由 Google Fonts 加载；离线时使用系统字体，内容和功能不受影响。
