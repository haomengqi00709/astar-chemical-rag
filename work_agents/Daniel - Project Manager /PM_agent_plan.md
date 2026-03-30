第一步：元数据提取（The Identification Phase）
这是 AI 的“读题”阶段。它需要从客户的 Scope of Work (SOW) 中提取出项目的“基因”。

AI 动作： 扫描 SOW，提取关键词。

提取内容： * 项目名称： 例如 "Pump Station Upgrade"。

关键设备： "Centrifugal Pump" (离心泵)。

核心参数： "Flow: 100m³/h", "Pressure: 5 bar"。

验证点： 如果 AI 没提取出“泵”而是提取成了“管道”，第一步就失败了。

第二步：初始化“身份证”（Signature Page Initialization）
根据第一步拿到的信息，AI 必须填充你上传的第一个模板：Signature Page。

AI 动作： 将提取到的 Client Name、Project Title 填入对应单元格。

关键逻辑： AI 必须生成一个符合规范的 Client Document Number（例如根据模板生成的 Standard-0-LST-0001）。

思考点： “既然今天是 2026年3月28日，我应该将 Rev 设为 0，状态设为 'Issued for Review'。”

第三步：任务目录自动生成（Document Register Mapping）
这是最展现“工程大脑”的一步。AI 需要根据项目类型，决定要交出哪些文档。

AI 动作： 检索 RAG 数据库。

思考逻辑： “因为这是一个 Pump 项目，我必须在 Document Register 模板中激活以下行：”

1-CAL-6510 (Process Calculations) —— 指派给 Process。

4-CAL-0001 (Pump Calculations) —— 指派给 Mechanical。

4-DST-XXXX (Pump Data Sheets) —— 指派给 Mechanical。

操作： 将模板中对应的 XXXX 占位符替换为建议的流水号。

第四步：时间表推算（Scheduling Logic）
AI 像人一样考虑先后顺序，而不是胡乱填日期。

AI 动作： 填充 Document Register 中的 Planned Date。

推算逻辑： * 设定项目结束日期（如 2026-05-01）。

倒推： Mechanical 需要 Process 的数据，所以 Process 的计算书必须在 4月10日 前交，Mechanical 的数据表在 4月20日 前交。

检查点： 确保没有出现“逻辑倒挂”（比如要求 Mechanical 先于 Process 提交）。

第五步：生成指令包（Handover Dispatch）
PM Agent 完成了规划，现在要正式“叫人干活”。

AI 动作： 产出一个结构化的 JSON 或消息。

输出内容：

向 Process Agent 发送：项目背景 + 需要填充的 1-PRC-0001 (Design Criteria) 模板。

向 Mechanical Agent 发送：等待信号（等待 Process 计算完成）。

归档： 将更新后的 Document Register 保存，作为 AuditBot 后续审计的基准线。