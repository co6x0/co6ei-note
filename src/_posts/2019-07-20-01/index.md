---
title: "Vanilla JSのscroll Event最適化"
date: "2019-07-20"
categories: 
  - "Development"
tags: 
  - "JavaScript"
  - "アニメーション"
---

この記事がとても参考になる。この記事の内容を自分の理解のために少し噛み砕く。

[猫でもわかるスクロールイベントパフォーマンス改善ポイント2018 - Qiita](https://qiita.com/kikuchi_hiroyuki/items/7ac41f58891d96951fa1)

# preventDefault()

> 例えば、スクロールイベント内でpreventDefault()が実行されたら、スクロール処理は中止されます。しかしながら、ブラウザ側はイベント内でpreventDefault()が実行されるかどうかを事前に判定できません。（そのイベントが実行が終了するまで判定ができない） そのため、イベント内の処理が終了するのを待つ（＝遅延が発生する）ことになります。

普通は1イベントに1ファンクション行われるのだが、スクロールイベントの場合イベントが何度も発生するの処理が重くなる。

なので、一連のスクロールイベントの**最初と最後の間を間引きたい**よね、というのがコレの目的。処理が終わるのを待たずに、次のイベントが発生したら次のイベント内の処理にうつると言う感じ。

addEventListenerの第三引数に{passive: true}を指定するだけで可能。

これを指定することによってイベント内の処理が終了を待たず次のイベントが発生しているかどうか判定ができる。

```javascript
document.addEventListener(‘scroll’, function() {
  // なんかの処理
}, {passive: true});
```

# window.requestAnimationFrame()

[Window.requestAnimationFrame()](https://developer.mozilla.org/ja/docs/Web/API/Window/requestAnimationFrame)

> ブラウザにアニメーションを行いたいことを知らせ、指定した関数を呼び出して次の再描画の前にアニメーションを更新することを要求します。

# サンプル

```javascript
let scrollPx = window.pageYOffset
let scrollFlag = false

const element = document.getElementById('animation-test')

//初期ポジションが違うとき用
document.addEventListener('DOMContentLoaded', () => {
  if (scrollPx > 800) {
    element.style.transform = `translateX(800px)`
  } else {
    element.style.transform = `translateX(${scrollPx}px)`
  }
})

function scrollTranslate() {
  if (!scrollFlag) {
    window.requestAnimationFrame(() => {
      scrollFlag = false

      scrollPx = window.pageYOffset
      element.style.transform = `translateX(${scrollPx}px)`
      element.style.background = 'red'

    })
    scrollFlag = true
  }
}

window.addEventListener('scroll',
  () => {
    scrollPx = window.pageYOffset

    if (scrollPx < 800) {
      scrollTranslate()
    } else {
      element.style.background = 'blue'
    }
  }, {
    passive: true
  }
)
```

# IntersectionObserver API

`isIntersecting`がかなり使える

```javascript
//Scroll Function by Observer
const articleMain = document.getElementById('js-article-main')
const articleEnd = document.getElementById('js-article-end')
const shareBtn = document.getElementById('js-share-btn')
let articleHeight

function createObserver(observeElement) {
  let observer

  const options = {
    root: null,
    rootMargin: '0px',
    threshold: 0.2
  }

  observer = new IntersectionObserver(callback, options)
  observer.observe(observeElement)
}

function callback(entries) {
  entries.forEach(function(entry) {
    if (entries[0].isIntersecting) {
      console.log('Article exited...')

      articleHeight = articleMain.offsetHeight
      shareBtn.style.position = 'absolute'
      shareBtn.style.top = `calc(${articleHeight}px - 15vh)`
    } else {
      console.log('Article entried!')
      shareBtn.style.position = 'fixed'
      shareBtn.style.top = 'calc(50% + 32px)'
    }
  })
}

document.addEventListener('DOMContentLoaded', () => {
  createObserver(articleEnd)
})
```
