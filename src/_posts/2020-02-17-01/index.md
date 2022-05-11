---
title: "Netlify CMS + GatsbyJSで開発環境と本番環境を切り替える"
date: "2020-02-17"
categories: 
  - "Development"
tags: 
  - "Gatsby"
  - "Netlify"
  - "Netlify CMS"
coverImage: "NetlifyCMSGatsbyJSDividedEnv.png"
---

Netlify CMSで作成したマークダウンファイルを開発環境と本番環境で保存先を切り替えたかったのですが、思ったよりも上手くいかなかったので備忘録として記します。

上手くいかなかったのは主にNetlify CMSが原因で、ひとつのGitHubリポジトリに対しひとつのNetlify Hostingしか設定できないので少々手間取ってしまった感じです。

使ったことがないので分かりませんが、ContentfulなどのAPI Keyでアカウント認証するような一般的なHeadless CMSなら、開発環境用と本番環境用の2つのプロジェクトを作り環境変数でAPI Keyを切り替えて簡単に環境の切り替えができそうです。

さて、まずはGatsbyにおける環境変数の取扱について見ていきましょう。

## Gatsbyにおける環境変数の扱い

Gatsbyはdotenvやdirenvなどのツールを自前で用意しなくても、Gatsby自体に最初からdotenvによる環境変数を切り替える仕組みが用意されていて、`gatsby develop`を実行すると`.env.development`が読み込まれ、`gatsby build`または`gatsby serve`を実行すると`.env.production`が読み込まれます。


### Environment Variables

You can provide environment variables to your site to customize its behavior in different environments. Environment variables can be…

一応、使い方はこういう感じです。

```
# in .env.development
TEST=foo

# in .env.production
TEST=bar
```

```
// output 'foo' in development environment
console.log(process.env.TEST)

// output 'bar' in production environment
console.log(process.env.TEST)
```

しかし、本番環境であるNetlify Hostingに(GitHubのリポジトリに)`.env.*`ファイルをアップロードするのはセキュリティの都合上望ましくありません。Netlify上に環境変数を設定して対応しましょう。

### Build environment variables

Netlify builds, deploys, and hosts your front end. Learn how to get started, see examples, and view documentation for the modern web platform.

Netlifyのダッシュボード内、Settings > Build & deploy > Environment > Environment variables から設定できます。

ただし、Gatsbyは`.env.development`と`.env.production`ファイル以外の方法によって環境変数を読み込む場合、`GATSBY_`接頭辞がKeyに必要です。

先ほどのコードを以下のように変更することでGitHub上に`.env.*`ファイルをアップロードせずに環境変数を参照できます。

```
# in .env.development
GATSBY_TEST=foo

# in Netlify Environment variables
GATSBY_TEST=bar
```

```
// output 'foo' in development environment
console.log(process.env.GATSBY_TEST)

// output 'bar' in production environment
console.log(process.env.GATSBY_TEST)
```

## Netlify CMSが生成するマークダウンファイルの保存ディレクトリを変更する

Netlify CMSの設定はルートディレクトリの`static/admin/config.yml`から行います。（人によっては違うかもしれません。）

