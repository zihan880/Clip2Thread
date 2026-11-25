# Clip2Thread 商业化升级报告（2026-11-25）

## 改动文件清单
| 文件 | 改动 |
| --- | --- |
| `src/app/page.tsx` | 加 "Try a sample script" 按钮（约200词英文创业访谈示例脚本）；输入框下加 English 提示；免费额度 localStorage 计数（每访客2次）+ 剩余次数显示；用完点 Generate 弹 "Upgrade to Clip2Thread Pro" 弹窗（$15/月）；Subscribe Now 读 `NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL`，未配置显示 "Checkout opening soon — contact support@dingsheng.cyou for early access"；Footer 加 Privacy Policy \| Terms & Refunds \| support@dingsheng.cyou 链接 |
| `src/app/privacy/page.tsx` | 新增隐私政策静态页（仅处理用户提交内容、不出售数据、第三方AI与支付商说明） |
| `src/app/terms/page.tsx` | 新增服务条款+退款政策静态页（未消耗额度7天无理由退款） |
| `src/app/api/generate/route.ts` | 后端 IP 频率防刷：内存 Map 滑窗，每 IP 每小时 10 次，超限返回 429 |
| `src/app/api/webhook/lemonsqueezy/route.ts` | 新增 webhook 骨架：HMAC-SHA256 签名校验（`LEMONSQUEEZY_WEBHOOK_SECRET`，timingSafeEqual），事件分发骨架 |

## Build 结果（npm run build 最后 10 行）
```
┌ ○ /                                    12.2 kB         106 kB
├ ○ /_not-found                          873 B          88.1 kB
├ ƒ /api/generate                        0 B                0 B
├ ƒ /api/webhook/lemonsqueezy            0 B                0 B
├ ○ /privacy                             178 B          94.2 kB
└ ○ /terms                               178 B          94.2 kB
+ First Load JS shared by all            87.2 kB
  ├ chunks/117-17592786d07836ac.js       31.6 kB
  ├ chunks/fd9d1056-d1cbe45dbb83a69a.js  53.6 kB
  └ other shared chunks (total)          1.96 kB
```
构建零报错，生成/PNG 导出逻辑未改动。

## 部署提示
- 结算开通后在 `.env`/托管平台设置 `NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL`，Subscribe 按钮即自动启用。
- 在 Lemon Squeezy 后台配置 webhook 指向 `/api/webhook/lemonsqueezy`，并设置 `LEMONSQUEEZY_WEBHOOK_SECRET`。
