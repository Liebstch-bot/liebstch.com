export type DemoApplication = {
  id: string;
  company: string;
  roleTitle: string;
  city: string;
  stage: "wishlist" | "applied" | "assessment" | "interview" | "offer";
  priority: 0 | 1 | 2;
  statusNote: string;
  appliedAt: string | null;
  deadlineAt: string | null;
  nextAction: string;
  nextActionAt: string | null;
};

export type DemoInterview = {
  id: string;
  applicationId: string;
  company: string;
  title: string;
  startsAt: string;
  timezone: string;
  location: string;
  offsets: number[];
  status: "scheduled" | "sent";
};

export type DemoPost = {
  id: string;
  title: string;
  excerpt: string;
  company: string;
  roleTitle: string;
  city: string;
  companyCategory: "central_soe" | "big_tech" | "manufacturing" | "fmcg" | "foreign" | "finance" | "ai_startup" | "other";
  author: string;
  authorHandle: string;
  publishedAt: string;
  tags: string[];
  likes: number;
  comments: number;
  featured?: boolean;
};

export const demoApplications: DemoApplication[] = [
  { id: "app-1", company: "腾讯", roleTitle: "AI 产品经理培训生", city: "成都", stage: "interview", priority: 0, statusNote: "一面已完成，等待二面安排", appliedAt: "2026-09-03", deadlineAt: null, nextAction: "准备二面项目复盘", nextActionAt: "2026-09-18" },
  { id: "app-2", company: "字节跳动", roleTitle: "策略产品经理 · 抖音生活服务", city: "成都", stage: "assessment", priority: 0, statusNote: "在线测评已提交", appliedAt: "2026-09-05", deadlineAt: "2026-09-22", nextAction: "确认测评结果", nextActionAt: "2026-09-20" },
  { id: "app-3", company: "美团", roleTitle: "AI 产品 Builder", city: "成都", stage: "applied", priority: 0, statusNote: "等待业务筛选", appliedAt: "2026-09-08", deadlineAt: "2026-10-31", nextAction: "准备 AI Native 案例", nextActionAt: "2026-09-25" },
  { id: "app-4", company: "MiniMax", roleTitle: "大模型产品经理 · 开放平台", city: "北京 / 上海", stage: "wishlist", priority: 1, statusNote: "岗位匹配度高，优先投递", appliedAt: null, deadlineAt: "2026-09-28", nextAction: "完成网申并定制项目描述", nextActionAt: "2026-09-21" },
  { id: "app-5", company: "京东", roleTitle: "TET 管培生 · 综合方向", city: "北京", stage: "offer", priority: 0, statusNote: "二面结束，等待最终结果", appliedAt: "2026-08-29", deadlineAt: null, nextAction: "跟进 Offer 决策进度", nextActionAt: "2026-09-19" },
  { id: "app-6", company: "成都银行", roleTitle: "管理培训生", city: "成都", stage: "wishlist", priority: 1, statusNote: "网申阶段", appliedAt: null, deadlineAt: "2026-10-15", nextAction: "整理金融行业经历", nextActionAt: "2026-09-26" },
];

export const demoInterviews: DemoInterview[] = [
  { id: "int-1", applicationId: "app-1", company: "腾讯", title: "AI 产品经理二面", startsAt: "2026-09-19T06:30:00.000Z", timezone: "Asia/Shanghai", location: "线上会议", offsets: [1440, 120], status: "scheduled" },
  { id: "int-2", applicationId: "app-5", company: "京东", title: "TET 终面沟通", startsAt: "2026-09-20T02:00:00.000Z", timezone: "Asia/Shanghai", location: "北京总部", offsets: [1440], status: "scheduled" },
  { id: "int-3", applicationId: "app-2", company: "字节跳动", title: "产品笔试", startsAt: "2026-09-22T05:00:00.000Z", timezone: "Asia/Shanghai", location: "在线测评", offsets: [1440, 120], status: "sent" },
];

