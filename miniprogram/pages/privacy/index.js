Page({
  data: { statusBarHeight: 0 },
  onLoad() {
    const { statusBarHeight = 0 } = wx.getSystemInfoSync();
    this.setData({ statusBarHeight });
  },
  handleBack() { wx.navigateBack(); }
});
