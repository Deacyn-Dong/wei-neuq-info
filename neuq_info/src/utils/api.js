
'use strict';

const api = {
  delete_post_api : 'https://info.hhml.online/info/post/delete/',
  delete_comment_api : 'https://info.hhml.online/info/comment/delete/',
  decode_user_api: "https://info.hhml.online/info/wx/decodeUserInfo",
  session_api: 'https://info.hhml.online/info/wx/getSession',
  pull_down_api: 'https://info.hhml.online/info/post/new/',
  post_api: 'https://info.hhml.online/info/post',
  index_api: 'https://info.hhml.online/info/post/',
  thump_api: 'https://info.hhml.online/info/post/like/',
  content_api: 'https://info.hhml.online/info/post/',
  comment_api: 'https://info.hhml.online/info/comment/'
}

module.exports = {
  delete_post_api : api.delete_post_api,
  delete_comment_api : api.delete_comment_api,
  decode_user_api: api.decode_user_api,
  session_api: api.session_api,
  pull_down_api: api.pull_down_api,
  post_api: api.post_api,
  index_api: api.index_api,
  thump_api: api.thump_api,
  content_api: api.content_api,
  comment_api: api.comment_api
}