![](https://d33wubrfki0l68.cloudfront.net/1f4ce04369d08e4f8c3a7ca30a11c4873fda2ae1/5ec76/static/netlify-cms-logo-89325c27d4b56df2c79af749826c6730.svg)

### Configuration Options | Netlify CMS | Open-Source Content Management System

Open source content management for your Git workflow

### 通常の保存ディレクトリ指定方法

環境によってマークダウンファイルを保存するディレクトリを変更しないのであれば指定は簡単で、Collections内の`folder`オプションに以下のように指定します。

```
collections:
  - name: 'blog'
    # ...
    folder: 'src/pages/blog'
```

これで`src/pages/blog`配下にNetlify CMSによって生成されたマークダウンファイルが保存されるようになります。シンプルです。

### 環境変数によって保存ディレクトリを切り替えるには

利用したことがないので詳しくは分かりませんが、Docker ComposeのようにYAMLファイルを利用するツール側で変数を独自に展開するパターンもあるようです。

しかし、標準ではYAMLは環境変数を読み込むことができません。このようなことが出来れば苦労なく環境変数を`config.yml`で使用できたのですが……。

![](https://docs.docker.com/favicons/docs@2x.ico)

### Environment variables in Compose

How to set, use and manage environment variables in Compose

さて、以下に記す内容はこのIssueを参考にしました。2018年からOpenしていることを見るに少々厄介な感じがしますね。

![](https://opengraph.githubassets.com/c2404fac08240b7b9234a02331468c5aa9a264d6fa2609d78accb3fb14ba7e1a/netlify/netlify-cms/issues/1737)

### Request: Support for Scoping by Branch · Issue #1737 · netlify/netlify-cms

Is your feature request related to a problem? Please describe. I think it would be useful to support environment-specific branches. It is perfectly easy to set up Netlify to deploy multiple branche...

ざっくりこのFeature RequestのAuthorが話していることを説明すると以下のような趣旨です。

> NetlifyはGit Branchを環境変数に持っているのだから、config.ymlのbranchオプションにautoが指定できれば、ymlで環境変数が使用できなくても環境による記事の保存先を変更することが出来るのではないか

環境の切り替えという文脈で読むと、Netlifyにデプロイするブランチをproductionなどのmaster以外に設定すれば、ローカル環境のNetlify CMSで追加した記事は本番環境にはアップロードされないという感じですね。（これはこれで考慮しないといけないこともありアレですが）

ただまぁ、この仕様は現段階で実装されていないわけなので他の方法を採る必要があります。

### 環境変数と手動初期化を利用してconfig.ymlの値を切り替える

この記事は実際に実装を行いながら書いていたのですが、こちらで用意する環境変数を使用しなくてもやりたいことは実現できました……。

それは`NODE_ENV`という環境変数の存在に気づいたからなのですが、この変数は`gatsby develop`の環境では`'development'`を返し、`gatsby build`または`gatsby serve`の環境では`'production'`を返してくれます。（おそらくGatsbyさんが設定している？）

このセクション以前の内容は利用しないのですが、もうここまで書いたので知見として残しておきます。

#### Netlify側の設定

Deploy SettingsのDeploy contextsを以下のように指定し、本番用のブランチをmaster以外に設定します。Branch DeployはNoneでもいけた気がしますが、ローカルで使用するNetlify CMSが生成するMDファイルの保存先にmasterを指定しているので、ここでも一応設定しています。

```
Production branch: production
Deploy previews: Automatically build deploy previews for all pull requests
Branch deploys: master
```

#### Gatsby側の設定

通常は`config.yml`に書いた内容がNetlify CMSの設定に利用されCMSが初期化されますが、今回は環境によりbranchとfolderを切り替えたいのでコメントアウトします(設定しません)。

**In config.yml**

```
backend:
  name: github
  repo: owner-name/repo-name
  # branch: Setting by cms.js
  #...
  collections:
  - name: 'blog'
    label: 'Blog'
    # folder: Setting by cms.js
```

設定しなかったbranchとfolderを`config.yml`以外から設定するためにCMSの手動初期化を行います。

デフォルトでは手動初期化はfalseになっているので、`gatsby-config.js`から`manualInit`をtrueにします。

**In gatsby-config.js**

```
resolve: 'gatsby-plugin-netlify-cms',
options: {
    manualInit: true,
    modulePath: `${__dirname}/src/cms/cms.js`,
}
```

そして、`cms.js`内で環境によるbranchとfolderの切り替えとそれに伴う手動初期化を行います。

※ドキュメントには`config.yml`が存在するときは手動初期化で指定した設定はマージされると書いてあるのだけど、されないのでbranchとfolderを先ほどコメントアウトしています。

### gatsby-plugin-netlify-cms

gatsby-plugin-netlify-cms Gatsby v1 and Netlify CMS 1.x require . Gatsby v2 and Netlify CMS 2.x require . Gatsby v2 and Netlify CMS (netlify…

**In cms.js**

```
import CMS from 'netlify-cms-app'

const config = () => {
  if (process.env.NODE_ENV === 'development') {
    return {
      config: {
        backend: {
          branch: 'master'
        },
        collections: [
          {
            name: 'blog',
            folder: 'src/pages/blog-test'
          }
        ]
      }
    }
  } else if (process.env.NODE_ENV === 'production') {
    return {
      config: {
        backend: {
          branch: 'production'
        },
        collections: [
          {
            name: 'blog',
            folder: 'src/pages/blog'
          }
        ]
      }
    }
  }
}

CMS.init(config())
```

これでおそらく本番と開発によって保存先のbranchとfolderの切り替えは出来たと思います。しかし、様々なコンテキストがあるのでもしかしたら人によってはこれだけでは上手く動かないかもしれない。

最後に`gatsby-node.js`や一覧ページのtemplateとかのGraphQLのクエリを調整して終わりです。

ここに関しては人によって扱い方が違うと思うのでザックリと。僕は以下のような感じでディレクトリ名でフィルタリングして環境ごとに記事の出し分けを行いました。

```
const dir =
  process.env.NODE_ENV === 'production' ? '^/blog//' : '^/blog-test//'

return graphql(`
  {
    allMarkdownRemark(
      sort: { order: DESC, fields: [frontmatter___date]},
      filter: {fields: {slug: {regex: "${dir}"}}}
    ){
      edges {
        node {
          fields {
            slug
          }
          id
        }
      }
    }
  }
`)
```

## さいごに

かなり罠が多いです。この記事で紹介した方法で上手くいけば良いけど、上手くいかない人も多そう。落ち着いて1つづつ問題を解消していきましょう。(読み込んでいるパッケージのバージョンが古いとか……)

Manual InitializationはBeta Featureらしいので急に使えなくなったりするかもしれないし、色々としんどい感じです。

![](https://d33wubrfki0l68.cloudfront.net/1f4ce04369d08e4f8c3a7ca30a11c4873fda2ae1/5ec76/static/netlify-cms-logo-89325c27d4b56df2c79af749826c6730.svg)

### Beta Features! | Netlify CMS | Open-Source Content Management System

Open source content management for your Git workflow

Netlify CMSの環境切り替えをやってみて思ったのは、開発 / ステージング / 本番などで環境を分けたい人はNetlifyでホスティングするからってNetlify CMS使うよりも、ContentfulとかAPIベースのCMS使ったほうが良いということ。

しいて言うと、Netlify CMSはマークダウンファイルがGitHubに残っていくのは良いけど、そこがそんなに魅力に感じていないなら、全然他のCMSを使うのはアリなのではないかなぁと思います。

実務でこういう処理を行うコードを書かないので知らないことが多くて中々疲れました……。
