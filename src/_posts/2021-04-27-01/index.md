---
title: "WordPress on Google Compute EngineのREST APIからNext.jsでブログを構築する"
date: "2021-04-27"
categories: 
  - "Development"
tags: 
  - "Google Compute Engine"
  - "Next.js"
  - "TypeScript"
  - "WordPress"
---

WordPressくんは僕がWebの仕事を始めたての頃それはもう大変お世話になった（苦汁も大量になめさせていただいた）CMSみたいなフレームワークみたいなソフトウェアで、当時はWebサイト制作といったら大抵はWordPressを使用していたように思います。

しかし、それは過去の話ではなく今現在もWebサイト全体のシェア率で言うとWordPress製のサイトは40%程で、日本国内に限って言うと80%を超えるとの情報もあります。

[https://kinsta.com/jp/wordpress-market-share/](https://kinsta.com/jp/wordpress-market-share/)

[https://w3techs.com/technologies/segmentation/cl-ja-/content\_management](https://w3techs.com/technologies/segmentation/cl-ja-/content_management)

ただ、実際のところWordPressを利用したWebサイト制作は色々と問題もあり、数年前くらいから記事コンテンツを使用したWebサイト制作の潮流はHeadless CMSへ大きく動き始めているように思います。が、バイアスがおそらくかかっている。

Headless CMSがなぜ注目されているのかみたいな話は深く言及しませんが、個人的にはJavaScriptの各種フレームワークの力が強まった結果、WordPressというソフトウェアに縛られるスキルよりもJavaScriptというWebにおいては汎用的なスキルに移行したほうがお得という気持ちが大きいです。

それ以外で言うとコードの管理しやすさ、セキュリティの強化、表示速度の向上など……調べれば色々とメリットは出てきますが、開発体験がとにかく違いすぎるので、エンジニアにも嬉しいしWebサイトとしても嬉しいし、色んな意味で移行しやすいツールだと思います。

そんな感じのHeadless CMSですが、日本語に対応しているCMSは少なく、現状クライアントワークで使うならmicroCMSほぼ一択という状況が続いています。

[https://microcms.io/](https://microcms.io/)

僕自身microCMSは実際に案件でも使用していてアップデートも頻繁にあり使い勝手も良いですが、月額の利用料金が割とするので中小企業のWebサイトに使うには（提案するには）少しばかりハードルが高いです。権限管理もしたいとなってくるとそれはもう大変な額に……。

ということで、WordPressで上手くできないかなと思った次第です。

開発体験を担保しつつ、Headless CMSの恩恵も受けつつ、日本語の管理画面を提供して、ランニングコストは少なく、やっていきましょう。

## WordPressをGoogle Compute Engineに構築する

以下から数タップでWordPressのインスタンスを作成できます。手軽。

[https://cloud.google.com/wordpress?hl=ja](https://cloud.google.com/wordpress?hl=ja)

WordPressをGCPやAWSなどのクラウドプラットフォームで利用するにはDockerイメージを作成してそれをデプロイする必要がある……？あってます……？レベルの理解度でしたが、プラットフォーム側がベストプラクティス的なコンテナ（仮想マシン？）を用意してくれているのはありがたいですね。

今回はWordPressはAPIを呼び出すためだけに利用する + Next.jsでSSGするのでデフォルトの設定は少々オーバースペックな気がしますが、そこら辺はまた別で考えましょう。

さて、インスタンスの作成に体感5分くらいかかりましたが、これが終わったら諸々の初期設定を尋ねられます。

### インスタンスの初期設定

まず最初に目につくのが**Zone**という項目ですが、これはリージョンとはまた違う概念？

`asia-northeast1` や `asia-northeast2`まではリージョンで、それ以降の `-a,-b,-c` のような接尾辞がゾーンを表しているようです。選び方としては以下のガイドにあるように「障害対応とネットワーク レイテンシの短縮」を念頭に選択するのが良さそうです。

[https://cloud.google.com/compute/docs/regions-zones](https://cloud.google.com/compute/docs/regions-zones)

とりあえず `asia-northeast1-b` を選択しました。`-a` ではないのはGPUを使用しないと思われるから（ゾーンによってはGPUリソースが使用できない）ですが、正直これで良かったのかまだ分かっていません。というか、セレクトボックスの順番が少し変で、`asia-northeast1-b, c, a` という順番で上から列挙されているんですよね。きっとbで良かったんだ。

つづいて、**Machine type**ですがデフォルトではvCPU x 2(e2-micro)なるものが選択されていました。

ここの指定を変えると推定費用が大きく変わるので一番安くなるやつを選びたくなってくる（この時点だと1ヶ月$44.80かかるとか表示されていて怖い）のですが、あまりにCPUが貧弱すぎて問題が発生するとかも今は考えたくないのでこのまま進みます。

その他の設定は概ねそのままで、Stackdriverのチェックボックスを2つとも有効にしておきます。ファイアウォールの設定だけ少し気になりました。もしかしたら後で設定するかも。

最下部のデプロイボタンを押すと、ページが遷移して何やら色んなものが作成されている様子を見ることができます。今の所なにも分からない（本当に）。

## WordPressの動作確認と設定

デプロイが終わるとWordPressやMySQLのアカウント情報などの諸々の情報が右側のペインに表示されているはずです。

とりあえず、Site addressに記載されているURLからサイトにアクセスしてみます。

WordPressを使ったことのある人には馴染み深いトップページです。また、 `/wp-admin` へのログインも特に問題なくできました。

![](images/2021-03-20_18.32.02-1024x623.png)

管理画面へログインしたらWordPressのバージョンをアップデートしてくれと言われていたのでアップデートしたのですが、何となく僕らがWordPressから離れていた間も着実にバージョンアップを重ねていたのだなぁなど思い感慨深い気持ちになりました。

……ということで、ざっくりWordPressサイト自体の動作確認をしたのですがこちらは特に問題無さそうでした。GCEのWordPressディレクトリ(?)に「推奨される次のステップ」として幾つかのステップが記載されているのでこちらもこなしていきましょう。

### phpMyAdminの確認

こちらも特に問題なさそうです。いちいち懐かしさを感じてしまう。

### HTTPSトラフィックの許可

初期設定の時点でやっておけば良かったです。APIリクエストをする際におそらく問題が発生しそうなので設定します。

`gcloud` から始まるコマンドですぐに対応できます。Google Cloud SDKのインストールについては特に説明しませんがやりましょう。

### 生成されたパスワードの変更

WordPress, phpMyAdminそれぞれの管理画面から変更できます。詳しい変更方法は省きますがユーザーとかアカウントとか書いてあるところから大体できます。

また、パスワードを更新してもGCEの方で表示されていたパスワードの表示は更新されませんので、以降はちゃんとパスワード管理しましょう。おそらくもうこちらは不要だと思うので、VMインスタンスのカスタムメタデータから以前のパスワード等の情報は削除してしまっても良いかと思います（たぶん）。

### エフェメラル外部IPアドレスの昇格

何を言っているのかよく分からないですが、まずエフェメラル外部IPアドレスとは……

> エフェメラル外部 IP アドレスは、リソースの寿命を超えて持続しない IP アドレスです。IP アドレスを指定せずにインスタンスまたは転送ルールを作成すると、リソースにはエフェメラル外部 IP アドレスが自動的に割り当てられます。 エフェメラル外部 IP アドレスは、リソースを削除するとリソースから解放されます。VM インスタンスの場合、インスタンスを停止すると、エフェメラル外部 IP アドレスも解放されます。インスタンスを再起動すると、新しいエフェメラル外部 IP アドレスが割り当てられます。

とのことです。また、ephemeralとは「一時的な〜」などという意味を持ちます。

エフェメラル外部IPアドレスの昇格というのは、IPアドレスを一時的ではなく永続的にプロジェクトに割り当てる、といった意味なのでしょう。（ドキュメントでは静的外部IPアドレスと表現されています。）

以下のページの内容通りに進めれば割とすんなり対応できると思います。

[https://cloud.google.com/compute/docs/ip-addresses/reserve-static-external-ip-address?hl=ja#promote\_ephemeral\_ip](https://cloud.google.com/compute/docs/ip-addresses/reserve-static-external-ip-address?hl=ja#promote_ephemeral_ip)

また、今回は特に気にしなくて良いと思いますが、このインスタンスをそのままWebサイトとして公開するためにドメインを設定したい、という場合はCloud DNSとIPアドレスを紐付けることで対応できるのではないでしょうか。

[https://cloud.google.com/dns?hl=ja](https://cloud.google.com/dns?hl=ja)

以下のページも関係しているかも？しれない。

[https://cloud.google.com/compute/docs/internal-dns?hl=ja](https://cloud.google.com/compute/docs/internal-dns?hl=ja)

## WP REST APIの設定

結論特に設定することは無いのですが、WordPressのドキュメントにあるREST API Handbookを見ながら色々試してみます。

[https://developer.wordpress.org/rest-api/](https://developer.wordpress.org/rest-api/)

### APIを実際に試す

`/wp-json/` にアクセスすると使用可能なエンドポイントなどを示すJSONが返却されるらしいのですが、どうも僕の場合は表示されず、よく見ると「**[きれいでないパーマリンク](https://wordpress.org/support/article/using-permalinks/)**」を使っていると `/?rest_route=/` になるらしいです。（きれいでないパーマリンクはデフォルトの設定なので何だかなぁという気持ちになります。）

しょうがないのできれいなパーマリンクを設定しました。

![](images/ss-1024x203.png)

とりあえず、以下のようなcurlコマンドを打つと記事の一覧が返ってきます。

```bash
$ curl http://<domain>/wp-json/wp/v2/posts
```

認証なしでこんなに簡単にデータが取得出来て良いのかと思いましたが、そこら辺はこのハンドブックのよくある質問に記載されています。

「REST APIを無効にすることは実質出来ない」「すべてのリクエストに認証を必要とさせることも可能」とのことです。

[https://developer.wordpress.org/rest-api/frequently-asked-questions/](https://developer.wordpress.org/rest-api/frequently-asked-questions/)

### 認証について

基本的に見られても問題ないデータがほとんどだと思うのですが、Application Passwordsというエンドポイントは流石に気になったので試してみましょう。

[https://developer.wordpress.org/rest-api/reference/application-passwords/](https://developer.wordpress.org/rest-api/reference/application-passwords/)

```bash
$ curl http://<domain>/wp-json/wp/v2/users/<user_id>/application-passwords
```

ステータスコード501が返ってきました。

僕の場合はWordPressの言語設定を日本語にしているからか返却されたメッセージがUnicodeでした。変換すると「アプリケーションパスワードは利用できません」。とりあえず一安心。

```json
{"code":"application_passwords_disabled","message":"\\u30a2\\u30d7\\u30ea\\u30b1\\u30fc\\u30b7\\u30e7\\u30f3\\u30d1\\u30b9\\u30ef\\u30fc\\u30c9\\u306f\\u5229\\u7528\\u3067\\u304d\\u307e\\u305b\\u3093\\u3002","data":{"status":501}}
```

当然ではありますが、この他にもPOST, DELETEリクエストは認証が必要なようです。

今回はGETさえできれば問題ないので認証は不要な気がしますが、実装を進めていく途中で必要になったら以下のページを参考にします。

[https://developer.wordpress.org/rest-api/using-the-rest-api/authentication/](https://developer.wordpress.org/rest-api/using-the-rest-api/authentication/)

認証プラグインは以下が扱いやすそう。

[https://wordpress.org/plugins/jwt-authentication-for-wp-rest-api/](https://wordpress.org/plugins/jwt-authentication-for-wp-rest-api/)

とはいえ、今回のケースだとGETさえ認証を通さずにリクエストされたくないという場合を除き、外部から認証できる仕組みを導入しない方がセキュアなように思います。

### JavaScriptクライアントライブラリ

WP REST APIを簡単に扱うためのクライアントライブラリもあるようです。

[https://developer.wordpress.org/rest-api/using-the-rest-api/client-libraries/](https://developer.wordpress.org/rest-api/using-the-rest-api/client-libraries/)

JavaScript用のものはこちら。@typesで型定義ファイルもありました。

[https://github.com/wp-api/node-wpapi](https://github.com/wp-api/node-wpapi)

[https://www.npmjs.com/package/@types/wpapi](https://www.npmjs.com/package/@types/wpapi)

## Next.jsで記事を表示する

`npx create-next-app` でNext.jsのセットアップを行います。TypeScriptを使用したいのでここら辺の設定も一通りやっておきます。

[https://nextjs.org/docs/basic-features/typescript](https://nextjs.org/docs/basic-features/typescript)

### WP REST APIを使用する準備など

まずは上述の `WP-API/node-wpapi` をインストール。

```bash
$ npm install --save wpapi
$ npm install --save @types/wpapi
```

概ねドキュメントの通りですが、以下のようにすることで簡単に記事の情報が取得できます。

```typescript
import WPAPI from 'wpapi'

const wp = new WPAPI({ endpoint: 'yourdomain/wp-json' })
export const getPosts = () => {
  wp.posts()
    .get()
    .then((data) => {
      console.log(data)
    })
    .catch((error) => {
      throw new Error(error)
    })
}
```

今回はGETしか使用しませんが、POSTなども手軽に行えそうです。

ただ、READMEにあるサンプルコードだとベーシック認証を介してリクエストしていますが、これは開発やテストのみに使用して本番では使用してはならない。

[https://github.com/WP-API/Basic-Auth](https://github.com/WP-API/Basic-Auth)

* * *

ここまで書いた所でレスポンスにも型が欲しい〜となって再度良さげなライブラリが無いか調べてみたらWordPressのgutenbergが以下のパッケージを公開していました。

ちゃんとメンテナンスされているし、ES2015+で動作するって書いてあるし絶対こっちの方が良い！

[https://www.npmjs.com/package/@wordpress/api-fetch](https://www.npmjs.com/package/@wordpress/api-fetch)

……と思ったのですが、これは `window.fetch` のラッパーらしく、Next.jsとは相性が悪い（windowオブジェクトがサーバーサイドで利用できないため）のでお見送りです。

そんな中、WordPressのコアファイルからの出力を元に定義されたという型のパッケージを見つけたのでこちらを活用していきます。（コードを書きながら文章も書いていると話が散漫としがち）

[https://github.com/johnbillion/wp-json-schemas/tree/trunk/packages/wp-types](https://github.com/johnbillion/wp-json-schemas/tree/trunk/packages/wp-types)

先程のコードはこのようになりました。

```typescript
// lib/api.ts
import WPAPI from 'wpapi'
import type { WP_REST_API_Posts } from 'wp-types'

const wp = new WPAPI({ endpoint: 'yourdomain/wp-json' })
export const getPosts = async () => {
  const posts: WP_REST_API_Posts = await wp
    .posts()
    .get()
    .catch((error) => {
      throw new Error(error)
    })
  return posts
}
```

そして記事の一覧表示はこのように。ISRのためにrevalidateも仕込んでおきましょう。

```typescript
// pages/index.tsx
import { GetStaticProps, NextPage } from 'next'
import { getPosts } from 'lib/api'
import type { WP_REST_API_Posts } from 'wp-types'

export const getStaticProps: GetStaticProps = async () => {
  const posts = await getPosts()
  return {
    props: {
      posts,
    },
    revalidate: 1,
  }
}

const Home: NextPage<{ posts: WP_REST_API_Posts }> = ({ posts }) => {
  console.log(posts)
  return (
    <div>
      <section>
        <h1>Blog</h1>
        <ul>
          {posts.map(({ id, title, excerpt, date }) => (
            <li key={id}>
              <h2>{title.rendered}</h2>
              <p>{excerpt.rendered}</p>
              <time>{date}</time>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
export default Home
```

でてきました。

![](images/2021-04-27_1.09.19-1024x461.png)

### 記事一覧と記事個別ページの作成

一覧については上のコードとほぼ同じですが、Linkの追加やexcerptとdateをちょっといじったりしてます。

```typescript
// pages/index.tsx
import { GetStaticProps, NextPage } from 'next'
import Link from 'next/link'
import dayjs from 'dayjs'
import { getPosts } from 'lib/api'
import type { WP_REST_API_Posts } from 'wp-types'

export const getStaticProps: GetStaticProps = async () => {
  const posts = await getPosts()
  return {
    props: {
      posts,
    },
    revalidate: 1,
  }
}

const Home: NextPage<{ posts: WP_REST_API_Posts }> = ({ posts }) => {
	const removeLinkMore = (excerpt: string) => {
    const index = excerpt.indexOf('<p class="link-more">')
    return index ? excerpt.slice(0, index) : excerpt
  }

  const convertDate = (dateString: string) => {
    return dayjs(dateString).format('YYYY-MM-DD')
  }

  return (
    <section>
      <h1>Blog</h1>
      <ul>
        {posts.map(({ id, title, excerpt, date }) => (
          <li key={id}>
            <h2>
              <Link href={`/posts/${id}`}>{title.rendered}</Link>
            </h2>
            <div
              dangerouslySetInnerHTML={{
                __html: removeLinkMore(excerpt.rendered),
              }}
            />
            <time>{convertDate(date)}</time>
          </li>
        ))}
      </ul>
    </section>
  )
}
export default Home
```

それっぽくなりました。

![](images/ss2-1024x958.png)

つづいて記事の個別ページです。

長い記事を書いていると後半で説明する気力が少しずつ無くなってきますが、ISR関連のコードが肝です。

[https://nextjs.org/docs/basic-features/data-fetching#incremental-static-regeneration](https://nextjs.org/docs/basic-features/data-fetching#incremental-static-regeneration)

```typescript
// pages/posts/[id].tsx
import dayjs from 'dayjs'
import { useRouter } from 'next/router'
import { GetStaticPaths, GetStaticProps, NextPage } from 'next'
import { getPosts, getPost } from 'lib/api'
import type { WP_REST_API_Post } from 'wp-types'

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = getPosts()
  const paths = (await posts).map(({ id }) => {
    return { params: { id: String(id) } }
  })

  return {
    paths,
    fallback: true,
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const postId = Number(params?.id)
  const postData = await getPost(postId)

  return {
    props: {
      postData,
    },
    revalidate: 1,
  }
}

const Post: NextPage<{ postData: WP_REST_API_Post }> = ({ postData }) => {
  const router = useRouter()
  if (router.isFallback) {
    return <div>Loading...</div>
  }

  const convertDate = (dateString: string) => {
    return dayjs(dateString).format('YYYY-MM-DD')
  }

  return (
    <article>
      <h1>{postData.title.rendered}</h1>
      <time>{convertDate(postData.date)}</time>
      <hr />
      <div dangerouslySetInnerHTML={{ __html: postData.content.rendered }} />
    </article>
  )
}

export default Post
```

`api.ts` に記事単体のデータを取得する `getPost` 関数も書いておきます。

```typescript
// lib/api.ts
import WPAPI from 'wpapi'
import type { WP_REST_API_Posts, WP_REST_API_Post } from 'wp-types'

const wp = new WPAPI({ endpoint: 'yourdomain/wp-json' })
export const getPosts = async () => {
  const posts: WP_REST_API_Posts = await wp
    .posts()
    .get()
    .catch((error) => {
      throw new Error(error)
    })
  return posts
}

export const getPost = async (id: number) => {
  const post: WP_REST_API_Post = await wp
    .posts()
    .id(id)
    .get()
    .catch((error) => {
      throw new Error(error)
    })
  return post
}
```

できました。

![](images/article-1024x850.png)

あとは、アイキャッチ画像やその他のブロックコンテンツについても試しつつ対応したいなと思いますが、長くなってきたので本記事では一旦ここまでとします。

途中で気づいたのですが、Next.jsの公式サンプルでCMSにWordPressを使う例がありました。

実装内容がかなり異なるとはいえもっと早く気づいて見とけばよかったですね。こちらも参考になるかもしれません。

[https://github.com/vercel/next.js/tree/canary/examples/cms-wordpress](https://github.com/vercel/next.js/tree/canary/examples/cms-wordpress)
