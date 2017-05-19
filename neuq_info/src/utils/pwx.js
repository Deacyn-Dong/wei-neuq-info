'use strict';
const Promise = require('../modules/es6-promise.js').Promise;

function wxPromisify(fn) {
  return function (obj = {}) {
    return new Promise((resolve, reject) => {
      obj.success = function (res) {
        resolve(res)
      }
      obj.fail = function (res) {
        reject(res)
      }
      fn(obj)
    })
  }
}
Promise.prototype.finally = function (callback) {
  let P = this.constructor;
  return this.then(
    value => P.resolve(callback()).then(() => value),
    reseon => P.reject(callback()).then(() => { throw reason })
  )
}
function request(ops) {
  if (typeof ops != "object") return false;
  var request = wxPromisify(wx.request)
  return request({
    url: ops.url,
    method: ops.method || 'GET',
    data: ops.data,
    header: ops.header
  })
}
function login() {
  var login = wxPromisify(wx.login)
  return login()
}
function checkSession(){
  var checkSession = wxPromisify(wx.checkSession)
  return checkSession()
}
function getUserInfo() {
  var getUserInfo = wxPromisify(wx.getUserInfo);
  return getUserInfo()
}


function setStorage(key,value){
  return new Promise((resolve,reject) => {
    wx.setStorage({
      key : key,
      data : value,
      success : res => {
        resolve(value)
      },
      fail : err => {
        reject(err)
      }
    })
  })
}
function getStorage(key){
  return new Promise((resolve,reject) => {
    wx.getStorage({
      key : key,
      success : res => {
        resolve(res.data)
      },
      fail : err => {
        reject()
      }
    })
  })
}

module.exports = {
  request: request,
  login: login,
  checkSession : checkSession,
  getUserInfo: getUserInfo,
  setStorage : setStorage,
  getStorage : getStorage
}