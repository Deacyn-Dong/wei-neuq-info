//app.js
const api = require('utils/api.js')
const pwx = require('utils/pwx.js')
const tool = require('utils/tool.js')


App({
  globalData:{
    userInfo:null,
    sessionId : ""
  },
  onLaunch: function () {
    this.checkSession();
  },
  getUserInfo:function(cb){
    var that = this
    if(this.globalData.userInfo){
      console.log(this.globalData.userInfo)
      typeof cb == "function" && cb(this.globalData.userInfo)
    }else{
      //调用登录接口
      // pwx.login().then(res=>{
      //   console.log(res);
      //   return pwx.getUserInfo()
      // }).then(res => {
      //   that.globalData.userInfo = res.userInfo
      //   typeof cb == "function" && cb(that.globalData.userInfo)
      // })
      wx.login({
        success: function (res) {
          // console.log(res);
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      })
    }
  },
  checkSession: function (){
    var that = this;
    pwx.checkSession().then( res => {
      console.log("success1-checkSession")
    }).catch( res => {
      console.log("error1-checkSession")
      that.getSessionId();
    })
  },
  getSessionId : function(fn){
    var that = this;
    pwx.login().then( res => {
      return pwx.request({
        url: api.session_api,
        data : { "code" : res.code},
        method : "GET"
      })
    }).then( res => {
      console.log("success3-post-code")
      console.log("I get sessionId is "+res.data.content.sessionId)
      that.globalData.sessionId=res.data.content.sessionId
      wx.setStorageSync('3rd_session',that.globalData.sessionId)
      console.log("success4-set-storage")
      return pwx.getUserInfo()
    }).then( res => {
      console.log("success5-get-user-info")
      // console.log(res)
      that.globalData.userInfo = res.userInfo;
      var encryptedData = res.encryptedData.replace("/\+/g","%2B");
      // console.log(encryptedData)
      var iv = res.iv.replace("/\+/g","%2B");
      // console.log(iv)
      return pwx.request({
        url: api.decode_user_api,
        data : {"iv":iv, "encryptedData" :encryptedData},
        header: {
          'session': that.globalData.sessionId,
          'Content-Type' : 'application/x-www-form-urlencoded'},
        method : "POST"
      })
    }).finally( res => {
      // console.log(res)
      typeof fn == 'function' && fn(that.globalData.sessionId);
    })
  }
})