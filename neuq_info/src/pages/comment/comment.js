//comment.js
const onfire = require('../../modules/onfire.js')
const tool = require("../../utils/tool.js")
const api = require('../../utils/api.js')
const app = getApp()
Page({
  data:{
    content : '',
    postId : '',
    level : 0,
    toUserId : 0,
    toUserName : '',
    pCommentId : 0,
    length : 0,
    sessionId : '',
    isPost : false
  },
  onLoad:function(options){
    console.log(options)
    var that = this;
    this.setData({
      postId : options.postId,
      level: Number(options.level),
      toUserId : options.toUserId,
      toUserName : options.toUserName,
      pCommentId : options.pCommentId
    })
    wx.getStorage({
      key: '3rd_session',
      success: function(res){
        that.setData({
          sessionId : res.data
        })
      }
    })
  },
  input : function(e){
    var length = e.detail.value.length;
    this.setData({
      length : length
    })
  },
  blur : function(e){
    // console.log('e.detail.value is ' + e.detail.value)
    this.setData({
      content : e.detail.value
    })
  },
  post : function(sessionId){
    var that = this;
    if(!this.data.isPost){
      wx.showModal({
        title : '提示',
        content : '确认提交?',
        success : function(res){
          if(res.confirm){
            // console.log('res.confirm content is '+ that.data.content)
            //判断提交是否合法
            if(that.data.content){
              that.setData({
                isPost : true
              })
              var sessionId = sessionId || that.data.sessionId

              wx.request({
                url : api.comment_api+that.data.postId,
                header : {
                  'session' : sessionId,
                  'Content-Type' : 'application/x-www-form-urlencoded'
                },
                data : {
                  'content': that.data.content,
                  'level': that.data.level,
                  'toUserId': that.data.toUserId,
                  'pCommentId': that.data.pCommentId,

                  },
                method :"POST",
                success : function(res){
                  console.log(res)
                  if(res.data.code){
                    //发布订阅模式
                    if(that.data.level == 1){
                      onfire.fire('updateIndex',that.data.postId);
                      onfire.fire('updateIndexFloor',that.data.postId);
                      onfire.fire('updateContent1')
                    }else{
                      onfire.fire('updateContent2')
                    }
                    wx.showToast({
                      title: '评论成功',
                      icon: 'success',
                      // todo
                      duration: 1000,
                      success : function(){
                        setTimeout(function(){
                          wx.navigateBack({
                            delta: 1
                          })
                        },1000)
                      }
                    })
                  }else if(res.data.errorCode == 40008){
                    app.getSessionId(that.post);
                  }
                },
                fail : function(res){
                  wx.showToast({
                    title: '评论失败',
                    image : '../../images/fail.png',
                    duration: 2000
                  })
                },
                complete : function(){
                  that.setData({
                    isPost : false
                  })
                }
              })
            }else{
              wx.showToast({
                title: '请输入内容后提交',
                image : '../../images/fail.png',
                duration: 2000
              })
            }

          }
        }
      })
    }else{
      wx.showToast({
        title: '请勿重复提交',
        image : '../../images/fail.png',
        duration: 2000
      })
    }

  }
})