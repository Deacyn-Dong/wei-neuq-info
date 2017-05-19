//edit.js
const onfire = require('../../modules/onfire.js')
const api = require('../../utils/api.js')
const app = getApp()
Page({
  data:{
    length : 0,
    isPost : false,
    title : '12312313',
    draft : '',
    secret : 0,
    sessionId : ''
  },
  onLoad: function(){
    var that = this;
    wx.getStorage({
      key: 'draft',
      success: function(res){
        that.setData({
          draft : res.data
        })
      }
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
  check: function(e){
    if(e.detail.value){
      this.setData({
        secret : 1
      })
    }else{
      this.setData({
        secret : 0
      })
    }
  },
  setDataDraft : function(e){
    this.setData({
      draft : e.detail.value
    })
  },
  cancel: function(){
    var that = this;
    wx.showModal({
      title : '取消',
      content : '是否保存草稿？' ,
      success : function(res){
        if(res.confirm){
          wx.setStorage({
            key: 'draft',
            data: that.data.draft,
            success: function(res){
              wx.showToast({
                title: '保存草稿成功',
                icon: 'success',
                duration: 1500
              })
            },
            fail: function(res) {
              wx.showToast({
                title: '保存草稿失败',
                duration: 2000
              })
            }
          })
        }else if(res.cancel){
          that.setData({
            draft : ''
          })
        }
      }
    })
  },
  post : function(sessionId){
    var that = this;
    if(!this.data.isPost){
      wx.showModal({
        title : '提示',
        content : '是否发送内容？' ,
        success : function(res){
          if(res.confirm){
            if(that.data.draft){
              that.setData({
                isPost : true
              })
              var sessionId = sessionId || that.data.sessionId
              wx.request({
                url: api.post_api,
                method: 'POST',
                data : {
                  'title':that.data.title,
                  'content':that.data.draft,
                  'secret':that.data.secret
                },
                header: {
                  'session': sessionId,
                  'Content-Type' : 'application/x-www-form-urlencoded'
                },
                success: function(res){
                  console.log('session is '+that.data.sessionId +'\n')
                  console.log('content is '+that.data.draft + '\n')
                  console.log(res)
                  if(res.data.code == 200){
                    that.setData({
                      draft : ''
                    })
                    wx.setStorage({
                      key: 'draft',
                      data: ''
                    })
                    wx.switchTab({
                      url: '/pages/index/index',
                      success : function(){
                        onfire.fire('afterPost')
                      }
                    })
                    // wx.showToast({
                    //   title: '提交成功',
                    //   icon: 'success',
                    //   duration: 1500,
                    //   success : function(){
                    //   }
                    // })
                  }else if(res.data.code == 40008){
                    app.getSessionId(that.post)
                  }
                },
                fail: function(res) {
                  wx.showToast({
                    title: '提交失败',
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