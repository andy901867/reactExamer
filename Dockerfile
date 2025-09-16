FROM node:20-alpine AS build
WORKDIR /app

# 先只複製套件清單，利用快取
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./

# 正確安裝依賴（依鎖檔選擇套件管理器）
RUN corepack enable && \
    if [ -f pnpm-lock.yaml ]; then pnpm i --frozen-lockfile; \
    elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    else npm install; fi

# 再複製其餘程式碼
COPY . .

# 用對應的管理器執行 build（避免 127）
RUN set -eux; \
    if [ -f pnpm-lock.yaml ]; then pnpm run build; \
    elif [ -f yarn.lock ]; then yarn build; \
    else npm run build; fi

# ---- Runtime stage ----
FROM nginx:1.27-alpine
COPY nginx.vite.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
