export const COMPANY_CATEGORIES = [
  { id: "central_soe", label: "央国企", short: "央国企", description: "央企、国企、事业单位与公共服务" },
  { id: "big_tech", label: "互联网大厂", short: "大厂", description: "综合互联网与头部科技公司" },
  { id: "manufacturing", label: "制造业", short: "制造", description: "智能制造、汽车、能源与工业" },
  { id: "fmcg", label: "快消企业", short: "快消", description: "食品饮料、日化与零售消费" },
  { id: "foreign", label: "外企", short: "外企", description: "跨国公司、咨询与全球业务" },
  { id: "finance", label: "金融银行", short: "金融", description: "银行、券商、保险与金融科技" },
  { id: "ai_startup", label: "AI / 创业公司", short: "AI 创业", description: "大模型、AI 产品与 early-stage 团队" },
  { id: "other", label: "其他", short: "其他", description: "教育、医疗、文化传媒与其他行业" },
] as const;

export type CompanyCategory = (typeof COMPANY_CATEGORIES)[number]["id"];

export function getCompanyCategory(id: string | null | undefined) {
  return COMPANY_CATEGORIES.find((category) => category.id === id) ?? COMPANY_CATEGORIES[COMPANY_CATEGORIES.length - 1];
}
