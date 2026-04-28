# System Pipeline Map
**Hunters.ai — Engineering Knowledge Platform**
*内部沟通文档 / Internal Reference*

---

## 系统架构概览

```
┌─────────────────────────────────────────────────────────────┐
│                        用户浏览器                            │
│          Demo App (React)      New App (React)               │
└────────────────┬───────────────────────┬────────────────────┘
                 │ HTTP / API calls       │
                 ▼                        ▼
┌─────────────────────────────────────────────────────────────┐
│               server.js  (Node.js / Express)                │
│                    统一后端，端口 3001                        │
└──────┬──────────────┬──────────────────┬────────────────────┘
       │              │                  │
       ▼              ▼                  ▼
  agent.py       pm_agent.py        orchestrator.py
  wiki_kb/       process_agent.py   (用户项目建索引)
  (RAG查询)      mechanical_agent.py
                 (工程师 Agent 工作流)
```

---

## Pipeline 1 — Demo App：RAG 问答

**触发方式：** 用户在 Query 页面输入问题

```
用户输入问题
    │
    ▼
POST /api/query
    │
    ▼
server.js → 调用 Python: agent.py --json "{question}"
    │
    ├── 加载 ChromaDB 向量库（预建，Docker Layer 5）
    ├── 检索相关文档 chunks
    ├── 识别 /slash command → 强制调用对应 skill
    ├── 调用 Google Gemini API 生成回答
    └── 返回 JSON：{ answer, sub_questions, sources, reviewer_notes }
    │
    ▼
前端渲染：回答 + 来源文件 + 子问题 + 审阅备注
```

**涉及文件：**
- `agent.py` — 主 RAG 入口
- `skills/` — 各技能 Python 脚本
- `chroma_db/` — 向量数据库（预建）
- `parsed_chunks.json` — 知识库原始 chunks

---

## Pipeline 2 — Demo App：Skills 管理

**触发方式：** 用户在 Skills 页面创建/部署新技能

```
用户描述需求（自然语言）
    │
    ▼  AI Refine（Gemini）
需求精炼 → 生成 Python 代码
    │
    ▼
用户确认代码
    │
    ▼
POST /api/skills/deploy
    │
    ├── 写入 skills/{skill_name}.py
    └── 更新 skills/__init__.py（注册到 agent）
    │
    ▼
技能立即可在 Query 中通过 /skill_name 调用
```

**涉及文件：**
- `skills/` — 所有技能脚本目录
- `skills/__init__.py` — 技能注册表

---

## Pipeline 3 — Demo App：AI Agent 工程项目工作流

**触发方式：** 用户上传 SOW（工作说明书）创建新项目

```
上传 SOW (PDF/Word/Excel)
    │
    ▼
POST /api/agents/pm
    │
    ▼
pm_agent.py --json
    ├── 解析 SOW 内容
    ├── 调用 Gemini 生成：
    │     - Project Summary（项目概要）
    │     - Document Register（文件清单，含责任人和计划日期）
    │     - Sessions Config（会议议程）
    └── 写入 projects_store.json
    │
    ▼
用户在 Dashboard 看到项目 + 文件清单
    │
    ├─────────────────────────────────────────────────────────┐
    ▼                                                         ▼
POST /api/agents/process                          POST /api/agents/mechanical
    │                                                         │
    ▼                                                         ▼
process_agent.py（逐步运行）                    mechanical_agent.py
    ├── Step 1: 流体属性                              ├── 泵选型计算
    ├── Step 2: 设计条件                              ├── 水力计算
    ├── Step 3: 压降计算                              └── 生成计算书 JSON
    └── Step 4: 计算书汇总
    │
    ▼
deliverables 写入 projects_store.json
    │
    ▼
用户操作：
    ├── 编辑交付物内容
    ├── POST /api/projects/:id/deliverable-chat  → AI 对话修改
    ├── PUT /api/projects/:id/doc-status         → 更新状态 (Draft/Pending/Published)
    ├── POST /api/projects/:id/comment           → 添加评论
    ├── POST /api/projects/:id/summarize-deliverables → 生成 AI 执行摘要（可多版本）
    ├── POST /api/projects/:id/export-docx       → 导出 Word 文件
    └── PUT /api/projects/:id/complete           → 标记项目完成
                                                      │
                                                      ▼
                                          进入 Library → Reference Projects
```

**涉及文件：**
- `work_agents/Daniel - Project Manager/pm_agent.py`
- `work_agents/Aria - Process Engineer/process_agent.py`
- `work_agents/Hunter - Mechanical Engineer/mechanical_agent.py`
- `work_agents/Daniel - Project Manager/projects_store.json` — 所有项目数据

---

## Pipeline 4 — Demo App：Knowledge Graph

**触发方式：** 用户进入 Knowledge Graph 页面

