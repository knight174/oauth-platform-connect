require('dotenv').config();
const express = require('express');
const querystring = require('querystring');
const cors = require('cors');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

// Gitee OAuth 配置
const CLIENT_ID = process.env.GITEE_CLIENT_ID;
const CLIENT_SECRET = process.env.GITEE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GITEE_REDIRECT_URI;

// GitHub OAuth 配置
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI;

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public')));

// 添加 CORS 支持
app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? ['https://oauth-platform-connect.vercel.app']
        : 'http://localhost:3000',
  })
);

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// 首页，重定向到登录页面
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 生成 Gitee 授权链接
app.get('/oauth/authorize', (req, res) => {
  const scopes = req.query.scopes || 'user_info'; // 默认至少需要用户信息权限
  const giteeAuthUrl = `https://gitee.com/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${scopes}`;
  res.json({ url: giteeAuthUrl });
});

// 处理 Gitee 回调
app.get('/callback', async (req, res) => {
  const code = req.query.code;

  try {
    // 用授权码换取访问令牌
    const tokenResponse = await fetch('https://gitee.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: querystring.stringify({
        grant_type: 'authorization_code',
        code: code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
      }),
    });

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokenData;

    // 设置定时刷新 token
    setTimeout(async () => {
      try {
        await fetch('https://gitee.com/oauth/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: querystring.stringify({
            grant_type: 'refresh_token',
            refresh_token: refresh_token,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
          }),
        });
        console.log('Token refreshed successfully');
      } catch (error) {
        console.error('Error refreshing token:', error);
      }
    }, (expires_in - 300) * 1000); // 在 token 过期前 5 分钟刷新

    // 使用访问令牌获取用户信息
    const userResponse = await fetch('https://gitee.com/api/v5/user', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const userData = await userResponse.json();

    res.send(
      `<html><body>
        <h1>Welcome, ${userData.login}!</h1>
        <p>Your Gitee ID is ${userData.id}</p>
        <p>Access Token: ${access_token}</p>
        <p>Token expires in: ${expires_in} seconds</p>
      </body></html>`
    );
  } catch (error) {
    console.error('Error during OAuth process:', error);
    res.status(500).send('OAuth process failed.');
  }
});

// 添加 GitHub 授权路由
app.get('/oauth/github/authorize', (req, res) => {
  const scopes = req.query.scopes || 'read:user'; // 默认权限
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${GITHUB_REDIRECT_URI}&scope=${scopes}`;
  res.json({ url: githubAuthUrl });
});

// 处理 GitHub 回调
app.get('/github/callback', async (req, res) => {
  const code = req.query.code;

  try {
    // 用授权码换取访问令牌
    const tokenResponse = await fetch(
      'https://github.com/login/oauth/access_token',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: GITHUB_CLIENT_ID,
          client_secret: GITHUB_CLIENT_SECRET,
          code: code,
          redirect_uri: GITHUB_REDIRECT_URI,
        }),
      }
    );

    const tokenData = await tokenResponse.json();
    const access_token = tokenData.access_token;

    // 获取用户信息
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${access_token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    const userData = await userResponse.json();

    res.send(`
      <html><body>
        <h1>Welcome GitHub user, ${userData.login}!</h1>
        <p>Your GitHub ID is ${userData.id}</p>
        <p>Access Token: ${access_token}</p>
      </body></html>
    `);
  } catch (error) {
    console.error('Error during GitHub OAuth process:', error);
    res.status(500).send('GitHub OAuth process failed.');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
