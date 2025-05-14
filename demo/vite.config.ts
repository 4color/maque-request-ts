import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    server: {
        proxy: {
            "/api": {
                target: "https://api.xygeng.cn",
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ""),
                headers: {
                    //"Host": "localhost:5173"
                    //"Host": "https://www.baidu.com"
                },
                bypass(req, res, options) {
                    const proxyURL = options.target + options.rewrite(req.url);
                    res.setHeader('x-req-proxyURL', proxyURL) // 将真实请求地址设置到响应头中
                }
            }
        },

    }
})