```
GET /api/wiki/graph
    │
    ▼
server.js 读取预建 wiki 页面
    ├── 解析各页面的 links（节点间关系）
    └── 返回 { nodes, edges, meta }
    │
    ▼
前端 KnowledgeGraph.tsx
    ├── 力导向图渲染（Canvas）
    ├── 按学科分色（6种：行政/流程/设备/管道/仪表/电气）
    ├── 节点点击 → 显示关联页面
    ├── 过滤器（按学科 / 按来源文件）
    └── 缩放、平移交互
```

**涉及文件：**
- `wiki_kb/` — 预建 wiki 页面目录

---

## Pipeline 5 — New App：用户注册与认证

**触发方式：** 新客户首次使用

```
用户访问 /setup
    │
    ▼
POST /api/app/setup
    │
    ├── 创建 Company 记录（company_id, name, slug）
    ├── 创建 Admin User 记录（email, password_hash）
    ├── 写入 app_db.json（Railway Volume: /app/data/app_db.json）
    └── 返回 JWT token
    │
    ▼
用户登录状态持久化（localStorage）

─── 忘记密码流程 ────────────────────────────────────────────

用户点 "Forgot password?" → 输入邮箱
    │
    ▼
POST /api/app/auth/forgot-password
    ├── 生成 32字节随机 token（1小时有效）
    ├── 存入 app_db.json → reset_tokens[]
    └── 调用 Resend API → 发送重置邮件
         from: noreply@trustedaiadvisory.ca
    │
    ▼
用户点邮件链接 → /reset-password?token=xxx
    │
    ▼
POST /api/app/auth/reset-password
    ├── 验证 token 有效性 + 过期时间
    ├── 更新 user.password_hash
    └── 删除已用 token
```

**涉及文件：**
- `app_db.json`（Railway Volume `/app/data/`）— 用户/公司数据
- Resend API — 邮件发送服务

---

## Pipeline 6 — New App：客户自建知识库

**触发方式：** 客户上传自己的工程文件

```
用户创建新知识库项目
    │
    ▼
POST /api/user-projects
    ├── 生成 project_id (uproj_xxxxxx)
    └── 创建目录结构：
         user_projects/{id}/
         ├── source/     ← 原始上传文件
         ├── wiki/       ← 生成的 wiki 页面
         └── status.json

用户上传文件
    │
    ▼
POST /api/user-projects/:id/files (multipart)
    ├── multer 接收文件 → 存入 source/
    └── 写入 manifest.json（文件清单）

用户点击 "Build Knowledge Base"
    │
    ▼
orchestrator.py {project_dir}
    ├── 解析文件（PDF/Word/Excel → text chunks）
    ├── 调用 Gemini Embeddings → 向量化
    ├── 建立 ChromaDB 向量库（per-project）
    ├── 生成 Wiki 页面（Markdown）
    └── 生成知识图谱数据
    │
    ▼
完成后用户可以：
    ├── GET /api/user-projects/:id/query → 问答（同 Pipeline 1）
    ├── GET /api/user-projects/:id/wiki-files → 查看 Wiki
    ├── GET /api/user-projects/:id/graph → 知识图谱
    └── GET /api/user-projects/:id/manifest → 文件清单
```

**涉及文件：**
- `wiki_kb/src/orchestrator.py` — 知识库构建主脚本
- `user_projects/{id}/` — 每个客户独立目录（Railway Volume `/app/data/`）

---

## 数据存储总览

| 数据类型 | 存储位置 | 持久化 |
|---------|---------|--------|
| Demo 知识库（向量） | `chroma_db/` | Docker 镜像内（Layer 5） |
| Demo Wiki 页面 | `wiki_kb/` | Docker 镜像内 |
| Demo 项目数据 | `work_agents/.../projects_store.json` | Docker 镜像内 |
| 客户账号/公司信息 | `/app/data/app_db.json` | Railway Volume ✓ |
| 客户上传文件 + 知识库 | `/app/data/user_projects/` | Railway Volume ✓ |
| Reset Token | `/app/data/app_db.json` → reset_tokens[] | Railway Volume ✓ |

---

## 环境变量

| 变量名 | 用途 | 设置位置 |
|--------|------|---------|
| `GOOGLE_API_KEY` | Gemini AI（问答/Agent/Embedding） | Railway + .env |
| `RESEND_API_KEY` | 密码重置邮件发送 | Railway + .env |
| `JWT_SECRET` | 用户 token 签名 | Railway（建议设置） |
| `DATA_DIR` | 持久化数据根目录 | Railway = `/app/data` |
| `APP_URL` | 邮件中重置链接的域名 | 本地测试用，生产自动检测 |

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 19 + TypeScript + Vite + Tailwind CSS |
| 后端 | Node.js + Express |
| AI 模型 | Google Gemini (gemini-2.0-flash / embedding-004) |
| 向量数据库 | ChromaDB |
| 邮件服务 | Resend |
| 部署 | Railway（Docker） |
| 持久存储 | Railway Volume |
