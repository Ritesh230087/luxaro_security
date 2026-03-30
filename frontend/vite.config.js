// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import fs from 'fs'
// import path from 'path'

// export default defineConfig({
//   plugins: [react()],
//   server: {

//     // host: '0.0.0.0',          //to run in kali

// https: {
//   key: fs.readFileSync('./localhost+2-key.pem'),
//   cert: fs.readFileSync('./localhost+2.pem'),
// },
//     port: 5173,
//     proxy: {
//       '/api': {
//         target: 'http://localhost:5000',
//         changeOrigin: true,
//         secure: false
//       }
//     }
//   }
// })



import { defineConfig } from "vite";
import fs from "fs";

export default defineConfig({
  server:
    process.env.NODE_ENV === "development"
      ? {
          https: {
            key: fs.readFileSync("./localhost+2-key.pem"),
            cert: fs.readFileSync("./localhost+2.pem"),
          },
        }
      : {},
});