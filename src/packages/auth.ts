import axios from "axios"
import {ElMessage} from "element-plus";

axios.defaults.withCredentials = true

axios.defaults.baseURL = window.apiGateway

export function getUserToken(_authSuccess: any, _authFail: any) {
    if (window.ssoUrl) {
        return axios.get(window.ssoUrl + '/user/token').then((res) => {
            if (res.data.status == 401) {
                if (_authFail) {
                    _authFail(res);
                } else {
                    ElMessage.warning("会话已过期，请重新登录")
                }
                return Promise.reject()
            } else {
                const token = res.data.data
                if (token) {
                    sessionStorage.setItem((window.tokenName ? 'Token' : ""), token);
                    if (_authSuccess) {
                        _authSuccess(res);
                    }
                }
            }
        })
    } else {
        console.log("无认证服务，不进行token获取")
        return Promise.resolve();
    }
}
