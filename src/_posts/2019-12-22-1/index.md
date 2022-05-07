---
title: "パララックス-2 | ピュアなJavaScriptでインタラクティブなアニメーションを自前で実装したい Vol.2"
date: "2019-12-22"
categories: 
  - "development"
tags: 
  - "javascript"
  - "アニメーション"
  - "インタラクション"
  - "パララックス"
---

前回の続きです。珍しく更新が早い。

[ピュアなJavaScriptでインタラクティブなアニメーションを自前で実装したい - Part1. パララックス](https://sixaxd.com/blog/201912164853/)

前回は動かしたい各要素のwindow内における表示率のRatioを求めました。

実は表示率だけで言うと、Intersection Observer APIのintersectionRatioプロパティから取得できるのですが、画面内に要素が入っているときにIntersection Observerをイベントに利用してアニメーションさせるのが少し面倒だった気がします。

以前、Intersection Observerでスクロールイベントを擬似的に再現してみたのですが、なんらかの理由で使用を見送ったのですよね。しかし、その理由を忘れてしまった。

ただ、どっちでもできると思うので好きな方を使って良いと思います。

👇これの途中で出てくるスクロールするとパーセンテージが1~100まで変化するサンプルが参考になると思われます。

[Intersection Observer API](https://developer.mozilla.org/ja/docs/Web/API/Intersection_Observer_API)

# Ratioを利用して要素を動かす

前回準備したGSAPの設定をします。

GSAPについては詳しく説明しないので、よく分からないところはドキュメントを読んでいただければと。

[Docs - GreenSock](https://greensock.com/docs/v3)

`gsap.defaults`で毎回書かないといけない、同じような設定を省略できます。

スクロールに連動して動くのでdurationが大きすぎると、ユーザーのスクロールというアクションへのフィードバックが遅れるので小さめに。easeもインタラクティブ性を追求するのであれば、スクロールの動きに連動するべきなのでnone(Linear)にします。

```javascript
gsap.defaults({
  duration: 0.1,
  ease: 'none'
})
```

つぎに、動かす要素の位置をスクロールによってアップデートする関数を用意します。

引数にはターゲットとなる要素と、ターゲットの画面表示率を設定。

ratioは上から下に行くにつれて1→0に向かっていくので、y方向のdistanceを目標とし、画面から要素が消える頃にdistance分だけ移動しているようなイメージで動かします。

```javascript
function updatePosition(target, ratio, distance) {
    gsap.to(target, {
      y: distance - distance * ratio
    })
  }
```

ここまで来たら、スクロールイベントの中で`updatePosition(targetImage, ratio.image, 120)`とかすると動くかと思います。

# アニメーションを最適化する

シンプルにy方向に移動するアニメーションを実装しましたが、Ratioを利用して他にも色々なことが出来ると思います。今回はそちら側はやりませんので、アニメーションの最適化をして終わりにします。

## preventDefault()を実行しないことを明示する

まずは一番簡単にできるスクロールイベントの最適化。

addEventListnerの第3引数であるoptionsのpassiveをtrueにすることで、ブラウザに対し指定関数内で`preventDefault()` を呼び出していないことを示します。

正直な所、僕も詳しくは理解できていないのですが、スクロールイベントの処理が終わるまで`preventDefault()`が実行されているかブラウザ側では判断ができず、その間はページのレンダリングをブロックする可能性があるらしい。それが原因でスクロールアニメーションのパフォーマンスが悪くなるよう？

[EventTarget.addEventListener()](https://developer.mozilla.org/ja/docs/Web/API/EventTarget/addEventListener)

## throttleでイベントの発火回数を間引く

つづいて、スクロールイベントの発火回数を間引きます。

ここでは以下のパッケージを利用します。（自前実装とは）

[niksy/throttle-debounce](https://github.com/niksy/throttle-debounce)

スクロールイベントの中で実行されるコードをthrottleで囲み、イベント内部の実行間隔を60fpsになるように16msごとに間引きます。

```javascript
window.addEventListener('scroll', throttle(16, () => {
    const scrollAmount = window.pageYOffset
    const ratio = {
      image: calculateRatio(image.top, image.bottom, scrollAmount),
      title: calculateRatio(title.top, title.bottom, scrollAmount),
      caption: calculateRatio(caption.top, caption.bottom, scrollAmount),
    }
    updatePosition(targetImage, ratio.image, 200)
    updatePosition(targetTitle, ratio.title, -320)
    updatePosition(targetCaption, ratio.caption, 40)
  }), {passive: true})
```

## requestAnimationFrameでレンダリングを待たせる

さらに、`requestAnimationFrame()`を使用し、レンダリングの準備が整ったタイミングでアニメーションが実行されるように。

throttleは使用せずにこちらだけでも良いような気がしますが、60Hz以上のリフレッシュレートを持つモニターの場合、こちらが想定している以上に処理が走ってしまう可能性があるのでthrottleもあったほうが万全かも？

より滑らかななほうが良い！という場合はthrottleは使わなくて良い気がします。

```javascript
let isRafActive = false

  window.addEventListener('scroll', throttle(16, () => {
    const scrollAmount = window.pageYOffset
    const ratio = {
      image: calculateRatio(image.top, image.bottom, scrollAmount),
      title: calculateRatio(title.top, title.bottom, scrollAmount),
      caption: calculateRatio(caption.top, caption.bottom, scrollAmount),
    }
    if (!isRafActive) {
      isRafActive = true
      requestAnimationFrame(() => {
        updatePosition(targetImage, ratio.image, 200)
        updatePosition(targetTitle, ratio.title, -320)
        updatePosition(targetCaption, ratio.caption, 40)
        isRafActive = false
      })
    }
  }), {passive: true})
```

## その他の最適化

現段階では動かす要素が表示領域外にあってもDOMのStyleに更新がかかっているのが確認できるかと思います。これは無駄な処理なので、Ratioが0~1以内のときだけ要素を動かすようにします。

```javascript
function updatePosition(target, ratio, distance) {
    if (0 < ratio && ratio < 1) {
      gsap.to(target, {
        y: distance - distance * ratio
      })
    }
  }
```

あとは、スクロールイベントの内の処理をもっと少なくするために、スクロールイベントではwindowのスクロール量を更新するだけにして、スクロール量を管理する変数を監視するようにするのも良いかもしれません。

アニメーションのデータバインディングと、スクロールイベント内の処理が増えることのどちらが早いかどうかはまだ調査していないので分かりませんが……。

# まとめ

以下の通りちょっとだけコードを修正しました。

- 動かしたい要素の各プロパティの定義が冗長だったので、クラスを定義して簡潔に
- ロード時にページをスクロールした状態だと、ガクッと要素が動き始めてしまうのでページロード時にポジションを更新するように（ローディング画面がないので結局loadイベントが走った瞬間ガクッと動いてしまう）

```javascript
gsap.defaults({
  duration: 0.1,
  ease: 'none'
})

class TargetProps {
  constructor(target) {
    this.el = target
    this.y = target.offsetTop
    this.height = target.clientHeight
    this.top = this.y - window.innerHeight
    this.bottom = this.y + this.height
  }
}

window.addEventListener('load', () => {
  const image = new TargetProps(document.getElementById('targetImage'))
  const title = new TargetProps(document.getElementById('targetTitle'))
  const caption = new TargetProps(document.getElementById('targetCaption'))
  let scrollAmount = window.pageYOffset
  let isRafActive = false

  function calculateRatio(top, bottom, scroll) {
    const topAdjustNum = top * ((bottom - scroll) / bottom)
    return (bottom - scroll + topAdjustNum) / bottom
  }

  function updatePosition(target, ratio, distance) {
    if (0 < ratio && ratio < 1) {
      gsap.to(target, {
        y: distance - distance * ratio
      })
    }
  }

  const ratio = {
    image: calculateRatio(image.top, image.bottom, scrollAmount),
    title: calculateRatio(title.top, title.bottom, scrollAmount),
    caption: calculateRatio(caption.top, caption.bottom, scrollAmount),
  }

  // Set target position when page load
  updatePosition(image.el, ratio.image, 200)
  updatePosition(title.el, ratio.title, -320)
  updatePosition(caption.el, ratio.caption, 40)

  window.addEventListener('scroll', throttle(16, () => {
    scrollAmount = window.pageYOffset
    ratio.image = calculateRatio(image.top, image.bottom, scrollAmount)
    ratio.title = calculateRatio(title.top, title.bottom, scrollAmount)
    ratio.caption = calculateRatio(caption.top, caption.bottom, scrollAmount)

    if (!isRafActive) {
      isRafActive = true
      requestAnimationFrame(() => {
        updatePosition(image.el, ratio.image, 200)
        updatePosition(title.el, ratio.title, -320)
        updatePosition(caption.el, ratio.caption, 40)
        isRafActive = false
      })
    }
  }), {passive: true})
})
```

<iframe height="460" style="width: 100%;" scrolling="no" title="Basic Parallax Interaction" src="https://codepen.io/co6ei/embed/wvBzQPG?height=265&amp;theme-id=default&amp;default-tab=js,result" frameborder="no" allowtransparency="true" allowfullscreen="allowfullscreen">See the Pen <a href="https://codepen.io/co6ei/pen/wvBzQPG">Basic Parallax Interaction</a> by nao (<a href="https://codepen.io/co6ei">@co6ei</a>) on <a href="https://codepen.io">CodePen</a>. </iframe>

* * *

パララックスはこんな感じでした。
