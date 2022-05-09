---
title: "GatsbyとNetlify CMSで既存サイトにブログを構築するまでのメモ"
date: "2019-07-15"
categories: 
  - "Development"
tags: 
  - "Gatsby"
  - "Netlify CMS"
---

Gatsbyのチュートリアルを終え、NetlifyでGatsbyのチュートリアルサイトをDeployするところまで体験した後の流れをメモっておく。

本当は、

> gatsby new site-name

で作ったサイトにNetlify CMSをサッサと入れたいのだけどあまり参考になりそうな記事が見当たらないし、良くわからんかったのでここのStarter kitを利用して作ったサイトのコードを読んでみる。

[Netlify App](https://app.netlify.com/start/deploy?repository=https://github.com/AustinGreen/gatsby-starter-netlify-cms&stack=cms)

作成されたRepositoryをチェックしてみよう。重要そうなsrc, staticディレクトリを重点的に見ていく。gatsby-config.jsなどの設定ファイルはまた今度。

src, static以外には以下のようなディレクトリがある。

.githubというディレクトリは初めて見た。Starter kitでどっかのリポジトリがクローンされてる気がするし、Forkするとついてくるのかな🤔

lambdaはAWSの1つで、サーバーに置かれた関数を実行してくれるものというゆる〜い知識だけはある。中にはhello.jsというものが置かれているが何かの確認のためのもの...？ここらへんの知識は今の所皆無なのでサッパリ。

publicは様々なフレームワークやライブラリを使用して作られたプログラムを実際にWeb上で動くようにBuildされたファイルたちが格納されるというやつ。特に人間がいじるところはないはずなのでOK。

# src

Gatsbyのデフォルトテーマにはないディレクトリは/cmsと/lambda(/templatesは後々追加するものなので無視)。

ここでも/lambdaが登場するが、おそらく僕らにはあまり関係のない部分な気がする、たぶん。現状は分からないのでスルー。

/cmsを見ていこう。

......なるほど、ここを見ると既存のプロジェクトにNetlify CMSをインポートすることが出来る気がしてくる。cms.js では以下のような記述が見られる。

```javascript
import CMS from 'netlify-cms-app'
import uploadcare from 'netlify-cms-media-library-uploadcare'
import cloudinary from 'netlify-cms-media-library-cloudinary'

import AboutPagePreview from './preview-templates/AboutPagePreview'
import BlogPostPreview from './preview-templates/BlogPostPreview'
import ProductPagePreview from './preview-templates/ProductPagePreview'
import IndexPagePreview from './preview-templates/IndexPagePreview'

CMS.registerMediaLibrary(uploadcare);
CMS.registerMediaLibrary(cloudinary);

CMS.registerPreviewTemplate('index', IndexPagePreview)
CMS.registerPreviewTemplate('about', AboutPagePreview)
CMS.registerPreviewTemplate('products', ProductPagePreview)
CMS.registerPreviewTemplate('blog', BlogPostPreview)
```

最初このページを見た時書いてあることがよく分からなかったがこのコードを見て少し分かった。

[Add to Your Site | Netlify CMS | Open-Source Content Management System](https://www.netlifycms.org/docs/add-to-your-site/)

しかしこのドキュメントを見るだけでは分からんだろう......既存プロジェクトにNetlify CMSを追加するのは素人には向いていなかったのかもしれない。

※そもそもなぜ既存のものに追加せねばならんかというと、その既存プロジェクトはNetlifyにもうDeployしてあり、テストの意味も込めて独自ドメインを設定したからである。要するに、独自ドメインをまた再設定するのがダルいということ。

さて、先程のコードとNetlify CMSのAdd to Your Siteドキュメントを見比べながら何が何を表しているのかチェックしていこうと思う。

どちらのコードにも共通して出てくるのが以下の部分。

```javascript
import CMS from 'netlify-cms-app'
import IndexPagePreview from './preview-templates/IndexPagePreview'
CMS.registerPreviewTemplate('index', IndexPagePreview)
```

`import CMS from 'netlify-cms-app'`でNetlify CMSのダッシュボードとか記事の出力に使われるっぽい気がするパッケージをインストール。

そして、次の二行でダッシュボードの右ペインで出てくるプレビューに使われるテンプレートを指定しているようだ。

`'./preview-templates/IndexPagePreview'`の中身には`'../../templates/index-page'`が読み込まれており、そのコンポーネントのpropsにCMSで設定することの出来るデータが当てはめられているよう。

```jsx
import { IndexPageTemplate } from '../../templates/index-page'

//中略

<IndexPageTemplate
  image={data.image}
  title={data.title}
  heading={data.heading}
  subheading={data.subheading}
  description={data.description}
  intro={data.intro || { blurbs: [] }}
  mainpitch={data.mainpitch || {}}
/>
```

ここまででフロントの設定は何となくではあるが確認できた。

また、ローカルで確認できなくてもネット上でユーザーに見える部分ではないので大きな問題では無いのだが、ダッシュボード（~domain~/admin）はlocalhostからはアクセスできなかった。（バックエンドの確認をした後に思い返したらそりゃそうだと思った😞）

Netlifyで設定したドメイン＋/adminのURLでアクセスすることが出来るのみである。それゆえ、ダッシュボードのPreviewTemplateなどの設定を変更したいときは、Netlifyで設定したビルドコマンドを入力しなければならない。

これはタイミングに気をつけないといけないかもしれない。

さて、続いてバックエンドのコードをチェックする。これが/staticに入っているコードにあたる。

# static

`/static/admin/config.yml`

ここで指定した設定に基づきこのプロジェクトが格納されているGitHubリポジトリとNetlify CMSが通信されるよう。

Netlify CMSのドキュメントからそれについて引用する。

```yaml
backend:
  name: git-gateway
  branch: master
```

> 上記の設定はバックエンドプロトコルとパブリケーションブランチを指定します。Git Gatewayは、あなたのサイトの認証されたユーザーとあなたのサイトレポの間のプロキシとして機能するオープンソースAPIです。（詳細については、後述の「認証」セクションで説明します。）branch宣言を省略した場合、デフォルトはになりmasterます。

とのことである。

NetlifyはGitHubリポジトリと連携してホスティングされているので何となくイメージはしやすい。

おそらく、Netlify CMSでデータの更新があれば、その更新内容が連携されているGitHubリポジトリにプッシュされるのではないだろうか。

ブログの更新後にGitHubをチェックしたらcommitの数が１つ増えていた。 そのcommitの内容は、/pages/blog/~.mdだった。なるほどな〜という感じ。

Netlify CMSのAdd to Your Siteドキュメントでは続けて、編集ワークフローやメディア保存フォルダなどについて説明しているが簡単な文字ベースのブログであればここまでの内容で実装できそうだ。

画像なども追加したくなるだろうと用意に想像できるが今は一旦飛ばして今度確認しよう。
