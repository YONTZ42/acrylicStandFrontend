export const galleriesKeys = {
  all: ["galleries"] as const,

  // 全てのリスト・詳細のルートに status と identifier を挟むことで、ユーザー切り替え時の混線を防ぐ
  root: (status: string, identifier: string | null) => 
    [...galleriesKeys.all, { status, identifier }] as const,

  list: (status: string, identifier: string | null) => 
    [...galleriesKeys.root(status, identifier), "list"] as const,

  detail: (status: string, identifier: string | null, id: string) => 
    [...galleriesKeys.root(status, identifier), "detail", id] as const,

  publicBySlug: (slug: string) => [...galleriesKeys.all, "public", slug] as const,
};