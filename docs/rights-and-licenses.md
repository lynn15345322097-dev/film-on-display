# 权利与授权说明

## 分层授权原则

本项目采用三层授权体系，代码、数据、媒体文件各自独立授权：

| 层级 | 范围 | 许可证 |
|---|---|---|
| **代码** | 所有源代码文件（`.tsx`, `.ts`, `.js`, `.css`, `.json` 配置文件） | 见 `LICENSE-CODE` |
| **数据** | `data/` 目录下的博物馆、展览、分类和参考文献数据 | 见 `LICENSE-DATA` |
| **媒体** | `public/images/` 目录下的所有照片和图像文件 | 见 `LICENSE-MEDIA`，以 `data/photos.json` 中每条记录的 `rights` 和 `visibility` 字段为准 |

## 照片授权：逐张授权

本项目中的所有照片不采用统一授权。每张照片的具体授权信息记录在 `data/photos.json` 中对应记录的 `rights` 字段。

### photographer_copyright（摄影师版权）

声明照片拍摄者的著作权。字段说明：

- `holder`：著作权人姓名或机构名称
- `license`：使用的 Creative Commons 许可证或 "All Rights Reserved"
- `commercial_use`：是否允许商业使用
- `derivatives_allowed`：是否允许创作衍生作品
- `attribution_required`：是否需要署名

### institutional_restriction（机构限制）

声明照片所拍摄内容涉及的空间/展品/机构对照片传播的限制。**照片版权（摄影师权利）≠ 展品版权（馆方权利）**。

字段说明：

- `status`：限制状态
  - `unrestricted`：无限制
  - `attribution-only`：仅需署名
  - `non-commercial-research-only`：仅限非商业研究使用
  - `restricted`：受限制
  - `pending`：待确认
- `institution`：提出限制的机构名称
- `download_allowed`：是否允许下载
- `notes`：补充说明

重要提示：
- 即使摄影师采用 CC 开放授权，如果照片中包含博物馆内部展品、图文展板、展览设计等受馆方权利约束的内容，公开传播仍需遵守 `institutional_restriction`。
- 在未获得馆方明确授权前，相关照片的 `institutional_restriction.status` 应设为 `non-commercial-research-only` 或 `pending`。

### personality_rights（肖像权）

声明照片中是否包含可识别个人。字段说明：

- `contains_identifiable_person`：是否包含可识别面部的个人
- `model_release`：肖像授权状态
  - `obtained`：已获得授权
  - `not_obtained`：未获得授权
  - `not_applicable`：不适用（照片中无可识别个人）
  - `pending_verification`：待核实

## visibility（可见性）五种状态

| 状态 | 含义 |
|---|---|
| `public` | 完全公开，可在网站直接查看原图 |
| `public_thumbnail_only` | **默认值**。仅缩略图公开，原图不提供下载 |
| `restricted` | 受限访问，需申请 |
| `private` | 私密，不在线上展示 |
| `internal_research_only` | 仅供项目组内部研究使用 |

新增照片时，`visibility` 默认为 `public_thumbnail_only`。除非已确认照片版权、机构限制和肖像权均允许公开传播，否则不应设为 `public`。

## 数据再使用

`data/` 目录下的结构化数据（不含照片文件本身）以 `LICENSE-DATA` 中指定的许可协议发布。研究者可引用、分析、可视化这些数据，但需遵守以下约定：

1. 引用本项目作为数据源
2. 不将未核实信息（标记为 `pending_verification` 的字段）作为确定事实引用
3. 坐标信息以 `geo.coordinate_source` 字段为准，`pending_verification` 的坐标不应直接用于精确地理分析
