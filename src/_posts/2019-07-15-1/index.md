---
title: "対話形式のUIをマークアップするのに相応しいHTMLタグは何か"
date: "2019-07-15"
categories: 
  - "development"
tags: 
  - "accessibility"
  - "html"
---

Nao : よーし最強のUIを作ってやるぞー‼︎ Komura : うん頑張ろう！

っていう感じのやつについて。

まず最初に思いついたのは`<dl>, <dt>, <dd>`。

しかし、dtで定義された名前についてddで説明するわけではないし違う気がする。

`<dl>`は何かの名称についての説明や、質問についての答えなど、名前と値が対になったデータをグループにするのに使う。

他には思いつかなかったのでWHATWGのドキュメントを読む。

`<cite>`というタグを発見した。

これは何らかの作品のタイトルを表すものらしい。人の発言はその人の作品と捉え得ることもできるのでは？とか思ったけど、しっかり

> 人の名前は作品の題名ではありません - たとえ人々がその人を作品の一部と呼ぶとしても - そしてその要素は人々の名前をマークアップするために使われてはいけません。

と書かれていた。

それと同時に、そういう場合は`<b>`というタグが使える可能性があるとも教えてくれた。確認する。

人の発言でcite要素を使う間違った例を挙げてから：

> 正しい使い方ではcite要素を使いません。

```html
<p><q>This is correct</q>, said Ian.</p>
```

> また前述のように、b要素は、ある種の文書では、名前をキーワードとしてマークするのに関連している可能性があります。

```html
<p>And then <b>Ian</b> said <q>this might be right, in a
gossip column, maybe!</q>.</p>
```

`<q>`は引用を表すインライン要素なので、言われてみればなるほどという感じ。`<b>`についてはもう少し詳しくみてみよう。

ちなみに「前述のように」の内容は以下のようなものである。今回マークアップしたい内容がこれに当てはまるかどうかが焦点になってきそうだ。

> ゴシップ記事では、有名人の名前は、注目を集めるために異なるスタイルでレンダリングされたキーワードです。他のケースでは、要素が本当に必要ならば、span要素を使うことができます。

今回は対談記事のようなフォーマットを想定しているので、ちょっと違う気がする。これは`<span>`で囲む感じになってくる予感。

さて、`<b>`についてなんと説明されているだろうか。

> b要素は、実用的な目的のために特別な重要性を伝えることなく、また代替的な発言や気分を暗示することなく、ドキュメントの抜粋キーワード、レビューの製品名、実用的な単語などの注意を引くテキストの範囲を表します。対話型のテキスト駆動型ソフトウェア、または記事の中で。

注意をひいたほうが良いキーワードについてマークアップするのに使うようだ。

しかし、_＞実用的な目的のために特別な重要性を伝えることなく、また代替的な発言や気分を暗示することなく_ という文が気に掛かる。

サンプルコードを見るといずれも`<b>`が使われている部分はb要素がなくても良いような部分が多かった。この例が最もそれを感じやすいかもしれない。

```html
<p>You enter a small room. Your <b>sword</b> glows
brighter. A <b>rat</b> scurries past the corner wall.</p>
```

サンプルコードの紹介に続いてこのような文もあった。

> i要素と同様に、作成者はb要素のclass属性を使用して、その要素が使用されている理由を識別できるため、特定の用途のスタイルを後日変更する場合、作成者はその必要はありません。それぞれの用途に注釈を付ける 他の要素がより適切でない場合、**b要素を最後の手段として使用する必要があります**。特に、見出しはh1からh6の要素を使用し、強調はem要素を使用し、重要度はstrong要素で示し、マークまたは強調表示されたテキストはmark要素を使用する必要があります。

`<b>`はどうやら他のテキストやコードに左右される存在なような気がしてくる。

ここで新たに示された`<em>, <strong>, <mark>`を確認する。

強調することによって/強調しないことによって、意味が変わってくる文に使用するやつ。

以下の例がわかりやすい。

> 最初の言葉を強調することによって、この声明は、話し合い中の動物の種類が問題になっていることを示唆しています（おそらく誰かが犬がかわいいと主張している）。

```html
<p><em>Cats</em> are cute animals.</p>
```

> 動詞にアクセントを移すと、文全体の真実が疑問であることが強調されます（多分誰かが猫はかわいくないと言っている）。

```html
<p>Cats <em>are</em> cute animals.</p>
```

純粋に重要な文を強調するために使う。ただ、例を見る限りかなり雑な使われ方をしているので、Google Botがstrong要素を特別扱いすると言うことはなさそう。

意味どうこうではなく、純粋な強調。

この例が一番わかりやすかった。

意味的な重要度でいうとこれらはすべて同じだが、リマインダー的には（期限に）一番近いタスクが重要なのでユーザーに対して強調してるような感じ？

```html
<p>Welcome to Remy, the reminder system.</p>
<p>Your tasks for today:</p>
<ul>
 <li><p><strong>Turn off the oven.</strong></p></li>
 <li><p>Put out the trash.</p></li>
 <li><p>Do the laundry.</p></li>
</ul>
```

正直使い分けが難しい。

まだ理解の途中だが、これは今回使う要素ではないと判断したので軽く。

この要素はマーカーのイメージに近いかもしれない。ユーザーが探している単語だったり、引用の中に含まれる話したい内容についてマークするような感じ。

`<mark>`とだけ見ると何だか分かりづらいが、意味を確認すると確かにMarkだな〜となるタグ。

# 結論

多分こんな感じにするのが良さそう。

```html
<p><span>Nao</span>：<q>よーし最強のUIを作ってやるぞー‼︎</q></p>
<p><span>Komura</span>：<q>うん頑張ろう！</q></p>
```

`<span>`はスタイリングに使う用なので無くてもOK。

引用が複数行になりそうなら以下のような感じで`<blockquote>`を使う。

```html
<div>
  <p>Nao Komura</p>：
  <blockquote>
    <p>よーし最強のUIを作ってやるぞー‼︎</p>
        <p>うん頑張ろう！</p>
  </blockquote>
</div>
```

正直なところ、`<span>`ではなく`<b>`か`<em>`でまだ迷っている。

どの人が発したセリフかによって内容の意味合いが変わってくることもあると思うのでem要素もありだと思う。しかし、それほど強調するべきものなのだろうかという気もする。それならb要素？意味合いが変わると言うほどのものではなく、軽く強調しておきたい程度という意味ではこれな気もする...

という風に色々考えるとキリがないので一旦spanでいくことにした。

判断の理由は`<span>`ならマイナスもないし、プラスもないだろうというところ。emとbどちらが適当か判断しかねるゆえ🤔