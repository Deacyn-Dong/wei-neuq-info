//index.js
const onfire = require('../../modules/onfire.js');
const api = require('../../utils/api.js');
const pwx = require('../../utils/pwx.js');
var app = getApp();

Page({
  data: {
    loading: false,
    isThump : false,
    more:true,
    start : 0,
    content:[],
    sessionId : ""
  },
  onLoad: function () {
    var that = this;
    console.log('onload');
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    // var sessionid = wx.getStorageSync('3rd_session');
    pwx.getStorage('3rd_session').then( res => {
      console.log(res);
      that.setData({
        sessionId : res
      });
      that.upDataRequest(res);
    })
    // console.log(sessionid)
    // this.setData({
    //   sessionId : sessionid
    // });
    // this.upDataRequest(sessionid);
  },
  onShow : function () {
    console.log('onshow');
    var that = this;
    //todo
    onfire.on('afterPost',function(){
      console.log('afterPost1');
      wx.showLoading({
        title : '刷新数据',
        mask : true
      });
      that.downDataRequest();
    })
    onfire.on('updateIndexFloor', postId => {
      var content = that.data.content;
      for(var i=0;i<content.length;i++){
        if(content[i].postId == postId){
          ++that.data.content[i].commentCount;
          that.setData({
            content : that.data.content
          });
          break;
        }
      }
    })
    onfire.on('updateIndex',postId => {
      pwx.request({
        url: api.content_api+postId,
        method: 'GET',
        header: {'session' : that.data.sessionId}
      }).then(res=>{
        console.log(res);
        var content = that.data.content;
        for(var i=0;i<content.length;i++){
          if(content[i].postId == postId){
            that.data.content[i] = res.data.content;
            that.setData({
              content : that.data.content
            });
            break;
          }
        }
      })
    })
    onfire.on('deleteIndex', postId => {
      var content = that.data.content;
      for(var i=0;i<content.length;i++){
        if(content[i].postId == postId){
          that.data.content.splice(i,1);
          that.setData({
            content : that.data.content
          });
          break;
        }
      }
    })
  },
  onUnload : function(){
    onfire.un('updateIndex');
    onfire.un('updateIndexFloor');
    onfire.un('deleteIndex');
    onfire.un('afterPost');
  },
  onPullDownRefresh : function(){
    this.data.start = 0;
    this.downDataRequest();
  },
  onReachBottom : function(){
    if(!this.data.loading && this.data.more){
      this.setData({
        loading : true
      });
      this.upDataRequest();
    }
  },
  onShareAppMessage : function(){
    return {
      title : 'neuq_info',
      path : 'pages/index/index',
      success : function(res){
        wx.showToast({
          title: '分享成功',
          icon : 'success',
          duration: 1500
        });
      },
      fail : function(res){
        if(!res.errMsg == "shareAppMessage:fail cancel"){
          wx.showToast({
            title : '分享失败',
            image : '../../images/fail.png',
            duration : 2000
          });
        }else{
          wx.showToast({
            title : '取消分享',
            icon : 'success',
            duration : 1500
          });
        }
      }
    }
  },
  thumpRequest: function(postId){
    var that = this;
    var items = this.data.content;
    var length = items.length;
    for(var i=0;i<length;i++){
      if(items[i].postId == postId){
        var target = items[i];
        if(!target.isThump){
          var flag = target.isLike ? 0 : 1 ;
          pwx.getStorage('3rd_session').then( res => {
            return pwx.request({
              url: api.thump_api+postId+'/'+flag,
              method: 'GET',
              header: {
                'session' : res
              }
            })
          }).then( res => {
            // console.log(res)
            if(res.data.code == 200){
              if(target.isLike){
                target.isLike = 0;
                --target.likeCount;
              }else{
                target.isLike = 1;
                ++target.likeCount;
              }
            }else{
              wx.showToast({
                title:"操作失败",
                image : '../../images/fail.png',
                duration:2000
              });
            }
          })
          .catch( res => {
            wx.showToast({
                title:"请检查网络状况",
                image : '../../images/fail.png',
                duration:2000
            });
          })
          .finally( res => {
            target.isThump = false;
            that.setData({
              content : items
            });
          })
        }
      break;
      }
    }
  },
  changeLike : function(e){
    var postId = e.currentTarget.dataset.id;
    this.thumpRequest(postId);
  },
  upDataRequest: function (session){
    var that = this;
    pwx.getStorage('3rd_session').then( res => {
      var session = session || res;
      console.log('upDataRequest session is ' + session);
      return pwx.request({
        url : api.index_api+that.data.start+"/10",
        method:"GET",
        header: {
          'session': session
        }
      })
    }).then(res => {
      console.log(res)
      if(res.statusCode == 500){
        console.log('服务器故障');
      }
      if(res.data.code == 200){
        var content = res.data.content;
        setTimeout(function () {
          that.setData({
            content: that.data.content.concat(content),
            start: content[content.length-1].postId,
            loading: false,
          });
        }, 500)
      }else if(res.data.code == -1002){
        that.setData({
          more : false,
          loading : false
        })
      } else if (res.data.code == 40008 || res.data.code == 40012 || res.data.code == 40014){
        console.log('1');
        app.getSessionId(that.upDataRequest);
      }
    }).catch( res => {
      wx.showToast({
        title:"加载失败，请检查网络状况",
        image : '../../images/fail.png',
        duration:2000
      })
    }).finally( res => {
      console.log('finally');
      typeof wx.hideLoading == 'function' && wx.hideLoading();
    })
  },
  downDataRequest : function(session){
    var that = this;
    pwx.getStorage('3rd_session').then( res => {
      var session = session || res;
      return pwx.request({
        url : api.index_api+"/0/10",
        method:"GET",
        header: {
          'session': session
        }
      })
    }).then(res => {
      console.log(res);
      if(res.data.code == 200){
        var content = res.data.content;
        setTimeout(function () {
          that.setData({
            content: content,
            start: content[content.length-1].postId,
            loading: false,
          });
        }, 1000)
      }else if(res.data.code == -1002){
        that.setData({
          more : false,
          loading : false
        });
      } else if (res.data.code == 40008 || res.data.code == 40012 || res.data.code == 40014){
        console.log('1');
        app.getSessionId(that.downDataRequest);
      }
    }).catch( res => {
      wx.showToast({
        title:"加载失败，请检查网络状况",
        image : '../../images/fail.png',
        duration:2000
      });
    }).finally( res => {
      console.log('finally');
      typeof wx.hideLoading == 'function' && wx.hideLoading();
      typeof wx.stopPullDownRefresh == 'function' && wx.stopPullDownRefresh();
    })
  }
})