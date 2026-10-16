# Claude 中国版（Claude China Edition）

> 一个娱乐模拟项目：**如果 Claude 入乡随俗，学会了签到、砍一刀、摇一摇、红包雨这一整套运营玩法，它会变成什么样子？**

非官方娱乐模拟网站，与 Anthropic 无关联。所有广告、支付、奖励、会员均为模拟功能，不产生真实交易；所有数据仅保存在浏览器本地（localStorage）。

## 界面形态

主体是 **Claude 官网式的对话应用**：

- 左侧边栏：新对话、对话历史（多会话）、福利中心、金币余额、会员入口
- 居中问候语 + 大输入框（模型选择 / 联网搜索 / 深度思考 / 文件上传）
- 多轮对话、Markdown 渲染、代码块复制、重新生成、流式打字机效果
- 对话额度用完时，弹出「客官，您的智慧余额不足！」回血弹窗

中国特色玩法作为「获取对话次数与金币」的周边系统：

| 玩法 | 说明 |
| --- | --- |
| 看广告 | 观看 30 秒模拟广告，得 5 次对话，每日 5 次 |
| 每日签到 | 7 天奖励循环（10/10/20/20/30/30/50 金币） |
| 砍一刀 | 好友助力砍到 0 元，免费领 30 天「尊享会员」 |
| 摇一摇 | 每日 3 次，支持手机体感（DeviceMotion） |
| 每日任务 | 6 个任务赚金币，与全站数据联动 |
| 幸运大转盘 | 每天 1 次免费抽奖，8 种奖品 |
| 红包雨 | 15 秒全屏手速大战 |
| 金币商城 | 金币兑换对话次数 / 会员体验 |

## 页面结构（多页面路由）

| 路由 | 内容 |
| --- | --- |
| `/` | Claude 式对话主界面 |
| `/activities` | 活动广场：看广告 / 砍一刀 / 摇一摇 / 大转盘 / 红包雨 |
| `/tasks` | 任务中心：每日签到 + 每日任务 |
| `/shop` | 金币商城 + 尊享会员 |
| `/paint` | AI 绘画（模拟生成） |
| `/about` | 关于与免责声明 |

## 技术栈

React 19 · TypeScript · Vite · Tailwind CSS v4 · Framer Motion · Zustand（localStorage 持久化）· React Router · Lucide Icons

## 本地开发

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # 类型检查 + 产物构建
npm run preview  # 预览构建产物
```

## 部署（GitHub Pages）

推送至 `main` 分支后，GitHub Actions 自动构建并部署：

- 工作流：`.github/workflows/deploy.yml`
- 通过 `VITE_BASE_PATH=/<repo>/` 注入子路径 base，并用 `404.html` 做 SPA 回退
- 在仓库 Settings → Pages 中将 Source 设置为 **GitHub Actions** 即可

## 免责声明

本项目仅用于娱乐与讽刺性创意表达。Claude 及相关名称的引用不构成与 Anthropic 的任何关联；
站内出现的「广告」「支付」「会员」「好友助力」全部为本地模拟，不存在任何真实的资金、账号或隐私数据。
