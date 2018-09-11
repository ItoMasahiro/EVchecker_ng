import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

@Injectable()
export class SharedEpService {

    /*
    どうやらコンポーネントを色んなコンポーネントで継承すると、一つの親コンポーネントがシェアされるわけではなく、
    子コンポーネントのそれぞれに新しい親コンポーネントが生成？されてそれぞれ（中身のコードは同じだけど）違うコン
    ポーネントを継承することになるらしい。つまり、一つの子コンポーネントでcodeNumberを9999とかに変えても、別
    の子コンポーネントのcodeNumberは初期値のままになる。一つのオブジェクトを色んなコンポーネントでシェアしたい
    場合は、継承じゃなくてインポートしてコンストラクタに書いて変数として扱うことで実現出来る。
    今回はAbstractEpComponentとSharedEpServiceを作って、それぞれのエントリーポイントのコンポーネント
    で継承、インポートする。定数（PATTERN_NARIYUKIなど、本来constでかけるようなもの）、コンポーネントによっ
    て値の変わる変数（purchasePatternなど、変数自体はすべてのコンポーネントに存在するが値はそれぞれのコンポ
    ーネントによって違うもの）は、AbstractEpComponentに書き、すべてのエントリーポイントコンポーネントでシェア
    したい変数（pricesListListなど、変数かつ、すべてのエントリーポイントコンポーネントで値が共通のもの）は、
    SharedEpServiceに書く。関数はどっちに書いても動くが、今後「それぞれのコンポーネントで別々の値を持つ変数」
    を関数内で利用する可能性があるため、AbstractEpComponentに書く。
    */

    pricesListList = new Object();

    constructor(private http: Http) { }

}