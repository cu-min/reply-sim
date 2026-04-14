declare const wx: {
  navigateTo(options: { url: string }): void;
  redirectTo(options: { url: string }): void;
  switchTab(options: { url: string }): void;
  reLaunch(options: { url: string }): void;
  showToast(options: { title: string; icon?: "success" | "error" | "none" }): void;
  getStorageSync<T = any>(key: string): T;
  setStorageSync<T = any>(key: string, value: T): void;
};

declare function App<T extends Record<string, any>>(options: T): void;
declare function Page<T extends Record<string, any>>(options: T): void;
declare function getApp<T = any>(): T;

declare namespace WechatMiniprogram {
  interface IAnyObject {
    [key: string]: any;
  }
}
