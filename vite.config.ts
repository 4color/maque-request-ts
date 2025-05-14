import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import {fileURLToPath, URL} from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    build: {
        //构建为库模式
        lib: {
            // Could also be a dictionary or array of multiple entry points
            entry: {
                index: "./src/packages/request.ts"//文件的路径
            },
            name: 'ComponentRequestTs',
            // the proper extensions will be added
            fileName: 'index',
        },
        rollupOptions: {
            // 确保外部化处理那些你不想打包进库的依赖
            external: ['vue', 'element-plus', "axios"],
            output: {
                // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
                globals: {
                    vue: 'Vue',
                    "element-plus": 'element-plus',
                },
            },
        },
    }
})
