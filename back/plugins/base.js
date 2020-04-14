const modelBase = require('../models/mgdb/base')

// http请求
const API_FIELD_REQUEST = Symbol('request')
// 发起调用的客户端
const API_FIELD_CLIENT = Symbol('client')
// 数据库实例上下文(DbServer)
const API_FIELD_DB_CTX = Symbol('dbcontext')
// mongodb实例上下文
const API_FIELD_MONGO_CLIENT = Symbol('mongoclient')
//
const API_FIELD_MONGOOSE = Symbol('mongoose')
// 
const API_FIELD_CTX = Symbol('ctx')

class Base {
  constructor(ctx, client, dbContext, mongoClient, mongoose) {
    this[API_FIELD_REQUEST] = ctx.request
    this[API_FIELD_CLIENT] = client
    this[API_FIELD_DB_CTX] = dbContext
    this[API_FIELD_MONGO_CLIENT] = mongoClient
    this[API_FIELD_MONGOOSE] = mongoose
    this[API_FIELD_CTX] = ctx
  }
  get request() {
    return this[API_FIELD_REQUEST]
  }
  get client() {
    return this[API_FIELD_CLIENT]
  }
  get dbContext() {
    return this[API_FIELD_DB_CTX]
  }
  get mongoClient() {
    return this[API_FIELD_MONGO_CLIENT]
  }
  get mongoose() {
    return this[API_FIELD_MONGOOSE]
  }
  get db() {
    return this.dbContext.db()
  }
  get ctx() {
    return this[API_FIELD_CTX]
  }
	/**
	 * 组装 查询条件
	 */
  _assembleFind(filter, like = true) {
    let model = new modelBase()
    return model._assembleFind(filter, like)
  }
}

module.exports = Base
