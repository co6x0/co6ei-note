---
title: "パララックス-1 | ピュアなJavaScriptでインタラクティブなアニメーションを自前で実装したい Vol.1"
date: "2019-12-16"
categories: 
  - "Development"
tags: 
  - "JavaScript"
  - "アニメーション"
  - "インタラクション"
  - "パララックス"
---

ここ半年くらいずっと会社で携わっているプロジェクトでインタラクティブなアニメーションを実装する機会がちょくちょくあったので、忘れないように何回かに分けて記事にしていこうと思いました。いつものことですが更新頻度はめっちゃ遅いと思われます。

第一回目はパララックススクロール(長いので以下パララックス)。

僕がWeb業界に入った頃はみんなこぞって使っていたアニメーションで、パララックス(Parallax)とは視差という意味。ユーザーのスクロールによって動く要素のスピードをバラバラに設定することでスクロールに奥行きを与えるやつ。

もはやWebでは定番のインタラクションなので、詳しくパララックス自体について説明はしませんが、このパララックスというものは認知度の割にちゃんと実装されていることが少ないインタラクションでもあります。

実装方法としては、CSSの `background-attachment: fixed;`を利用した簡易的なパララックスと、ScrollMagicなどのライブラリを利用するのが代表的なやり方(調べると良く出てくるやり方)です。

CSSのほうは実装が非常に簡単なのでちょっとしたアクセントには良いと思いますが、本来のパララックスとはちょっと挙動が異なり、そこまで魅力的なインタラクションには感じないです。

そして、ライブラリを利用する方法ですが、パララックス自体が流行ったのがまぁまぁ前なので、ライブラリがメンテナンスされていないケースも多く、現在主流となっているVueやReactなどのJavaScriptフレームワークを利用した開発には使えないことも多いです。(使おうと思えば使えるけどそこまでするメリットはない気がしている)

ということで、タイトルにある通りですが今回はピュアなJavaScriptで、パララックスを実装してみようと思います。

# 準備

とくにライブラリとか使わなくても出来るのですが、なるべく楽はしたいので、要素を動かすのにGSAPを使用します。最近v3.0がリリースされて更に使いやすくなり、DOMをアニメーションさせるならGSAPを使っておけば大体どうにかなる、そんな感じです。

