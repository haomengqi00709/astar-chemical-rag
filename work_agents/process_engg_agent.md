第一步：接收指令与上下文 (Context Ingestion)
Process Agent 不会凭空开始工作，它必须先读取 PM Agent 产出的“公文包”。

AI 动作： 读取 PM 生成的 Project Summary 和 Document Register。

思考逻辑： “PM 分配给我的任务是完成 1-CAL-6510 (工艺计算)。根据项目摘要，这是一个位于 Toronto 的酸液泵项目，流体是 98% 硫酸。我需要先去 RAG 数据库查找‘硫酸’的物理性质。”

关键输入： 项目地点、流体名称、设计工况。

第二步：确定工艺准则 (Define Design Criteria)
在算具体的泵之前，Process Agent 必须先确定“怎么算”。

AI 动作： 调用模板 1-PRC-0001 (Process Design Criteria)。

思考逻辑： “我需要设定系统的余量。根据公司标准，泵的额定流量应该是正常流量的 110%。同时，我需要确认现场的有效净正吸头（NPSHa）计算公式。”

产出： 填充 1-PRC-0001 中的设计基准（如：裕量要求、压力等级、防腐等级）。

第三步：流体特性识别 (Fluid Mapping)
这是 Process Agent 的专业体现，它需要填充你上传的 1-LST-0002 (Fluid Codes Master List)。

AI 动作： 检索流体清单模板。

思考逻辑： “既然是酸液泵，我查到流体代码应该是 SA (Sulphuric Acid)。我要从数据库中提取该浓度下的密度（Density）、粘度（Viscosity）和饱和蒸汽压（Vapour Pressure）。”

产出： 在 Fluid Codes Master List 中为本项目新增一行，记录该流体的物理特性参数。

第四步：执行水力计算 (Hydraulic Calculation)
这是最核心的“算数”阶段。

AI 动作： 运行 Python 代码脚本（或调用计算插件）。

思考逻辑： “已知流量 Q=100m³/h，管径 D=100mm，计算流速。结合管道长度和弯头数量，得出系统阻力损失（Friction Loss）。最后加上高差压力，得出总扬程（TDH）。”

产出： 生成 1-CAL-6510 (Process Calculation) 的结果摘要：

Rated Flow (额定流量)

Total Dynamic Head (总扬程)

NPSHa (系统有效余量)

第五步：生成“交接数据包” (Handover to Mechanical)
Process Agent 完成了它的物理模型，现在要把这些参数传给 Mechanical Agent 去选型。

AI 动作： 更新 Document Register 状态，并发送 JSON 指令。

输出内容：

向 Mechanical Agent 发送：计算出的 Flow、Head、NPSHa 以及流体属性。

留言： “工艺计算已完成。请根据 85m 扬程和硫酸的腐蚀性进行泵的选型和规格书（Datasheet）制作。”