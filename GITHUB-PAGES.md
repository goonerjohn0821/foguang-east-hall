# 发布到 GitHub Pages

这是佛光寺东大殿第 2 版的 GitHub Pages 适配副本。模型、交互和材质代码保持原版，增加了相对资源路径、Pages 发布工作流和 `.nojekyll`。原网页继续保留。

## 当前状态

- 项目文件和 GitHub Pages 配置已准备。
- `dist/` 是可以独立发布的编译产物。
- 项目仓库：[goonerjohn0821/foguang-east-hall](https://github.com/goonerjohn0821/foguang-east-hall)。发布状态请查看仓库 Actions 与 Settings → Pages。
- 远端自动构建的结果以 Actions 中对应提交的运行记录为准。
- 尚未从中国大陆的运营商网络验证访问速度与可用性。

## 方法一：GitHub Actions 自动发布

适合后续还要继续修改模型。

1. 使用自己的 GitHub 账户创建仓库，建议名称 `foguang-east-hall`，默认分支使用 `main`。如果使用 GitHub Free 的免费 Pages，请使用公开仓库；该仓库里的源代码也会公开。
2. 把本项目文件放到仓库根目录，必须包括 `.github/workflows/deploy-pages.yml`。不要只上传 ZIP，也不要把项目整体多套一层目录。`node_modules/` 不上传；`dist/` 可以不上传，工作流会重新构建。
3. 进入仓库 **Settings → Pages → Build and deployment → Source**，选择 **GitHub Actions**。
4. 进入 **Actions → Publish Foguang Temple to GitHub Pages → Run workflow** 运行一次。之后向 `main` 推送修改会自动更新网页。
5. 等部署成功，在 **Settings → Pages** 中复制 GitHub 返回的真实网址。典型格式是 `https://你的用户名.github.io/foguang-east-hall/`，这里仅表示格式，不是已经生成的地址。

工作流安装依赖，执行几何与交互逻辑检查，再运行包含 TypeScript 检查的生产构建，最后发布 `dist/`。不需要把访问令牌写进代码或发到聊天里。

## 方法二：只上传已编译网页

适合不使用自动构建，或只想先测试大陆网络能否访问。

1. 创建自己的公开仓库。
2. 将 `dist/` **里面的文件和 assets 文件夹**上传到仓库根目录。根目录应直接出现 `index.html`；不要只上传 `dist` 文件夹，也不要上传未编译的根目录源码 `index.html`。
3. 进入 **Settings → Pages**，Source 选择 **Deploy from a branch**，选择 **main / (root)**，保存。
4. 等待发布成功，从页面复制实际地址。

`dist/.nojekyll` 用于跳过 Jekyll。文件管理器可能隐藏这个文件；上传时一并带上更稳妥。

## 本地运行

要求 Node.js 22.12 或以上版本。

```bash
npm ci
npm run verify
npm run build
npm run dev
```

生产网页预览使用 `npm run preview`。不可直接双击 HTML 代替 HTTP 服务。

## 大陆网络验证

GitHub Pages 是另一套网站托管服务，并不是大陆访问保证。某一座校园模型能打开，仅能说明当时该网址在所用网络可达。发布后请关闭代理，分别使用大陆 Wi-Fi 与手机流量测试新网址，确认模型资源加载、旋转、拆解及结构模式可用。微信内置浏览器与系统浏览器也可以分别比较。

网页没有外部模型、第三方字体或运行时 CDN 依赖。模型说明中的 UNESCO 链接仅供点击查阅，不是画面加载依赖。迁移托管地址也不会取消设备对 WebGL 2 的要求。

## 参考

- [GitHub Pages 官方介绍](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)
- [GitHub Pages 自定义工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [Vite 静态部署](https://vite.dev/guide/static-deploy.html)
- [Vite 相对资源路径](https://vite.dev/guide/build.html#relative-base)

工作流 Action 固定提交来自 2026-09-21 查阅的 Vite 官方 Pages 示例。文档和软件版本以后可能变化，远端发布错误应以 GitHub Actions 的实际日志为准。
