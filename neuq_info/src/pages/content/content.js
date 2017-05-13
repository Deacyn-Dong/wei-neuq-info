//content.js
const onfire = require('../../modules/onfire.js')
const pwx = require("../../utils/pwx.js")
const api = require('../../utils/api.js')

const app = getApp()
Page({
  data:{
    text:"Page content",
    userInfo: {},
    content : {},
    comment : [],
    moreComment : true,
    isThump : false,
    sessionId : '',
    postId : 0
  },
  onLoad:function(options){
    var that = this;
    this.data.postId = options.postId;
    wx.setNavigationBarTitle({
      title : "第"+ this.data.postId +"条帖子"
    })
    app.getUserInfo(function (userInfo) {
      that.setData({
        userInfo: userInfo
      })
    });
    wx.showNavigationBarLoading();
    var that = this;
    wx.getStorage({
      key: '3rd_session',
      success: function(res){
        console.log("getStorage sessionid is"+res.data)
        that.setData({
          sessionId : res.data
        })
        that.contentRequest();
        that.commentRequest();
        // todo
        wx.hideNavigationBarLoading();
      }
    })
  },
  onShow : function(){
    var that = this;
    onfire.on('updateContent1',function(){
      that.commentRequest()
      that.contentRequest()
    })
    onfire.on('updateContent2', function () {
      that.commentRequest()
    })
  },
  onUnload : function(){
    onfire.un('updateContent1')
    onfire.un('updateContent2')
  },
  onPullDownRefresh : function(){
    this.contentRequest()
    this.commentRequest()
  },
  deleteTap : function(res){
    console.log(res)
    var that = this;
    var commentId= res.currentTarget.dataset.commentid;
    wx.showModal({
      title : '提示',
      content : '是否删除评论',
      success : function(res){
        if(res.confirm){
          pwx.request({
            url : api.delete_comment_api+commentId,
            method : 'POST',
            header : { 'session' : that.data.sessionId}
          }).then( res => {
            that.commentRequest()
          })
        }
      }
    })
  },
  actionSheetTap : function(e){
    var that = this;
    var itemList;
    console.log(e)
    if(e.currentTarget.dataset.isself){
      itemList = ['举报','删除']
    }else{
      itemList = ['举报']
    }
    wx.showActionSheet({
      itemList: itemList,
      success: function(res) {
        console.log(res.tapIndex)
        if(!res.tapIndex){
          console.log('jubao')
        }else{
          pwx.request({
            url : api.delete_post_api+that.data.postId,
            method : 'POST',
            header : {'session' : that.data.sessionId}
          }).then( res => {
            wx.showToast({
              title : '删除成功',
              icon : 'success',
              duration : 1500,
              success : function(){
                console.log(that.data.postId)
                onfire.fire('deleteIndex',that.data.postId)
                wx.navigateBack({
                  delta : 1
                })
              }
            })
          })
        }
      },
      fail: function(res) {
        console.log(res.errMsg)
      }
    })
  },
  changeThump : function(){
    this.thumpRequest(this.data.postId);
    console.log('updateIndex')
    onfire.fire('updateIndex',this.data.postId);
  },
  thumpRequest: function(postId){
    var that = this;
    if(!this.data.isThump){
      var target = this.data.content;
      var flag = target.isLike ? 0 : 1 ;
      wx.request({
        url: api.thump_api+postId+'/'+flag,
        method: 'GET',
        header: {
          'session' : that.data.sessionId
        },
        success: function(res){
          console.log(res)
          if(res.data.code == 200){
            if(target.isLike){
              target.isLike = 0;
              --target.likeCount;
              that.setData({
                content : target
              })
            }else{
              target.isLike = 1;
              ++target.likeCount;
              that.setData({
                content : target
              })
            }
          } else if (res.data.errorCode == 40008){
            wx.showToast({
                title:"操作失败，请下拉刷新重试",
                image : '../../images/fail.png',
                duration:2000
            })
          }
        },
        fail: function(res) {
          wx.showToast({
              title:"点赞失败，请检查网络状况",
              image : '../../images/fail.png',
              duration:2000
          })
        },
        complete : function(){
          that.setData({
            isThump : false
          })
        }
      })
    }else{
      wx.showToast({
          title:"请勿重复点赞",
          image : '../../images/fail.png',
          duration:2000
      })
    }

  },
  contentRequest : function(sessionId){
    var that = this;
    console.log('contentRequest sessionId is'+ that.data.sessionId)
    var sessionId = sessionId || that.data.sessionId;
    wx.request({
      url: api.content_api + that.data.postId,
      method: 'GET',
      header: {'session' : sessionId},
      success: function(res){
        console.log('contentRequest res \n')
        console.log(res)
        if(res.data.code == 200){
          that.setData({
            content : res.data.content
          })
          // console.log('that.data.content \n')
        } else if (res.data.errorCode == 40008){
          app.getSessionId(that.contentRequest);
        }

      },
      fail: function(res) {
        wx.showToast({
          title:"请求失败，请检查网络状况",
          image : '../../images/fail.png',
          duration:2000
        })
      }
    })
  },
  commentRequest : function(sessionId){
    var that = this;
    var sessionId = sessionId || that.data.sessionId
    wx.request({
      url: api.comment_api+that.data.postId,
      method: 'GET',
      header : {
        'session' : sessionId
      },
      success: function(res){
        console.log('commentRequest res \n')
        console.log(res)
        if(res.data.code == 200){
          that.setData({
            comment : res.data.content,
            moreComment : true
          })
        }else if(res.data.code == -1002){
          that.setData({
            comment : [],
            moreComment : false
          })
        } else if (res.data.errorCode == 40008){
          app.getSessionId(that.commentRequest);
        }
      },
      fail: function(res) {
        wx.showToast({
          title:"请求失败，请检查网络状况",
          image : '../../images/fail.png',
          duration:2000
        })
      },
      complete: function(res) {
        typeof wx.stopPullDownRefresh() == 'function' && wx.stopPullDownRefresh();
      }
    })
  }
})