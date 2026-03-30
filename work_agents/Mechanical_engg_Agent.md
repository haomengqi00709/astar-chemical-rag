第一步：同步工艺边界 (Sync with Process Results)
Mechanical Agent 不直接算流体，它直接拿 Process 的“计算包”作为设计的边界条件。

AI 动作： 读取 Process Agent 产出的 1-CAL-6510 (工艺计算) 和 1-LST-0002 (流体特性)。

思考逻辑： “Process 告诉我需要 85m 的扬程，且介质是 98% 硫酸。这意味着我不能选择普通碳钢泵，必须选耐腐蚀的合金或内衬泵。我还需要确认吸入端的压力，以确保选型的泵不会发生气蚀。”

关键输入： Rated Flow, TDH, NPSHa, Fluid Density, Viscosity, Corrosion allowance.

第二步：执行设备性能核算 (Equipment Performance Calculation)
这是 Mechanical Agent 的核心算法阶段，决定了泵的驱动功率和具体选型。

AI 动作： 使用内部计算脚本（或调用专门的泵计算模板）。

思考逻辑： “基于 50 m³/h 和 85m 扬程，假设泵的效率为 70%，计算轴功率。考虑到硫酸的密度比水大，我需要根据比重（Specific Gravity）调整电机功率，并增加 15%~25% 的安全系数。”

产出： * Motor Power (电机功率)

Pump Speed (转速)

Impeller Diameter (叶轮直径建议)

第三步：生成设备规格书 (Datasheet Generation)
这是最关键的交付物之一，AI 需要填充你提到的模板。

AI 动作： 打开 4-DST-XXXX (Pump Data Sheets) 模板。

思考逻辑： “我需要将所有的物理参数、材料选择（如：内衬材质）、密封要求（Mechanical Seal）填入规格书。同时，我要引用 PM 在 Signature Page 中定义的项目编号。”

产出： 填充完整的 Pump Datasheet。

第四步：整合招标包 (Issue a Bid Package)
这是 Mechanical Agent 作为“交付者”的最后一步。

AI 动作： 收集所有相关文档，套用 Bid Package Template。

思考逻辑： “一个完整的招标包需要：1. 我的 Datasheet；2. 泵的通用技术标准（如 4-SPC-0002）；3. PM 的项目说明。我要确保这些文件版本一致，没有冲突。”

产出： Technical Bid Package (技术招标文件)。

第五步：状态反馈与归档 (Final Feedback)
任务完成后，反馈给 PM Agent 闭环。

AI 动作： 在 Document Register 中将 4-CAL 和 4-DST 标记为 Completed。

输出内容：

向 PM Agent 发送：设备招标包已就绪。

备注： “已根据工艺要求的强酸环境选定不锈钢内衬泵，电机功率设定为 22kW。”