export const demoPosts: DemoPost[] = [
  { id: "post-1", title: "腾讯 AI 产品培训生一面复盘：问题比答案更重要", excerpt: "整场面试围绕 AI 产品判断、用户价值和跨团队协作展开。我把 40 分钟里真正被追问的三个点整理出来，并附上自己的回答结构。", company: "腾讯", roleTitle: "AI 产品经理培训生", city: "成都", companyCategory: "big_tech", author: "林一", authorHandle: "linyi", publishedAt: "2026-09-16T10:20:00.000Z", tags: ["AI产品", "一面复盘", "成都"], likes: 86, comments: 24, featured: true },
  { id: "post-2", title: "美团 AI 产品 Builder 网申到笔试全流程时间线", excerpt: "从投递到收到笔试一共 7 天。记录岗位筛选偏好、笔试结构和我认为最值得提前准备的案例。", company: "美团", roleTitle: "AI 产品 Builder", city: "成都", companyCategory: "big_tech", author: "阿泽", authorHandle: "aze", publishedAt: "2026-09-15T08:45:00.000Z", tags: ["美团", "笔试", "产品经理"], likes: 61, comments: 18 },
  { id: "post-3", title: "MiniMax 开放平台产品岗 JD 拆解", excerpt: "岗位看似强调模型，实际更看重 API 场景设计、开发者体验和商业化理解。分享我拆解后重新组织项目经历的方式。", company: "MiniMax", roleTitle: "大模型产品经理", city: "上海", companyCategory: "ai_startup", author: "Mia", authorHandle: "mia_ai", publishedAt: "2026-09-14T14:10:00.000Z", tags: ["大模型", "JD拆解", "产品"], likes: 103, comments: 31 },
  { id: "post-4", title: "京东 TET 管培生二面：供应链案例怎么答", excerpt: "二面有一个开放型经营案例，面试官更关注拆解过程和取舍，而不是标准答案。完整复盘和追问路径如下。", company: "京东", roleTitle: "TET 管培生", city: "北京", companyCategory: "big_tech", author: "Yuki", authorHandle: "yuki_jd", publishedAt: "2026-09-12T12:00:00.000Z", tags: ["京东", "管培生", "终面"], likes: 48, comments: 12 },
  { id: "post-5", title: "成都互联网产品岗秋招信息汇总与节奏建议", excerpt: "整理腾讯、阿里、美团、字节等在成都的岗位开放节奏，并给出 P0/P1/P2 的行动优先级。", company: "多家", roleTitle: "产品 / 运营", city: "成都", companyCategory: "big_tech", author: "西区求职者", authorHandle: "west_job", publishedAt: "2026-09-10T03:30:00.000Z", tags: ["成都", "岗位汇总", "秋招节奏"], likes: 135, comments: 42 },
  { id: "post-6", title: "中国移动四川公司校招流程：从网申到 AI 面试", excerpt: "央国企更重视稳定性、岗位理解和综合表达。记录四川移动的网申节点、笔试形式与面试追问。", company: "中国移动四川公司", roleTitle: "市场类 / 产品", city: "成都", companyCategory: "central_soe", author: "西西", authorHandle: "xixi_cd", publishedAt: "2026-09-09T09:00:00.000Z", tags: ["央国企", "运营商", "成都"], likes: 44, comments: 15 },
  { id: "post-7", title: "制造业秋招怎么准备？宁德时代供应链岗位拆解", excerpt: "制造业面试很关注现场问题、数据意识和跨部门推进能力。分享供应链岗位的案例准备方法。", company: "宁德时代", roleTitle: "供应链管理", city: "宁德", companyCategory: "manufacturing", author: "Aaron", authorHandle: "aaron_mfg", publishedAt: "2026-09-08T11:20:00.000Z", tags: ["制造业", "供应链", "案例面试"], likes: 37, comments: 9 },
  { id: "post-8", title: "联合利华市场管培生终面：如何讲品牌增长", excerpt: "快消终面喜欢追问品牌指标、消费者洞察和渠道策略。我把准备框架和现场追问整理在这里。", company: "联合利华", roleTitle: "市场管培生", city: "上海", companyCategory: "fmcg", author: "Vera", authorHandle: "vera_fmcg", publishedAt: "2026-09-07T13:40:00.000Z", tags: ["快消", "市场管培", "终面"], likes: 72, comments: 21 },
  { id: "post-9", title: "宝洁八大问之外，外企面试更看重什么", excerpt: "外企面试不只考结构化表达，也会观察 ownership、逻辑一致性和跨文化协作意识。", company: "宝洁", roleTitle: "品牌管理", city: "广州", companyCategory: "foreign", author: "Kiki", authorHandle: "kiki_global", publishedAt: "2026-09-06T07:10:00.000Z", tags: ["外企", "宝洁", "行为面试"], likes: 94, comments: 27 },
  { id: "post-10", title: "招商银行成都分行管培生笔试与群面复盘", excerpt: "从网申、笔试到群面，银行招聘节奏和考察重点与互联网完全不同。记录完整时间线。", company: "招商银行成都分行", roleTitle: "市场营销 / 运营", city: "成都", companyCategory: "finance", author: "小满", authorHandle: "xiaoman_bank", publishedAt: "2026-09-05T02:30:00.000Z", tags: ["金融银行", "管培生", "群面"], likes: 58, comments: 16 },
];

export const demoAdminUsers = [
  { name: "林一", email: "linyi@example.com", role: "用户", status: "正常", joined: "2026-09-01", posts: 4 },
  { name: "阿泽", email: "aze@example.com", role: "用户", status: "正常", joined: "2026-09-03", posts: 2 },
  { name: "Mia", email: "mia@example.com", role: "版主", status: "正常", joined: "2026-09-05", posts: 8 },
  { name: "测试账号", email: "spam@example.com", role: "用户", status: "已封禁", joined: "2026-09-12", posts: 1 },
];

export const demoEmailLogs = [
  { recipient: "linyi@example.com", subject: "提前 1 天：腾讯 · AI 产品经理二面", status: "已送达", providerId: "re_8c1f...", createdAt: "2026-09-18 06:30" },
  { recipient: "linyi@example.com", subject: "提前 2 小时：腾讯 · AI 产品经理二面", status: "待发送", providerId: "—", createdAt: "2026-09-19 04:30" },
  { recipient: "aze@example.com", subject: "提前 1 天：京东 · TET 终面沟通", status: "失败重试", providerId: "re_2b9c...", createdAt: "2026-09-19 02:00" },
];



