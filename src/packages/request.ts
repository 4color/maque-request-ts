import axios from 'axios'
import {ElMessage} from "element-plus";
import {getUserToken} from "./auth.ts";
import Cookies from 'js-cookie';

// create an axios instance
const requestAxios = axios.create({
    withCredentials: true, // send cookies when cross-domain requests
    //timeout: window.apiTimeout ? window.apiTimeout : 5000, // request timeout

    baseURL: window.apiGateway,
})

/**
 * 成功后的回调事件
 * @type {null}
 * @private
 */
let _authSuccess: any = null;
/**
 * 失败后的回调事件
 * @type {null}
 * @private
 */
let _authFail: any = null;

// 是否正在刷新的标记
let isRefreshing = false;
//重试队列，每一项将是一个待执行的函数形式
let requests: any = [];

/**
 * 重试请求
 * @param config
 * @returns {Promise<unknown>|Promise<boolean>}
 */
function retryTokenReqest(config: any) {
    console.log('--未授权或令牌过期，系统自动刷新令牌，重新请求--')
    config.baseURL = '';
    if (!isRefreshing) {
        isRefreshing = true
        return getUserToken(_authSuccess, _authFail).then((res) => {
            if (config.headers) {
                config.headers['Authorization'] = "Bearer " + res
            }
            // 已经刷新了token，将所有队列中的请求进行重试
            requests.forEach((cb: any) => cb(res));
            requests = [];
            return requestAxios(config);
        }).catch((e) => {
            console.error('refreshtoken error =>', e)
            return Promise.reject()
        }).finally(() => isRefreshing = false);

    } else {
        // 正在刷新token，将返回一个未执行resolve的promise
        return new Promise((resolve) => {
            // 将resolve放进队列，用一个函数形式来保存，等token刷新后直接执行
            requests.push((token: String) => {
                if (config.headers) {
                    config.headers['Authorization'] = "Bearer " + token;
                }
                resolve(requestAxios(config))
            })
        })
    }
}

/**
 * 设置token
 * @param token
 */
function setToken(token: any) {
    sessionStorage.setItem('Token', token)
}

// request interceptor
requestAxios.interceptors.request.use(
    (config: any) => {

        let tokenName = (window.tokenName ? 'Token' : "");
        // do something before request is sent
        const url = config.url;
        if (url.startsWith('https://') || url.startsWith('http://')) {
            config.baseURL = "";
        }
        const token = sessionStorage.getItem(tokenName);
        if (token && token != "") {
            if (config.headers) {
                config.headers['Authorization'] = "Bearer " + token
            }
        }

        let XToken = localStorage.getItem(tokenName);
        if (XToken && XToken != "") {
            if (config.headers) {
                if (!XToken.startsWith("Bearer") && !XToken.startsWith("bearer")) {
                    XToken = "Bearer " + XToken
                }
                config.headers[tokenName] = XToken;
            }
        }


        let cookieValue = Cookies.get(tokenName);
        if (cookieValue && cookieValue != "") {
            if (config.headers) {
                if (!cookieValue.startsWith("Bearer") && !cookieValue.startsWith("bearer")) {
                    cookieValue = "Bearer " + cookieValue
                }
                config.headers[tokenName] = cookieValue;
            }
        }
        return config
    },
    error => {
        // do something with request error
        console.log(error) // for debug
        return Promise.reject(error)
    }
)


// response interceptor
requestAxios.interceptors.response.use(
    /**
     * If you want to get http information such as headers or status
     * Please return  response => response
     */

    /**
     * Determine the request status by custom code
     * Here is just an example
     * You can also judge the status by HTTP Status Code
     */
    (response: any) => {
        const res = response.data
        const config = response.config
        if (res.status == 200 && res.msg == 'refreshToken') {
            // 令牌到期后，刷新新的令牌 拿到token后，重新请求一下
            console.log('--令牌过期，系统自动刷新令牌，重新请求--')
            setToken(res.data);
            config.headers['Authorization'] = "Bearer " + res.data
            return requestAxios(config);
        } else if (res.status == 401) {
            // 未授权或token过期，需要重新获取token，拿到令牌后需要重新请求一下
            return retryTokenReqest(config);
        }
        //是否返回所有数据，不拦截,blob类型也全部返回
        if (config.fullBack || config.responseType == 'blob') {
            return res;
        }
        if (res.status == 200 || res.code == 200) {
            return res.data;
        } else {
            ElMessage({
                message: res.message,
                grouping: true,
                type: 'error',
            })
            return Promise.reject(res.message)
        }
    },
    error => {
        if (error.response && error.response.status) {
            // 对应的状态码描述可能与具体场景不一样，可能需要自行确认和修改
            switch (error.response.status) {
                case 400:
                    ElMessage({
                        message: '请求错误（code 400）',
                        grouping: true,
                        type: 'error',
                    })
                    break
                case 401:
                    // eslint-disable-next-line no-case-declarations
                    const config = error.response.config;
                    return retryTokenReqest(config);
                case 403:
                    ElMessage.error('拒绝访问（code 403）')
                    break
                case 404:
                    ElMessage({
                        message: `请求地址出错：${error.response.config.url}（code 404）`,
                        grouping: true,
                        type: 'error',
                    })
                    break
                case 408:
                    ElMessage.error('请求超时 (code 408)')
                    break
                case 500:
                    // eslint-disable-next-line no-case-declarations
                    let msg = "系统异常，请联系管理员。 (code 500)"
                    if (error.response.data && error.response.data.message) {
                        msg = error.response.data.message
                    }
                    ElMessage({
                        message: msg,
                        grouping: true,
                        type: 'error',
                    })
                    break
                case 501:
                    ElMessage({
                        message: "系统异常，请联系管理员。 (code 501)",
                        grouping: true,
                        type: 'error',
                    })
                    break
                case 502:
                    ElMessage.error('系统异常，请联系管理员。 (code 502)')
                    break

                case 503:
                    ElMessage.error('服务不可用 (code 503)')
                    break

                case 504:
                    ElMessage.error('系统异常，请联系管理员 (code 504)')
                    break

                case 505:
                    ElMessage.error('HTTP版本不受支持 (code 505)')
                    break

                case 703:
                    ElMessage.error('token过期，请重新登录')
            }
        }
        return Promise.reject(error)
    }
)


function requestWrap(args: any, authSuccess = null, authFail = null) {
    _authSuccess = authSuccess;
    _authFail = authFail;
    return requestAxios(args);
}


export default requestWrap
