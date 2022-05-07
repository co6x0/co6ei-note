---
title: "Nuxt.jsの開発環境を整える"
date: "2019-07-21"
categories: 
  - "development"
tags: 
  - "nuxt-js"
---

* * *

とりあえずこのページの通りに進める。

```bash
yarn create nuxt-app <project-name>
```

色々質問されるが、ずっとEnter押し続けるだけでもOKだと思う。

僕の場合は、

Choose Nuxt.js modulesで、`Axios`と`PWA Support`

Choose linting toolsで、`ESLint`と`Prettier`

のチェックをすべて入れた。あると便利。

少し迷ったのが、Choose rendering modeという項目。Universal(SSR)かSingle Page Appか選ぶのだが、どう選ぶべきなのかイマイチわからない。

[Nuxt.jsを使うときに、SPA・SSR・静的化のどれがいいか迷ったら - Qiita](https://qiita.com/nishinoshake/items/f42e2f03663b00b5886d)

この記事には、

> SPA（Single Page Application） 利点 ・実装しやすい ・サーバーの準備が楽 欠点 ・初期表示が遅い ・SEOに不安がある ・OGをページごとに設定できない
> 
> SSR（Server Side Rendering） 利点 ・SPAの欠点を解消できる 欠点 ・実装が少し面倒 ・サーバーの準備が面倒

とある。

実装しやすいなら、ということでSPAを選択することにした。欠点の「SEOに不安がある」「OGをページごとに設定できない」というのは解決可能な気もするのだけど、どうなのだろう？

SPAはGatsby.jsでの実装しかまだしたことがないので、NuxtにはNuxtの作法と言うか、仕様みたいなものもあるのかもしれない。

ということで、Single Page Applicationを選択して、インストールが開始される。

作られたディレクトリにcdで移動して、`yarn dev`する。

[http://localhost:3000/](http://localhost:3000/)にアクセスすると以下の画面が現れる。

![Nuxtのインストール後の画面](images/スクリーンショット-2019-07-21-2.44.05.png)

順調そうだが、`yarn dev`したタイミングでERRORを吐いた......。

```bash
DeprecationWarning: Tapable.plugin is deprecated. Use new API on .hooks instead
```

以下のIssueによると、Nuxtのpwa-moduleを最新のベータ版(v3.0.0-beta.16)にアップデートしてくれ、とのこと。

[DeprecationWarning: Tapable.plugin is deprecated. Use new API on .hooks instead · Issue #120 · nuxt-community/pwa-module](https://github.com/nuxt-community/pwa-module/issues/120)

```bash
yarn upgrade --latest @nuxtjs/pwa
```

で最新のバージョンにアップグレードされる。

更新することによってエラーは出なくなったが、あくまでベータ版なので自己責任で。

作ってもらったNuxtのプロジェクトを触ることは今までにもあったのだが、思っていたよりもアッサリ環境構築ができた。

まだNuxtがどういう構造になっているのか良く分からないので次はHello Worldまでやっていく。

[nuxtjs.org](https://ja.nuxtjs.org/examples/)
