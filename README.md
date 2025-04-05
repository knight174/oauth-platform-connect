# OAuth Platform Connect

[English](#english) | [中文](#中文) | [Demo](https://knight174.github.io/oauth-platform-connect)

## English

A unified OAuth authentication solution that supports multiple platforms (GitHub, Gitee) using Express.js.

### Features

- Support for GitHub OAuth authentication
- Support for Gitee OAuth authentication
- Configurable authorization scopes
- Token refresh mechanism
- User information retrieval

### Quick Start

1. Clone the repository:

```bash
git clone https://github.com/knight174/oauth-platform-connect.git
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:

- Copy `.env.example` to `.env`
- Fill in your OAuth credentials:
  - GitHub Client ID and Secret
  - Gitee Client ID and Secret

4. Start the server:

```bash
npm run dev
```

5. Visit `http://localhost:3000`

### License

MIT

---

## 中文

一个基于 Express.js 的统一 OAuth 认证解决方案，支持多个平台（GitHub、Gitee）。

### 特性

- 支持 GitHub OAuth 认证
- 支持 Gitee OAuth 认证
- 可配置的授权范围
- 令牌刷新机制
- 用户信息获取

### 快速开始

1. 克隆仓库：

```bash
git clone https://github.com/knight174/oauth-platform-connect.git
```

2. 安装依赖：

```bash
npm install
```

3. 配置环境变量：

- 复制 `.env.example` 到 `.env`
- 填写你的 OAuth 认证信息：
  - GitHub 客户端 ID 和密钥
  - Gitee 客户端 ID 和密钥

4. 启动服务器：

```bash
npm run dev
```

5. 访问 `http://localhost:3000`

### 许可证

MIT
