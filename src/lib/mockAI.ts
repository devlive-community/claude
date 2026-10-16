import { pick } from './utils'

export interface ReplyOptions {
  web?: boolean
  deep?: boolean
  file?: string
}

const POEM = `**《上工吟》**

晨光熹微入工位，
咖啡一盏慰平生。
产品三改需求在，
代码千行bug生。

莫愁额度用将尽，
且看广告换五更。
若问 AI 何所似，
一柄折扇话人情。`

const CODE = `好的客官，一份**Python 快速排序**请收好：

\`\`\`python
def quick_sort(arr: list[int]) -> list[int]:
    """快速排序（模拟 AI 出品，附赠注释）"""
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    mid = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quick_sort(left) + mid + quick_sort(right)

print(quick_sort([3, 6, 1, 8, 2, 9, 4]))
# 输出: [1, 2, 3, 4, 6, 8, 9]
\`\`\`

小提示：本站所有代码均为演示用途，运行前请自行审查。若想解锁更多对话次数，可以看看广告或者摇一摇～`

const COPYWRITING = `收到！这就为您献上文案（模拟创作）：

### 方案一 · 走心版
> 生活不止眼前的 KPI，还有秋天的第一杯奶茶和马上到账的金币。

### 方案二 · 效率版
1. 早起第一件事：签到领金币
2. 通勤路上：摇一摇碰运气
3. 睡前最后一件事：看广告攒额度

需要更长版本、英文版或者更皮一点的语气，尽管吩咐，本次回复**不计入对话次数**的话——那就当计入了，反正模拟的。`

const GREETING = `客官安好！我是 Claude，入乡随俗版。

在这里我可以帮您：
- **写文案、改邮件、出主意**
- **写代码、debug、讲算法**
- 聊聊人间烟火与诗和远方

对了，今天剩余的免费对话可得省着点用，用完了记得看广告、摇一摇、邀请好友补充弹药～`

const DEFAULTS = [
  `这个问题问得好！让我认真想一想（模拟思考 0.3 秒）——

结论是：**可行，但有更好的办法。**

1. 先明确目标，避免南辕北辙
2. 把大任务拆成小步骤，每步可验证
3. 遇到瓶颈时，换个角度或者换个模型

需要我针对某一步展开细讲吗？`,
  `客官，这题我熟！

先说结论：**值得做，但要讲究方法。**

- 短期看：见效最快的是先把手头的事自动化
- 中期看：建立自己的模板库和素材库
- 长期看：让工具为您打工，而不是相反

以上建议免费赠送，本次对话消耗 1 次额度，童叟无欺～`,
  `让我用三段论回答您：

1. **是什么**：一件听起来复杂、做起来简单的事
2. **为什么**：因为大部分复杂度都来自「没有开始」
3. **怎么办**：从最小可行版本做起，一周后再看

> 温馨提示：深度思考功能是模拟的，但我的态度是认真的。`,
  `客官这个问题，让我想起一句古话：磨刀不误砍柴工。

我的建议是分三步走：

### 第一步 · 摸清现状
花十分钟把目标写下来，比空想一小时管用。

### 第二步 · 快速试错
用最小成本验证方向，跑不通就换路。

### 第三步 · 复盘迭代
每周回头看一次，把经验沉淀下来。

需要更具体的方案，欢迎继续追问～`,
]

export function generateReply(prompt: string, opts: ReplyOptions = {}): string {
  let body: string
  const p = prompt.toLowerCase()

  if (/代码|code|函数|python|快排|排序|react|组件|bug|debug|算法/.test(p)) body = CODE
  else if (/诗|词|写一首|赋/.test(p)) body = POEM
  else if (/周报|文案|邮件|朋友圈|广告词|标题/.test(p)) body = COPYWRITING
  else if (/你好|您好|hi|hello|在吗|嗨|早上好|晚上好/.test(p)) body = GREETING
  else body = pick(DEFAULTS)

  if (opts.file) {
    body = `已收到您上传的《${opts.file}》（模拟），我假装逐字阅读了一遍：\n\n---\n\n${body}`
  }
  if (opts.deep) {
    body = `> **深度思考中（模拟）**：我先拆解了问题的三层结构——现象层、原因层、方法层；又从三个角色视角审视了一遍：用户、产品、运营。嗯，结论稳了。\n\n${body}`
  }
  if (opts.web) {
    body = `${body}\n\n---\n*已联网搜索（模拟）：参考了 3 个虚构来源，权威度存疑，仅供娱乐。*`
  }
  return body
}
