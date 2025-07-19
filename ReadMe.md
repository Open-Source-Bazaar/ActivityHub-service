# ActivityHub-service

开源的**活动筹办系统**，基于 [Koa][8]、[TypeScript][3] 和 的 **Node.js [REST][1]ful API** 项目。

[![Deploy to Production environment](https://github.com/Open-Source-Bazaar/ActivityHub-service/actions/workflows/deploy-production.yml/badge.svg)][4]

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)][5]

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)][6]
[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)][7]

## Technology stack

1. HTTP server: [Koa][8]
2. Controller framework: [Routing Controllers][9]
3. Model framework: [Class Transformer][10] & [Class Validator][11]
4. ORM framework: [TypeORM][12]
5. API document: [Swagger][13]
6. Mock API: [OpenAPI backend][14]
7. Test framework: [Jest][15]

## 主要特性

1. [API entry & Health checking](source/controller/Base.ts)
2. [User & Session](source/controller/User.ts)
    - Email OTP (One Time Password)
3. [OAuth sign in](source/controller/OAuth.ts)
    - recommend to use with [Next SSR middleware][16]
4. [WebAuthn sign in](source/controller/WebAuthn.ts)
    - recommend to use with [Passwordless ID][17]
5. [Activity logging](source/controller/ActivityLog.ts)
6. [File object storage](source/controller/File.ts)

## 数据模型

### 第一版

办完一场**小型免费活动**的建模，且兼容后续大中型活动的数据结构：

- [x] [User](source/model/User.ts) 组织者、讲师、合作方联系人、志愿者等

- [x] [Organization](source/model/Organization/Organization.ts) 主办、协办、场地、赞助、媒体、展商等

- [x] [Membership](source/model/Organization/Membership.ts) 组织关系（User 与 Organization）

- [x] [Place](source/model/Organization/Place.ts) 会场（会议室、教室、咖啡馆等）

- [x] [Activity](source/model/Activity/Activity.ts) 小型沙龙、中型活动、大型会议

- [x] [Cooperation](source/model/Activity/Cooperation.ts) 合作关系（Activity 与 Organization）

- [x] [Session](source/model/Activity/Session.ts) 活动环节（演讲、实训等）

- [x] [Agenda](source/model/Activity/Agenda.ts) 环节申报（Activity 与 Session）

- [ ] Ticket 门票类别（单 Activity、多 Session）

- [ ] TicketOrder 门票订单（User 与 Ticket）

- [x] [CheckEvent](source/model/Activity/CheckEvent.ts) 环节打卡（User 与 Agenda）

### 第二版

- [ ] Track 分会场、议程轨（相当于分类）

- [ ] Exhibition 外场展位

- [ ] Material 物料

- [ ] Account 账目（赞助、差旅、物料、门票等）

- [ ] Feedback 活动反馈（多 Session、多 Exhibition）

## Best practice

1.  Install GitHub apps in your organization or account:
    1.  [Probot settings][18]: set up Issue labels & Pull Request rules
    2.  [PR badge][19]: set up Online [VS Code][20] editor entries in Pull Request description

2.  Click the **[<kbd>Use this template</kbd>][21] button** on the top of this GitHub repository's home page, then create your own repository in the app-installed namespace above

3.  Click the **[<kbd>Open in GitHub codespaces</kbd>][8] button** on the top of ReadMe file, then an **online VS Code development environment** will be started immediately

4.  Recommend to add a [Notification step in GitHub actions][22] for your Team IM app

5.  Remind the PMs & users of your product to submit **Feature/Enhancement** requests or **Bug** reports with [Issue forms][23] instead of IM messages or Mobile Phone calls

6.  Collect all these issues into [Project kanbans][24], then create **Pull requests** & add `closes #issue_number` into its description for automation

## API Usage

- Entry: http://localhost:8080/
- Document: http://localhost:8080/docs/
- Schema: http://localhost:8080/docs/spec/
- Type: https://github.com/Open-Source-Bazaar/ActivityHub-service/pkgs/npm/activityhub-service

## Environment variables

|            Name            |            Usage             |
| :------------------------: | :--------------------------: |
|        `APP_SECRET`        |   encrypt Password & Token   |
|       `DATABASE_URL`       | PostgreSQL connection string |
|   `SUPABASE_PROJECT_URL`   |  [Supabase][25] project URL  |
|    `SUPABASE_ANON_KEY`     |      Supabase anon key       |
|     `AWS_S3_END_POINT`     |  [AWS S3][26] endpoint URL   |
|      `AWS_S3_BUCKET`       |      AWS S3 bucket name      |
|   `AWS_S3_ACCESS_KEY_ID`   |     AWS S3 access key id     |
| `AWS_S3_SECRET_ACCESS_KEY` |   AWS S3 secret access key   |
|    `AWS_S3_PUBLIC_HOST`    |      AWS S3 public host      |

## 本地开发

### Installation

```shell
npm i pnpm -g
pnpm i
```

### Start Development environment

```shell
pnpm dev
```

or just press <kbd>F5</kbd> key in [VS Code][20].

### Migration

```shell
pnpm upgrade:dev
```

## 手动部署

### Start Production environment

```shell
npm start
```

### Migration

```shell
pnpm upgrade:pro
```

### Docker

```shell
pnpm pack-image
pnpm container
```

## 自动发版

### Deploy Application

```shell
git checkout master
git tag v1.0.0  # this version tag comes from ./package.json
git push origin master --tags
```

### Publish Type Package

```shell
git checkout master
git tag type-v1.0.0  # this version tag comes from ./type/package.json
git push origin master --tags
```

## 竞品

- https://github.com/freeCodeCamp/chapter
- https://www.bagevent.com/introduce/academic_introduce.html
- https://www.bagevent.com/introduce/exhibitor_introduce.html

[1]: https://en.wikipedia.org/wiki/Representational_state_transfer
[2]: https://nodejs.org/
[3]: https://www.typescriptlang.org/
[4]: https://github.com/Open-Source-Bazaar/ActivityHub-service/actions/workflows/deploy-production.yml
[5]: https://render.com/deploy
[6]: https://codespaces.new/Open-Source-Bazaar/ActivityHub-service
[7]: https://gitpod.io/?autostart=true#https://github.com/Open-Source-Bazaar/ActivityHub-service
[8]: https://koajs.com/
[9]: https://github.com/typestack/routing-controllers
[10]: https://github.com/typestack/class-transformer
[11]: https://github.com/typestack/class-validator
[12]: https://typeorm.io/
[13]: https://swagger.io/
[14]: https://github.com/anttiviljami/openapi-backend
[15]: https://jestjs.io/
[16]: https://github.com/idea2app/Next-SSR-middleware
[17]: https://webauthn.passwordless.id/
[18]: https://github.com/apps/settings
[19]: https://pullrequestbadge.com/
[20]: https://code.visualstudio.com/
[21]: https://github.com/new?template_name=ActivityHub-service&template_owner=Open-Source-Bazaar
[22]: https://github.com/kaiyuanshe/kaiyuanshe.github.io/blob/bb4675a56bf1d6b207231313da5ed0af7cf0ebd6/.github/workflows/pull-request.yml#L32-L56
[23]: https://github.com/Open-Source-Bazaar/ActivityHub-service/issues/new/choose
[24]: https://github.com/Open-Source-Bazaar/ActivityHub-service/projects
[25]: https://supabase.com/
[26]: https://aws.amazon.com/s3/
