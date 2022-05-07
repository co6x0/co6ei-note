---
title: "Nuxt.jsでのHello Worldと構造のチェック"
date: "2019-07-21"
categories: 
  - "development"
tags: 
  - "nuxt-js"
---

ここの通りに進める。

[nuxtjs.org](https://ja.nuxtjs.org/examples/)

と思ったが動画とソースコードが置いてあるだけのかなり簡素な作りなので、少し遠回りして、理解を深めながらHello Worldしようと思う。

まず、`create nuxt-app`によって作られたままのフォルダ群を見ていく。以下のページを参考にする。

[nuxtjs.org](https://ja.nuxtjs.org/guide/directory-structure)

このページにすべて書いてあるので基本的にはそちらを読むとして、Hello Worldからフツーの静的なWebサイトを制作するのに必要そうなところを重点的に見ていく。

正確には、`middleware`と`plugins`と`store`と`nuxt.config.js`はとばします。

バーっとフォルダを開いていくと、大体のフォルダが`README.md`しか持っておらず、このマークダウンには当該フォルダの説明が英語で記載されている。やさしい。

この中で、`README.md`しか入ってないフォルダが上記であげたディレクトリたち。今は一旦気にしない。

まず、`Pages`を確認する。

# Pages

Vueも真面目に勉強したことが無いゆえ知識がまばらなのだが、Vueでは`<template>`の記述のある.vueファイルはコンポーネントとして使用できるようになる。

単一ファイルコンポーネントというやつ。

[単一ファイルコンポーネント - Vue.js](https://jp.vuejs.org/v2/guide/single-file-components.html)

ただ、Nuxtの場合は、ほとんどのファイルが<template>で囲まれることになる。それがコンポーネントでなくても。まさに、その例がこの`Pages`に含まれるファイルなのではないだろうか。

jsxの一番上に1つの親要素を用意しなければいけないように<template>で囲むのかと思ったが、<template>の中で更に全体を囲む親要素は必要なよう。

また、このPagesディレクトリに入っている.vueファイルは自動的に読み込まれ、ルーティングを上手い具合にやってくれるそう。ありがたい。

（話は変わるけど、ファイルちょっといじっただけでESLintがめっちゃ怒ってきて困る）

# ※ESLint

かなり怒ってきて色々とシンドいので先にこいつをどうにかする。

環境によって状況が変わってきそうなので、リンターは取り敢えずいいから先に進みたい、という人はESLintを解除してしまっても良いと思う。

.eslintrc.jsに新しく記述を追加する。会社のプロジェクトで使用しているやつを借りた。

```javascript
module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  env: {
    serviceworker: true
  },
  extends: [
    'prettier',
    'prettier/vue',
    'plugin:prettier/recommended',
    '@nuxtjs',
    'plugin:nuxt/recommended'
  ],
  plugins: ['prettier'],
  // add your custom rules here
  rules: {
    'dot-notation': 0,
    'no-unused-vars': 0,
    'arrow-parens': 0,
    'space-before-function-paren': 0,
    'vue/singleline-html-element-content-newline': 0,
    'no-console': 'off',
    'vue/html-self-closing': [
      'error',
      {
        html: {
          void: 'always'
        }
      }
    ]
  }
}
```

詳しく見ると時間がかかりそうなので内容についてはとばす。

ここまで行っても現段階で出てるエラーとしては、`<a>`についている`target="_blank"`だと思う。このエラーに対しては、`<a>`に対し`rel="noreferrer noopener"`と記述を追加してあげることで、修正することが出来る……らしいのだがまだエラーが出る。

どうもESLintではなくPrettierがエラーを吐いているらしい。消耗してきた。

紆余曲折あり、以下の記事を参考に環境を整えてどうにか無意味なエラーのない世界が訪れた。

ただ、この記事通りでもちょっとハマって、VS Codeの環境設定でFormat On Saveのチェックを外したら上手くいった。

[もうprettierで消耗したくない人へのvueでのeslint設定 - Qiita](https://qiita.com/diggy-mo/items/bb01bcb54237f16bb008)

しかし、つぎは`rel="noreferrer noopener"`の記述をなくしても`target="_blank"`のエラーが出なくなってしまった......もう何がなんやら。ESLintとPrettierについては一度腰を据えて考えてみたほうが良さそう。

ココ結構な離脱ポイントな気がするし、最初は`create nuxt-app`のときESLintとPrettierのチェック外したほうが良いのかもしれない。

かなり話がそれたがやっと本題に戻れる。

# components

pagesのindex.vueで使用されているのコードはcomponentの中にある。

言うまでもないが、コンポーネントとして作られたファイルは他のファイルに読み込んで、ある特定の役割を果たす。再利用されるパーツをコンポーネントに分けることでコードの可読性や保守性が高くなるのだ。

ドキュメントに少し気になる記述がある。

> components ディレクトリには Vue.js のコンポーネントファイルを入れます。これらのコンポーネントでは asyncData や fetch を使うことはできません。

これらも併せて目を通しておく。（あれ、使えてない？）

[nuxtjs.org](https://ja.nuxtjs.org/guide/async-data/)

[Nuxt.jsのasyncDataとfetchは何が違うのか - Qiita](https://qiita.com/Tsuyoshi84/items/2e47b7f5e7fb8c0c3c66)

# layouts

上記のページ内にあるように、デフォルトレイアウトとして`default.vue`を追加すると、レイアウトが指定されていないすべてのページに適応されるようだ。

現段階の`default.vue`にはリセットCSSやその他のスタイルまで書かれているが、この管理法は良くなさそう。リセットCSSなどは他ファイルに分けてどこかで統一して読み込ませたい。

しかし、layoutはどういう場面で使うのだろう。ワンカラム、ツーカラム、などのサイトの大枠を変えるような時に使用する？layoutを使わなくても実現できそうなので、まだ使い所が掴めない。

ドキュメントによると、エラーページはpageではなくlayoutで作るらしい。

ちなみに、layoutには`<nuxt />`コンポーネントが必須。ここでpageの中身などが読み込まれていく。

以下の画像を見るとそれぞれがどのように包まれているかイメージしやすい。

![nuxt-views-schema](/nuxt-views-schema.svg)

# Hello World!

ここまで分かれば、何てこともなくHello World出来るはず。

というか、page内のindex.vueを少しいじるだけですぐに出来るので、かなりここまで遠回りしたとも言える。

まず、index.vueの中身をゴッソリ削る。

```html
<template>
  <div class="container">
    <Logo />
  </div>
</template>

<script>
import Logo from '~/components/Logo.vue'

export default {
  components: {
    Logo
  }
}
</script>

<style>
.container {
  width: 100%;
  height: 100vh;
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
```

ふつうにHello Worldと表示させるだけではつまらないので、少し動きを加える

5 sec from Hello World!のように、1秒経過ごとに数値を入れ替えてみよう。

こんな感じ。

```html
<template>
  <div class="container">
    <Logo />
    <h1>{{ `${timer} min` }} from Hello World!</h1>
  </div>
</template>

<script>
import Logo from '~/components/Logo.vue'

export default {
  components: {
    Logo: Logo
  },
  data() {
    return {
      timer: 0,
    }
  },
  created() {
    setInterval(() => {
      this.oneMinCounter()
    }, 1000)
  },
  methods: {
    oneMinCounter() {
      return this.timer ++
    }
  }
}
</script>

// <style>省略
```

![result](images/kapture_2019-07-21_at_6.38.06.gif)

`data()`とか`created()`とか`methods:`とか色々使ってはいるけど、イマイチ使い所がまだ分からないので、次はライフサイクルについて見ていく。

[Vue.js と Nuxt.js のライフサイクル早引きメモ - Qiita](https://qiita.com/japboy/items/b67bae0bac1aeefb2680)
