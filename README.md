# ConsultAI Demo

这是一个纯前端的 ConsultAI 演示站，包含 5 步完整流程：

1. 首页
2. 项目设定
3. 上传项目材料
4. 关键问题审核
5. 分析结果报告

项目以静态文件为主，适合直接托管到 GitHub Pages，方便组员协作和在线预览。

## 本地运行

在本地预览静态站：

```bash
cd /Users/beanbean/consult/consultai-demo
python3 -m http.server 4173
```

打开：

```text
http://localhost:4173/index.html
```

如需演示 mock API：

```bash
cd /Users/beanbean/consult/consultai-demo
npm run demo:server
```

说明：
- 前端优先请求 `http://localhost:4174/api/*`
- 如果 API 不可用，会自动回退到本地 JSON / 前端内置逻辑

## 目录结构

```text
consultai-demo/
├── index.html                # 静态主页面
├── styles.css                # 页面样式（含打印/PDF样式）
├── data/demo-case.json       # 样例项目数据
├── js/app.js                 # 全局状态、流程交互、i18n
├── js/services.js            # 前端服务层 + fallback
├── js/fixtures.js            # 默认假数据
├── server/server.js          # 本地 mock API
├── server/data.js            # mock API 数据入口
├── scripts/docx_to_demo_json.py
└── .github/workflows/deploy-pages.yml
```

## GitHub 协作方式

推荐把 `consultai-demo` 这个目录本身作为一个独立 GitHub 仓库。

### 1. 初始化仓库

在 `consultai-demo` 目录执行：

```bash
cd /Users/beanbean/consult/consultai-demo
git init
git add .
git commit -m "Initial ConsultAI demo"
```

### 2. 在 GitHub 创建仓库

例如创建仓库名：

```text
consultai-demo
```

然后把本地仓库推上去：

```bash
git branch -M main
git remote add origin https://github.com/<your-org-or-user>/consultai-demo.git
git push -u origin main
```

### 3. 邀请组员协作

在 GitHub 仓库：

- `Settings` -> `Collaborators` / `Manage access`
- 把组员 GitHub 账号加进去

组员拿到仓库后可以直接：

```bash
git clone https://github.com/<your-org-or-user>/consultai-demo.git
```

## GitHub Pages 发布

仓库里已经包含 GitHub Pages workflow：

`/.github/workflows/deploy-pages.yml`

它会在 `main` 分支 push 后自动部署当前静态站。

### 启用步骤

1. 把项目推到 GitHub
2. 打开仓库 `Settings`
3. 进入 `Pages`
4. 在 `Build and deployment` 中选择：
   - `Source: GitHub Actions`
5. 再次 push 一次到 `main`（如果刚刚已经 push，通常会自动触发）

部署完成后，Pages 链接通常会是：

```text
https://<your-org-or-user>.github.io/consultai-demo/
```

## 组员日常更新建议

推荐流程：

```bash
git checkout -b feature/<your-name>-update
# 修改代码
git add .
git commit -m "Refine result page"
git push origin feature/<your-name>-update
```

然后在 GitHub 发 Pull Request 合并到 `main`。

这样每次合并后，线上 GitHub Pages 会自动更新。

## 当前实现重点

- 单页 5 步演示流程
- 全局状态驱动页面切换
- 中英双语切换
- 样例项目 / 样例材料工作流
- 问题审核与排序
- 结果页报告化展示
- 浏览器打印 / PDF 导出

## 后续可以继续扩展

- 把样例业务内容本身也做成双语数据
- 接入真实后端接口
- 增加登录 / 权限控制
- 增加真实 PDF 模板导出
