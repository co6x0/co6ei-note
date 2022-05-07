---
title: "Cloud Functions for Firebaseを使ってLINE botを作る(with Cloud Firestore)"
date: "2020-11-27"
categories: 
  - "development"
tags: 
  - "cloud-firestore"
  - "cloud-functions"
  - "firebase"
  - "line-messaging-api"
coverImage: "ogimage.png"
---

## チャネルを作る

調べるまでLINE bot がどのように動いているのか全く分からなかったのですが、ボット用のチャネルを作ってそこにメッセージが投稿されたりすると、イベントが発生してWebhookペイロードがPOSTされるような流れのよう。

とりあえず、以下のページを参考にチャネルとやらを作成します。いわゆる公式アカウント的なやつのことでしょうか、おそらく。

> チャネルとは チャネルは、LINEプラットフォームが提供する機能を、プロバイダーが開発するサービスで利用するための通信路です。LINEプラットフォームを利用するには、チャネルを作成し、サービスをチャネルに関連付けます。チャネルを作成するには、名前、説明文、およびアイコン画像が必要です。チャネルを作成すると、固有のチャネルIDが識別用に発行されます。

[https://developers.line.biz/ja/docs/messaging-api/getting-started/](https://developers.line.biz/ja/docs/messaging-api/getting-started/)

結構ざっくりとしたチュートリアルなのですが、落ち着いてやれば特に問題ないかと思います。

チャネルが作成されると同時に公式アカウントも作成されるようです。ドキュメントにも記載があるのですが以下のページを見ると確認できます。

そこには様々な機能があって、こうやって公式アカウントは作られているのか〜という気持ちになります。

[https://manager.line.biz/](https://manager.line.biz/)

さて、以降のセクションはおおむね以下のページの流れに則って進みます。

[https://developers.line.biz/ja/docs/messaging-api/building-bot/](https://developers.line.biz/ja/docs/messaging-api/building-bot/)

上記のページにも記載がありますが、Webhookを利用したBotを自前で作成する場合は、Official Account Manager の 設定>応答設定から「あいさつメッセージ」と「応答メッセージ」をオフにして、Webhookを「オン」にする必要があるので、今のうちに行っておきます。

## チャネルアクセストークンv2.1の発行

チャネルアクセストークンについては推奨されている**チャネルアクセストークンv2.1**とやらを使いましょう。手軽にやるなら短期/長期のトークンでも良いかもですが、推奨されているこっちの方がセキュアだよと言われるとあえて選ぶ気分にはなりませんでした。

こちらを参考に発行しましょう。

[https://developers.line.biz/ja/docs/messaging-api/generate-json-web-token/](https://developers.line.biz/ja/docs/messaging-api/generate-json-web-token/)

まずは、アサーション署名キーを以下の通り発行します。

> LINE Developersコンソールのチャネル設定からMessaging APIチャネルを選択して、チャネル基本設定タブにアクセスします。次に、アサーション署名キーの横にある［発行］ボタンをクリックして、アサーション署名キーを発行します。

コードを置くディレクトリを適当に作って、その中に`.key`などの名前で先ほどダウンロードされた秘密鍵等をいれるディレクトリを作ります。

おそらくNode.jsはインストールされていると思うので、そこの説明は飛ばして、node-joseを`.key`フォルダにインストール。

```
npm init
npm install node-jose
```

[https://github.com/cisco/node-jose#installing](https://github.com/cisco/node-jose#installing)

LINEのドキュメントに記載されているサンプルコード(> node-joseを使ったコードの例)を`index.js`などに適宜コピーしてターミナルから`node index.js`でJWTを生成し、控えます。

続いてcurlコマンドでチャネルアクセストークンv2.1を実際に発行していきましょう。

[https://developers.line.biz/ja/reference/messaging-api/#issue-channel-access-token-v2-1](https://developers.line.biz/ja/reference/messaging-api/#issue-channel-access-token-v2-1)

以下のコマンドの`{JWT}`を置き換えて実行します。

```
curl -v -X POST <https://api.line.me/oauth2/v2.1/token> \
-H 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'grant_type=client_credentials' \
--data-urlencode 'client_assertion_type=urn:ietf:params:oauth:client-assertion-type:jwt-bearer' \
--data-urlencode 'client_assertion={JWT}'
```

こんなものが返ってくるので `access_token` と `key_id` を控えます。

```
{
  "access_token": "eyJhbGciOiJIUz.....",
  "token_type": "Bearer",
  "expires_in": 2592000,
  "key_id": "sDTOzw5wIfxxxxPEzcmeQA"
}
```

しかしこのトークンの有効期限が切れないようにするにはどうすれば良いのか気になります。この記事では考えないことにしますが、定期的にトークンを更新する処理をBotの設計に挟めば良い……？

## Cloud FunctionsでWebhook URLを用意する

### Firebaseの設定

今回はLINE Botを介してデータベースの操作もしたいので、個人的に馴染み深いFirebaseを利用します。

まずは、Firebaseプロジェクトの作成とFirebase CLIのインストールを行います。

[https://firebase.google.com/?hl=ja](https://firebase.google.com/?hl=ja)

[https://firebase.google.com/docs/cli?hl=ja](https://firebase.google.com/docs/cli?hl=ja)

プロジェクトを作成したら、Firestoreのページに移動してデータベースを作成しておきます。`firebase init` のときにErrorを吐かれてしまうので。

また、 `firebase init` の設定は記事のタイトル通り、FirestoreとFunctions(TypeScript)のみ行いました。必要になれば後から他のサービスも利用できるのでとりあえず最小構成です。

何やかんや指定して、Firebase CLIによって必要なファイル群が作られましたか。

そこまできたら一度、`firebase deploy` で諸々のファイルをデプロイしましょう。

もしかしたら、請求先アカウントを設定する必要があるなどというエラーが出るかもしれません。その場合は設定ページから従量課金制のBlazeプランにアップデートしてください。

従量課金と言われると少し身構えてしまいますが、Blazeプランでも大体0円なのであまり心配はありません。（念のため予算アラートは設定しておいた方が良いかもです。）

### Cloud Functionsの設定

`firebase functions:config:set` でCloud Functions側でのみ参照可能な環境変数を設定します。

[https://firebase.google.com/docs/functions/config-env?hl=ja](https://firebase.google.com/docs/functions/config-env?hl=ja)

先ほど控えた`access_token` と `key_id` を設定します。

```
firebase functions:config:set \
linebot.token="your access_token" \
linebot.key="your key_id" \
linebot.secret="your channel secret"
```

設定した変数は CLIからは `firebase functions:config:get` でチェックでき、実際に呼び出すときは `functions.config().linebot.token` のように使えます。

また、`key_id` はアクセストークンを取り消すときに利用するようです。今回は特に出番は無いのですが、`key_id` を無くすと以上のような操作が不可能になるので、トークンと一緒に保存しておきましょう。

### 署名の検証

さて、続いては、以下のような注意書きがありますので署名を検証します。

> ボットサーバーが受信したHTTP POSTリクエストは、LINEプラットフォームから送信されていない危険なリクエストの可能性があります。 必ず署名を検証してから、Webhookイベントオブジェクトを処理してください。

[https://developers.line.biz/ja/reference/messaging-api/#signature-validation](https://developers.line.biz/ja/reference/messaging-api/#signature-validation)

検証にはチャネルシークレットとやらを使用するのですが、LINE Developersコンソールから確認できます。それをまた `firebase functions:config:set` で設定しておきます。

おおむね上記ドキュメント内のサンプルコードの通りですが、以下のように検証します。

```
import * as functions from 'firebase-functions';
import * as crypto from 'crypto';

export const lineBot = functions
  .region('asia-northeast1')
  .https.onRequest(async (request, response) => {
	const channelSecret = functions.config().linebot.secret;
	const stringBody = JSON.stringify(request.body);
  const events = request.body.events[0];
	const headers = request.headers;
	
	// Verify signature
	const signature = await crypto
	  .createHmac('SHA256', channelSecret)
	  .update(stringBody).digest('base64');
	
	if (signature !== headers['x-line-signature'] || events === undefined) {
    response.status(200).send();
    throw new Error('Event denied');
  }
});
```

`if (signature !== headers['x-line-signature'] || events === undefined)` で `response.status(200).send();` を返しているのは以下の理由です。これを設定していないと、LINE DevelopersコンソールのWebhook URLの検証でエラーが出ると思います。

> LINEプラットフォームから送信されるHTTP POSTリクエストをボットサーバーで受信したときは、ステータスコード200を返してください。

[https://developers.line.biz/ja/reference/messaging-api/#response](https://developers.line.biz/ja/reference/messaging-api/#response)

一度ここで `firebase deploy --only functions` でデプロイしてちゃんと動作するか試してみます。

デプロイされたらFirebaseのFunctionsページからデプロイした関数のURLをコピーして、LINE DevelopersコンソールのMessaging API設定からWebhook URLを設定して検証してみましょう。

上手くいけば「成功」というレスポンスが貰えるはずです。

## LINE Messaging API SDKを使用して応答メッセージを送る

ようやく本題という感じです。

まずは、`npm install @line/bot-sdk` でLINE Messaging API SDKをfunctionsディレクトリにインストールします。

前節のコードと被る部分は省略していますが、以下のようにユーザーのメッセージに応じて反応を返すことができます。この例はユーザーの特定のメッセージに反応して特別なメッセージを返答をするというシンプルなBotです。

```
import * as line from '@line/bot-sdk';

// 省略

const replyToken = events.replyToken;
const userId = events.source.userId;
const client = new line.Client({
  channelAccessToken: functions.config().linebot.token
});

const replyText = (message: string): string => {
  switch (message) {
    case 'おはよう':
      return 'おはようございます！今日も一日頑張りましょう';
    case 'こんにちは':
      return 'こんにちは！良い天気ですね';
    case 'こんばんは':
      return 'こんばんは！夕飯は食べましたか？';
    default:
      return 'なるほど！';
  }
}

const message: line.TextMessage = {
  type: 'text',
  text: replyText(events.message.text)
};

client.replyMessage(replyToken, message)
	.then(() => {
	  ...
	})
	.catch((err) => {
	  // error handling
	});
  response.status(200).send();
```

メッセージイベントによってリクエストされるオブジェクトの各プロパティは以下から確認できます。

[https://developers.line.biz/ja/reference/messaging-api/#webhook-event-objects](https://developers.line.biz/ja/reference/messaging-api/#webhook-event-objects)

## Cloud Firestoreとの連携

つづいて、チャネルを通して得たユーザーの情報をFirestoreに保存して、その情報をユーザーに対して送るようなBotを作ってみます。

まず、`npm install firebase-admin` でFirebase Admin SDKを追加します。

[https://firebase.google.com/docs/admin/setup?hl=ja](https://firebase.google.com/docs/admin/setup?hl=ja)

以下のコードを追加して、Firestoreを扱う準備を整えます。

```
import * as admin from 'firebase-admin'

// SDKの初期化
admin.initializeApp();
// Firestoreのデータを取り扱う際に使用する
const db = admin.firestore();
```

LINEユーザーは一意のIDを持っていて、`events.source.userId` で確認できます。

このIDをFirestoreのドキュメントIDとして何らかのデータを持つことで、Botに対してメッセージを送ってきたユーザーを特定し、DBからそのユーザーの持つ何らかのデータを応答することができます。

各ドキュメントIDにLINEの `userId` を使った `users` コレクションと、ユーザーとメッセージのやり取りをした回数を記録する `count` フィールドを作成してみます。

また、`userDoc.exists` でメッセージを送信したユーザーのIDが既に存在している場合は、`count` を1つ増やします。

```
const userId = events.source.userId;
const userRef = db.collection('users').doc(userId);
const userDoc = await userRef.get()
	.then((doc) => doc)
	.catch((err) => {
	  throw new Error(err);
	});

const countAmount = async (): Promise<number> => {
  if (userDoc.exists) {
    return await userRef.update({
      count: admin.firestore.FieldValue.increment(1)
    })
    .then(() => {
      return userDoc.data()?.count + 1 ?? -1
    });
  } else {
    return await userRef.set({ count: 1 }).then(() => 1);
  }
}
```

あとは `countAmount` をTextMessageのtextに利用すればそれっぽい感じになります。

LINEのSDKも使いたさがあるのでメッセージを送信してくれたユーザーの `displayName` も使ってみます。

```
const userProfile = await client.getProfile(userId)
  .then((profile) => profile)
  .catch((err) => {
    functions.logger.error(err);
    throw new Error('Can not get the profile');
  })

const replyText = (message: string): string => {
  const userName = userProfile?.displayName ?? '名無し'
  const replyMessage = () => {
    switch (message) {
      case 'おはよう':
        return 'おはようございます！今日も一日頑張りましょう';
      case 'こんにちは':
        return 'こんにちは！良い天気ですね';
      case 'こんばんは':
        return 'こんばんは！夕飯は食べましたか？';
      default:
        return 'なるほど！';
    }
  }
  return `${userName}さん、${replyMessage()}`
}

// 配列で指定すると一度に複数のメッセージを送れる
const textMessage: line.TextMessage[] = [
  {
    type: 'text',
    text: replyText(events.message.text)
  },
  {
    type: 'text',
    text: `${await countAmount()}回、私と話しました`
  }
];
```

特に何か意味があるわけではありませんが、それっぽいですね。

![](images/Frame_8.png)

一連のコードをまとめるとこんな感じでした。

```
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin'
import * as crypto from 'crypto';
import * as line from '@line/bot-sdk';

admin.initializeApp();
const db = admin.firestore();

export const lineBot = functions
  .region('asia-northeast1')
  .https.onRequest(async (request, response) => {
    const channelSecret = functions.config().linebot.secret;
    const stringBody = JSON.stringify(request.body);
    const events = request.body.events[0];
    const headers = request.headers;

    // Verify signature
    const signature = await crypto
      .createHmac('SHA256', channelSecret)
      .update(stringBody).digest('base64');

    if (signature !== headers['x-line-signature'] || events === undefined) {
      response.status(200).send();
      throw new Error('Request denied');
    }

    const replyToken = events.replyToken;
    const userId = events.source.userId;
    const client = new line.Client({
      channelAccessToken: functions.config().linebot.token
    });
    
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get()
      .then((doc) => doc)
      .catch((err) => {
        throw new Error(err);
      });

    const userProfile = await client.getProfile(userId)
      .then((profile) => profile)
      .catch((err) => {
        functions.logger.error(err);
        throw new Error('Can not get the profile');
      })
    
    const countAmount = async (): Promise<number> => {
      if (userDoc.exists) {
        return await userRef.update({
          count: admin.firestore.FieldValue.increment(1)
        })
        .then(() => {
          return userDoc.data()?.count + 1 ?? -1
        });
      } else {
        return await userRef.set({ count: 1 }).then(() => 1);
      }
    }

    const replyText = (messageFromUser: string): string => {
      const userName = userProfile?.displayName ?? '名無し'
      const replyMessage = () => {
        switch (messageFromUser) {
          case 'おはよう':
            return 'おはようございます！今日も一日頑張りましょう';
          case 'こんにちは':
            return 'こんにちは！良い天気ですね';
          case 'こんばんは':
            return 'こんばんは！夕飯は食べましたか？';
          default:
            return 'なるほど！';
        }
      }
      return `${userName}さん、${replyMessage()}`
    }
    
    const textMessage: line.TextMessage[] = [
      {
        type: 'text',
        text: replyText(events.message.text)
      },
      {
        type: 'text',
        text: `${await countAmount()}回、私と話しました`
      }
    ];
    
    client.replyMessage(replyToken, textMessage)
      .then(() => {
        functions.logger.log('Replied to the message!');
      })
      .catch((err) => {
        functions.logger.error(err);
      })
      response.status(200).send();
  });
```

いろいろできそうでよいですね。
