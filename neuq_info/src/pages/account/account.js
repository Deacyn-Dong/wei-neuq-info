var app = getApp()
Page({
  data: {
    text: "Page profiles",
    grids: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    userInfo: {}
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
    app.getUserInfo(function (userInfo) {
      that.setData({
        userInfo: userInfo
      })
    });
    // console.log(that.data.userInfo)
  },
  bindViewTap: function (e) {
    var film = e.currentTarget;
    wx.navigateTo({
      url: '../topfilm/topfilm'
    })
  }
})