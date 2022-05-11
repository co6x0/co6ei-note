---
title: "Figma Webhooksを使ってVersion HistoryをSlackに通知する"
date: "2020-09-06"
categories: 
  - "Development"
tags: 
  - "Amazon API Gateway"
  - "AWS"
  - "Figma"
  - "Amazon Lambda"
  - "Slack"
coverImage: "cover.png"
---

Figma Webhooksに関する情報の初出はおそらく以下のFigma Web APIが公開された記事が最初で、Webhookもそのうち提供するよ、と記されているのですが随分長い間公開されなかった気がします。

[https://www.figma.com/blog/introducing-figmas-platform/](https://www.figma.com/blog/introducing-figmas-platform/)

ということで待望のWebhookなのですが、現在のところオープンベータ版ということで色々と仕様が変更する可能性もあるそうです。なので、ご利用は計画的にという感じでしょうか。

[https://www.figma.com/developers/api#webhooks\_v2](https://www.figma.com/developers/api#webhooks_v2)

さて、今回はFigma Webhooks V2を使ってVersion HistoryをSlackに通知させようと思います。

FigmaとSlackは連携させてコメントを通知させることが出来るのですが、コメントしか通知されないので正直そんなに使い勝手はよくないです。

Figmaの更新を通知するイベントとしてはVersion Historyが使い勝手が良いのかなということで、そんな感じです。Webhookがベータ版じゃなくなる頃にでも公式が対応してくれると嬉しいなと思いますが、いつになるか分からないのでやっていきましょう。

[https://help.figma.com/hc/en-us/articles/360039829154-Receive-Comment-Notifications-in-Slack](https://help.figma.com/hc/en-us/articles/360039829154-Receive-Comment-Notifications-in-Slack)

## Figma Webhooksのテスト

とりあえず、ドキュメントで推奨されている通り、ngrokを利用してローカルでのテスト環境を整えます。ngrokのインストール方法はDashboardに書いてあるのでその通りに。

[https://ngrok.com/](https://ngrok.com/)

以下のコマンドでLocal Webserverを立ち上げる所まできましたか。

```
./ngrok http 80
```

コマンドを実行すると、サーバーのステータスが表示されるようになるかと思います。その中にある`https://*****.ngrok.io` というURLをエンドポイントとして利用できます。

cURLコマンドは以下のドキュメントの通りです。

[https://www.figma.com/developers/api#webhooks-v2-post-endpointa](https://www.figma.com/developers/api#webhooks-v2-post-endpoint)

```
curl -X POST \\
-H 'X-FIGMA-TOKEN: *Personal Access Token*' \\
-H "Content-Type: application/json" '<https://api.figma.com/v2/webhooks>' \\
-d '{"event_type":"*event_type*","team_id":"*team_id*","endpoint":"*endpoint*","passcode":"*passcode*"}'
```

### 設定するパラメーター

#### **Personal Access Token**

FigmaのマイページのSettingsから作成できます。

#### event\_type

ここの通り。説明の通りではありますが、てきとうに試して挙動を把握しましょう。

[https://www.figma.com/developers/api#webhooks-v2-events](https://www.figma.com/developers/api#webhooks-v2-events)

#### team\_id

ちょっと分かりづらいやつです。

Figmaにブラウザからアクセスしてチームページにアクセスすると、URLが以下のようになっているかと思います。

https://www.figma.com/files/team/12345678901234567890/example

このURLの数字の部分がそれです。

ここで指定したIDのチームのファイルのイベントをトリガーするようになります。

#### endpoint

ngrokで立ち上げたサーバーのURLを入力します。

実際はFaaSのエンドポイントとか指定します。

#### passcode

僕はこれよく分かってないです。

> Figmaによって呼び出されていることを確認するためにWebhookエンドポイントに返される文字列

とのことです。僕はこのWebhookを介して実行するアクションの名前を使いました。（ここではTestとかそんな感じでしょうか。）

### 動作確認

以上で必須項目は設定できますが、他にstatusとdescriptionが指定できます。詳しくはドキュメントをご参照あれ。

さて、パラメーターを指定してコマンドを実行してみましょう。すると、新しく作成したwebhookの情報がJSON形式で返ってきます。設定が間違っていたりするとエラーが入っていると思います。

その後、設定したevent\_typeのイベントが発火するようにFigmaのファイルをいじると、POSTリクエストがngrokに飛んでくるのでは無いでしょうか。

リクエストはターミナルから立ち上げたngrokのサーバー情報の中のWeb Interfaceと書かれたIPアドレス（おそらく初期値は`127.0.0.1:4040`なはず、`localhost:4040`と同義）から確認できます。

502エラーが出ますが、これはForwardingで指定されているポートが開放されていないから？な気がします。ちょっとここら辺の知識無さすぎるので何とも言えません。

それはさておき、飛んできたデータを見ると色々と業務効率改善できそうだなぁという気持ちになりますね。

## FaaSの設定

本題に入りましょう。

FaaSはAWS Lambdaを利用します。今回初めて使ったのでよく分からんことだらけでよく分からんくなりました。（Zapierとかでもいけるのでは）

また、Lambdaのエンドポイントは直接は叩けない？ようなのでAPI Gatewayなるやつも使います。

### Slack側の設定

よく分からんことをする前に割と分かるSlackのIncoming Webhookの設定をしましょう。

[https://slack.com/intl/ja-jp/help/articles/115005265063-Slack-%E3%81%A7%E3%81%AE-Incoming-Webhook-%E3%81%AE%E5%88%A9%E7%94%A8](https://slack.com/intl/ja-jp/help/articles/115005265063-Slack-%E3%81%A7%E3%81%AE-Incoming-Webhook-%E3%81%AE%E5%88%A9%E7%94%A8)

Incoming Webhookの設定からWebhook URLを手に入れましょう。

このSlack側のエンドポイントとなるURLを手に入れたらSlack側でやることはほぼ終わりで、あとは投稿するチャンネルとかアイコンの設定とかするくらいです。そちらはお好みで。

### LambdaとAPI Gatewayの設定

#### アカウントの作成

AWSのアカウント作成する段階から、何やらよく分からない権限が出てきて困惑します。

最初はルートユーザーを作成し、その後IAMユーザーを作成するのがベストプラクティスであるとドキュメントに記載があります。

以下の引用文から、基本的にはIAMユーザーを使用するのが良さそうな雰囲気が出ていますがなぜなのかはよく分からない。とりあえず、ルートユーザーを作成したのちにIAMユーザーを作りましたが、ここについては詳しく触れません。（僕もよく分からないので）

> 日常的なタスクには、それが管理者タスクであっても、root ユーザーを使用しないことです。

[https://docs.aws.amazon.com/ja\_jp/IAM/latest/UserGuide/id\_root-user.html](https://docs.aws.amazon.com/ja_jp/IAM/latest/UserGuide/id_root-user.html)

#### Lambda 関数の作成

AWS異常にサービスがあってヤバいですね。検索からLambdaを入力して見つけます。そうしたら、「関数の作成」ボタンから始めます。

一から作成します。ランタイムはNode.js 12.x。

![](images/2020-09-06_22.19.55-1024x697.png)

作成されたら、左上のテストボタンを押してごにょるとテスト出来ます。ちょっとスクロールした所にExecution Resultというタブがあると思いますが、そこに上部のコードの実行結果が表示されるはずです。

![](images/2020-09-06_22.23.43-1024x373.png)

また、あとでFigma Webhooksのレスポンスが受け取れたことを確認するために、return文の前に`console.log(event.file_name)` を追加しておきます。

テストイベントの設定に、`"file_name": "hoge"` など追加すればテストもできますね。

#### API Gateway からトリガーを作成

Lambdaのデザイナーからトリガーを追加します。こんな感じ。

![](images/2020-09-06_22.35.05-1024x926.png)

これで設定は終わりです。

Lambdaのデザイナーに追加されたAPI Gatewayをクリックし、詳細を開くとAPIエンドポイントとなるURLが表示されているかと思います。

このエンドポイントをFigma Webhookに新しく追加してテストしてみましょう。

Lambdaのログはページ上部、モニタリングタブの中の右にある「CloudWatchのログを表示」ボタンを押すと見れます。

ログを見るとWebhookのトリガーは上手くいっているようなのですが、`event.file_name`が`undifined`として返ってきているようです。file\_nameはあるはずなので何か間違っているよう。

`console.log(JSON.stringify(event))`をして何が送られてきているのかチェック。

調べてみると分かるのですが、bodyにデータが格納されている感じのアレでした。

一度bodyをJSON.parseして`console.log(body.file_name)`などするとファイル名が取得できるのではないでしょうか。

### 実行する関数

Node.jsのhttpsモジュールを使ってSlackに通知を飛ばします。関数はこんな感じ。

```
const https = require('https');
const endpointHost = 'hooks.slack.com';
const endpointPath = 'Your Slack webhook URL Path';

exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  const postData = JSON.stringify({
  "text": "Update Version History in Figma",
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": ":figma: Update Version History in Figma"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": `*<https://www.figma.com/file/${body.file_key}/${body.file_name}|${body.label}>*`
      }
    },
    {
      "type": "context",
      "elements": [
        {
          "type": "plain_text",
          "text": `:page_facing_up: File: ${body.file_name} | Updated by ${body.triggered_by.handle}`,
          "emoji": true
        }
      ]
    },
    {
      "type": "divider"
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": `> ${body.description || 'No description'}`
      }
    }
  ]
  });

  const options = {
    hostname: endpointHost,
    port: 443,
    path: endpointPath,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const promise = new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      console.log('statusCode:', res.statusCode);
      console.log('headers:', res.headers);
    
      res.on('data', (chunk) => {
        console.log(`Body: ${chunk}`);
      });
      res.on('end', () => {
        console.log('FINISH');
        resolve();
      });
    });
    
    req.on('error', (e) => {
      reject(e);
    });
    
    req.write(postData);
    req.end();
  });
  return promise;
};
```

Slackにはこんな感じできます。

![](images/2020-09-07_1.40.14-1024x294.png)

`postData`がSlackに投稿されるメッセージになるのですが、この投稿の見た目を整えるのはこちらの便利ツールを使うとかなり楽です。

[https://api.slack.com/block-kit](https://api.slack.com/block-kit)

あと、以下のページに記載があるのですが、非同期処理を行う場合はPromiseをreturnする必要があるよう？これが分からなくて少しハマりました。

[https://docs.aws.amazon.com/ja\_jp/lambda/latest/dg/nodejs-handler.html](https://docs.aws.amazon.com/ja_jp/lambda/latest/dg/nodejs-handler.html)

AWS初めて使ったので色々苦戦した部分もありますが、どうにかなって良かった。

Figma Webhooksで他にも出来そうなこと沢山あると思うのでみなさんも是非お試しあれ。