[GSAP - GreenSock](https://greensock.com/gsap/)

パッケージマネージャーを利用してimportしても良いし、とりあえずCDNからダウンロードしても良いと思います。

```bash
yarn add gsap || npm install gsap
```

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.0.4/gsap.min.js"></script>
```

HTMLとCSSは軽くこんな感じでいきましょう。

```html
<body>
  <div class="wrapper">
    <div class="background"></div>
    <p class="title">Hello World!</p>
    <p class="caption">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
    </p>
  </div>
</body>
```

```css
body {
  font-family: -apple-system, BlinkMacSystemFont, Hiragino Sans, '游ゴシック体', YuGothic, 'Yu Gothic Medium', Meiryo, sans-serif;
}

.wrapper {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  padding: 800px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  > .background {
    display: block;
    width: 400px;
    height: 400px;
    margin-bottom: 24px;
    background: url('https://images.unsplash.com/photo-1548247416-ec66f4900b2e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=80');
    background-size: cover;
  }

  > .title {
    font-size: 32px;
    font-weight: 700;
    line-height: 1;
    margin-bottom: 16px;
  }

  > .caption {
    font-size: 18px;
    text-align: center;
    line-height: 1.6;
    color: gray;
  }
}
```

# 実装

## 実装の方針

コードを書く前に、パララックスはどのように動いているのかを確認します。

パララックスにも色んなバリエーションがあるのですが、基本的な挙動としては「スクロールに応じて一定量動かす」というもの。簡単ではありますが、これが一旦の実装のゴールとなります。

その挙動を実装するには、まずは各要素の位置と高さを取得し、ユーザーが現在みている位置との比率を計算します。

もう少し具体的にいうと、画面に要素の最上部が入る位置を1、画面に要素の最下部が入る位置を0、というように各要素の画面表示率を設定するのが最初のステップになります。

この比率(Ratio)を作っておくと、1以上、または0以下のときは各要素のスクロールイベントを破棄することで、イベントの最適化にも活用できます。スクロールイベントはほんとうに重い。

Ratioを求めることが出来ればほぼ終わったようなもので、それ以降は好みのアニメーションをつけたり色々できるかなと思います。

## 画面表示率を求める

まずは、動かしたいHTMLの各要素にidを追加し、JavaScriptでそれぞれの要素を取得。

```html
<body>
  <div class="wrapper">
    <div id="targetImage" class="image"></div>
    <p id="targetTitle" class="title">Hello World!</p>
    <p id="targetCaption" class="caption">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
    </p>
  </div>
</body>
```

```javascript
const targetImage = document.getElementById('targetImage')
const targetTitle = document.getElementById('targetTitle')
const targetCaption = document.getElementById('targetCaption')
```

window上部から要素までの距離と要素の高さをもらって、オブジェクトにまとめる。

```javascript
const targets = {
  image: {
    y: targetImage.offsetTop,
    height: targetImage.clientHeight
  },
  title: {
    y: targetTitle.offsetTop,
    height: targetTitle.clientHeight
  },
  caption: {
    y: targetCaption.offsetTop,
    height: targetCaption.clientHeight
  }
}
```

要素の上部が画面表示率1、要素の下部が画面表示率0と……こう分かってはいてもどうも動かしてみないとピンと来ないことはあります。

とりあえず、スクロール量を取得してみて、targetsの各プロパティと数値を比較してみましょう。

```javascript
window.addEventListener('scroll', () => {
  const scrollAmount = window.pageYOffset
  console.log(scrollAmount)
})

image: {
  y: 808
  height: 400
},
title: {
  y: 1264
  height: 32
},
caption: {
  y: 1330
  height: 140
}
```

僕の環境ではこのような数値が出ていますが、ブラウザによっては誤差があるかと思います。

さて、スクロールしてみるとConsoleに数字がズラーッと表示されると思いますが、この数字と上記の数値を比較していると何となく分かってくることが2つほどあります。

1. 要素の下部が見えなくなるのは、スクロール量が要素の`y + height`になったとき
2. 要素の上部が見えはじめるのは、スクロール量以外にもwindowの高さが関わっている

なんとなく今ある情報だけで上手くできそうなのですが、実はもう一つwindowの高さが必要になるので手に入れます。

```javascript
const windowHeight = window.innerHeight
```

これで要素の見え始めるスクロール量が分かります。`y - windowHeight`ですね。

つづいて、要素が見えるまで/要素が見えなくなるまでのスクロール量を定義します。

```javascript
const targetIndicators = {
    image: {
      top:  targets.image.y - windowHeight,
      bottom: targets.image.y + targets.image.height
    },
    title: {
      top:  targets.title.y - windowHeight,
      bottom: targets.title.y + targets.title.height
    },
    caption: {
      top:  targets.caption.y - windowHeight,
      bottom: targets.caption.y + targets.caption.height
    },
  }
```

ここから良い感じに計算式を導き出す方法を紹介できればカッコいいのですが、数学の記憶が完全に抜け落ちていてダメなので、画面表示率を求める式は過程なく以下。(過程をおしえてほしい)

```javascript
(targetIndicators.image.bottom - scrollAmount + (targetIndicators.image.top * ((targetIndicators.image.bottom - scrollAmount) / targetIndicators.image.bottom))) / targetIndicators.image.bottom
```

非常に可読性が悪いので、関数にします。

```javascript
function calculateRatio(top, bottom, scroll) {
  const topAdjustNum = top * ((bottom - scroll) / bottom)
  return (bottom - scroll + topAdjustNum) / bottom
}
```

まとめるとこんな感じ。loadイベントで囲っているのは、CSSまで読み込みが完了しないと各要素の高さと位置が確定しないからですね。

```javascript
window.addEventListener('load', () => {
  const windowHeight = window.innerHeight
  const targetImage = document.getElementById('targetImage')
  const targetTitle = document.getElementById('targetTitle')
  const targetCaption = document.getElementById('targetCaption')

  const targets = {
    image: {
      y: targetImage.offsetTop,
      height: targetImage.clientHeight,
    },
    title: {
      y: targetTitle.offsetTop,
      height: targetTitle.clientHeight
    },
    caption: {
      y: targetCaption.offsetTop,
      height: targetCaption.clientHeight
    }
  }

  const targetIndicators = {
    image: {
      top:  targets.image.y - windowHeight,
      bottom: targets.image.y + targets.image.height
    },
    title: {
      top:  targets.title.y - windowHeight,
      bottom: targets.title.y + targets.title.height
    },
    caption: {
      top:  targets.caption.y - windowHeight,
      bottom: targets.caption.y + targets.caption.height
    },
  }

  function calculateRatio(top, bottom, scroll) {
    const topAdjustNum = top * ((bottom - scroll) / bottom)
    return (bottom - scroll + topAdjustNum) / bottom
  }

  window.addEventListener('scroll', () => {
    const scrollAmount = window.pageYOffset
    const ratio = {
      image: calculateRatio(targetIndicators.image.top, targetIndicators.image.bottom, scrollAmount),
      title: calculateRatio(targetIndicators.title.top, targetIndicators.title.bottom, scrollAmount),
      caption: calculateRatio(targetIndicators.caption.top, targetIndicators.caption.bottom, scrollAmount),
    }
    console.log(ratio)
  })
})
```

* * *

Ratioを手に入れることが出来たので今回はここまでで終わり。

次回で実際にRatioを利用してパララックススクロールを実装していきたいと思います。
