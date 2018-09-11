import { Component, OnInit } from '@angular/core';

import { StockDataService } from '../../services/stock-data.service';
import { SharedEpService } from '../../services/shared-ep.service';

declare var Chart: any;

@Component({
    selector: 'abstract-ep',
    templateUrl: './abstract-ep.component.html',
    styleUrls: ['./abstract-ep.component.css']
})
export class AbstractEpComponent implements OnInit {

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

    PATTERN_NARIYUKI = 0;
    PATTERN_GENZAINESASHINE = 1;
    PATTERN_GENZAINESASHINE_RIKAKU = 2;
    codeNumber = 30;
    purchasePattern = 0;
    priceBandLow = 0;
    priceBandHigh = 999999;
    /** 取引1回あたりにかかる手数料(%) */
    fee = 0;
    /** 価格帯別グラフの目盛り */
    priceRangeScale = [50, 100, 200, 300, 400, 600, 800, 1200, 1600, 3200, 4800, 6400, 12800, 25600];
    /** 期間別グラフの目盛り */
    periodScale = ['2004', '2005', '2006', '2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018'];

    /** ローディングぐるぐるを出すかどうか */
    isLoading = false;
    /** ローディングぐるぐるの下に表示する文字 */
    processText = 'loading'

    resultLabelId = 'result_label';

    resultList = [];

    constructor(public epShare: SharedEpService, public stockDataService: StockDataService) { }

    ngOnInit() {
    }

    start() {


        // 0個目の要素を取得してみて、取得できなかったらpricesListList未取得と判断(new Object()のやつなので、lengthは使えない)
        if (!this.epShare.pricesListList[0]) {
            // pricesListList未取得だった場合は、取得からスタート
            console.log('pricesList取得開始します');

            this.startLoading('株価を取得中');

            this.stockDataService.getPricesList(this.codeNumber).then((result) => {
                this.stopLoading();
                console.log(result);
                this.epShare.pricesListList = result;
                /*
                setTimeoutの関係で、こっちのabstractの方でぐるぐるを表示する処理を書く。ちょっと変かもだけど、
                ぐるぐるを止める処理は子コンポーネントの方で書く。(simulate()の終了をabstractでは感知できないため)
                */
                this.startLoading('シミュレート中');
                // 少し時間おかないとぐるぐるが表示されないので、0.5秒待ってからシミュレートを開始する
                setTimeout(() => {
                    this.simulate();
                    console.log(this.resultList);
                    this.calcAndShowResult(this.resultLabelId, this.resultList);
                }, 500);

            });
        } else {
            this.startLoading('シミュレート中');
            setTimeout(() => {
                // pricesListList取得済みだった場合は、シミュレートからスタート
                this.simulate();
                this.calcAndShowResult(this.resultLabelId, this.resultList);
            }, 500);
        }
    }

    /**
     * オーバーライド用
     */
    simulate() { }

    /**
    * 期待値を計算し、表示する
    * @param {string} id 結果を表示するラベルのid
    * @param {Array<JSON>} resultList リザルトリスト
    */
    calcAndShowResult(id: string, resultList: Array<JSON>): void {
        const resultLabel = document.getElementById(id);
        resultLabel.innerText = '';
        if (resultList.length == 0) {
            resultLabel.innerText = '一度も取引が行われませんでした';
            return;
        }
        var resultEntire = 0;
        var win = 0;
        var lose = 0;
        var draw = 0;
        var equalInterval = 1;

        // [ priceRangeScale.length+1 ][ ]の二次元配列を作成
        var dataByPriceRange = new Array(this.priceRangeScale.length + 1);
        for (var y = 0; y < this.priceRangeScale.length + 1; y++) {
            dataByPriceRange[y] = new Array().fill(0);
        }

        // [ periodScale.length ][ ]の二次元配列を作成
        var dataByPeriod = new Array(this.periodScale.length);
        for (var y = 0; y < this.periodScale.length; y++) {
            dataByPeriod[y] = new Array().fill(0);
        }

        for (var i = 0; i < resultList.length; i++) {
            const bidPrice = resultList[i]['bid'].buyingPrice; // 購入時の株価
            const sellPrice = resultList[i]['sell'].sellingPrice; // 売却時の株価
            // 結果(%) = ( ( 売った時の値段 - 買った時の値段 ) / ( 買った時の値段 ) ) * 100 であってるかな？
            var resultOnOneTrade = ((sellPrice - bidPrice) / bidPrice) * 100;
            resultOnOneTrade = resultOnOneTrade - this.fee;
            resultEntire += resultOnOneTrade;

            /*
            価格帯別にデータを分類していく。
            なんとなくforin文使ってみたけど、この場合のjはNumberとして認識されていないらしく、EVbyPriceRange[j+1]ってやったらエラーになった。
            普通のforで書けばこれは起こらないんだけど、まぁなんか勉強って意味であえてforin使ったまま頑張ってエラー直しました。
            */
            for (var j in this.priceRangeScale) {
                // 購入時の値段で、価格帯を分類する
                if (bidPrice <= this.priceRangeScale[j]) {
                    dataByPriceRange[j].push(resultOnOneTrade);
                    break;
                }

                // 最後まで分類されなかったやつは、とりえずすごい値段が高いやつなので、「それ以上」のとこに分類する
                if (Number(j) == this.priceRangeScale.length - 1) {
                    dataByPriceRange[Number(j) + 1].push(resultOnOneTrade);
                }
            }

            // 期間別にデータを分類していく
            for (var j in this.periodScale) {
                if (resultList[i]['bid'].date.getFullYear() == this.periodScale[j]) {
                    dataByPeriod[j].push(resultOnOneTrade);
                    break;
                }
            }

            if (bidPrice < sellPrice) {
                win++;
            } else if (bidPrice > sellPrice) {
                lose++;
            } else {
                draw++;
            }

            // 適当にデータの 1/10 , 2/10 ... 地点のデータをトレード履歴として表示する。ちゃんとしたタイミングで買い、ちゃんとしたタイミングで売っているかをユーザーが確認できるようにするため。
            if (i > (resultList.length / 10) * equalInterval) {

                equalInterval++;

                const bidDate = (resultList[i]['bid'].date.getFullYear() + '').slice(2) + '/' + ('0' + (resultList[i]['bid'].date.getMonth() + 1)).substr(-2) + '/' + ('0' + resultList[i]['bid'].date.getDate()).substr(-2);
                const sellDate = (resultList[i]['sell'].date.getFullYear() + '').slice(2) + '/' + ('0' + (resultList[i]['sell'].date.getMonth() + 1)).substr(-2) + '/' + ('0' + resultList[i]['sell'].date.getDate()).substr(-2);

                var plus = '';
                if (bidPrice < sellPrice) {
                    plus = '+';
                }
                resultLabel.innerText += resultList[i]['code'] + '　' + bidDate + '~' + sellDate + '　' + (plus + Math.round(resultOnOneTrade * 100) / 100) + '%\n';

            }
        }

        // 期待値がプラスだった場合は数字の先頭に「+」をつける
        var plus = '';
        if (resultEntire > 0) {
            plus = '+';
        }
        const entireEV = resultEntire / resultList.length;
        resultLabel.innerText = '期待値 = ' + plus + entireEV + '%\nトレード回数 : ' + resultList.length + '\n' + win + '勝 ' + lose + '敗 ' + draw + '分け (勝率:' + Math.round(((win * 100) / (win + lose + draw)) * 100) / 100 + '%)\n\n' + resultLabel.innerText;

        // グラフを表示するcanvasタグを、リザルトラベルをもとに取得する
        const canvasElemByPriceRange = resultLabel.parentElement.getElementsByClassName('priceRange')[0];
        if (canvasElemByPriceRange) {
            // canvasが見つかれば、そこにグラフを描画
            this.createAndDisplayGraphByPriceRange(canvasElemByPriceRange, dataByPriceRange);
        }

        // グラフを表示するcanvasタグを、リザルトラベルをもとに取得する
        const canvasElemByPeriod = resultLabel.parentElement.getElementsByClassName('period')[0];
        if (canvasElemByPeriod) {
            // canvasが見つかれば、そこにグラフを描画
            this.createAndDisplayGraphByPeriod(canvasElemByPeriod, dataByPeriod);
        }

    }

    /**
    * 価格帯別のグラフを描画する
    * @param {Element} canvasElem グラフを表示するcanvasエレメント
    * @param {Array} resuList 価格帯別のリザルトリスト
    */
    createAndDisplayGraphByPriceRange(canvasElem: Element, resuList: Array<Array<number>>): void {
        // 引数でエレメントを受け取る時、idを受け取ったりエレメント本体を受け取ったりと統一性がなくて気持ち悪くなっちゃった。
        // でも直そうと思っても結構きつい

        /*
        すでにグラフが描画されている状態で別のグラフを上から再描画すると、裏に元々のグラフが残ってしまいちょっとバグった。
        それを防ぐためには、new Chart()で返されるオブジェクトをグローバルに保持しておいて、再描画したい時に .update() メソッドを呼ぶとかなんとかネットに書いてあったけど、
        あんまりむやみにグローバル変数を増やしたくなかったので、気合いで別の方法でグラフの再描画を実現した。
        具体的には、最初にいったん<canvas>タグを消して、再度新しい<canvas>タグを生成して同じ場所に配置している。
        */
        const parent = canvasElem.parentElement;
        // いったん<canvas>を消す
        canvasElem.remove();
        const newCanvas = document.createElement('canvas');
        newCanvas.setAttribute('class', 'priceRange');
        // 新しい<canvas>を作成し、同じ場所に配置する
        parent.appendChild(newCanvas);
        canvasElem = parent.getElementsByTagName('canvas')[0];

        /** 価格帯別グラフのそれぞれの値(期待値) */
        const EVAveByPriceRange = [];
        /** 価格帯別トレード回数トレード回数 */
        const tradeTimesByPriceRange = [];
        /** 価格帯別グラフの目盛り */
        const labels = [];
        for (var i in resuList) {

            // 価格帯別の期待値を求める
            var sum = 0;
            var ave = 0;
            for (var j in resuList[i]) {
                sum += resuList[i][j];
            }
            if (resuList[i].length != 0) {
                ave = sum / resuList[i].length;
            }

            EVAveByPriceRange.push(ave);

            // 価格帯別のトレード回数を記憶
            tradeTimesByPriceRange.push(resuList[i].length);


            // グラフの目盛りを作成
            var scaleLabelText = '';
            if (Number(i) == 0) {
                scaleLabelText = '0 ~ ' + this.priceRangeScale[i];
            } else if (Number(i) == resuList.length - 1) {
                scaleLabelText = (this.priceRangeScale[Number(i) - 1] + 1) + ' ~ '
            } else {
                scaleLabelText = (this.priceRangeScale[Number(i) - 1] + 1) + ' ~ ' + this.priceRangeScale[i];
            }

            labels.push(scaleLabelText);
        }

        // グラフの目盛り調整のため、期待値、トレード回数それぞれの最大値を求める
        var EVmax = 0;
        var tradeTimeMax = 0;
        for (var i in EVAveByPriceRange) {
            if (Math.abs(EVAveByPriceRange[i]) > EVmax) {
                EVmax = Math.abs(EVAveByPriceRange[i]);
            }

            if (tradeTimesByPriceRange[i] > tradeTimeMax) {
                tradeTimeMax = tradeTimesByPriceRange[i];
            }
        }

        var complexChartOption = {
            responsive: true,
            title: {
                display: true,
                fontSize: 18,
                text: '価格帯別'
            },
            scales: {
                yAxes: [{
                    id: "EV",   // Y軸のID
                    type: "linear",   // linear固定 
                    position: "left", // どちら側に表示される軸か？
                    ticks: {
                        /*
                        マイナスの期待値がある場合、期待値のグラフとトレード回数のグラフで0の位置がずれてしまうため、
                        グラフの目盛りの最大値と最小値を合わせることで0の位置を真ん中に固定する。
                        最大値の1割分余裕を持たせることで、最大値の棒が天井にくっついてしまうのを防ぐ。
                        */
                        max: EVmax + (EVmax * 0.1),
                        min: -(EVmax + (EVmax * 0.1)),
                    }
                }, {
                    id: "tradeTime",
                    type: "linear",
                    position: "right",
                    ticks: {
                        max: Math.round(tradeTimeMax + (tradeTimeMax * 0.1)),
                        min: -Math.round((tradeTimeMax + (tradeTimeMax * 0.1))),
                    }
                }],
            }
        };

        var myChart = new Chart(canvasElem, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: '期待値',
                    data: EVAveByPriceRange,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    hoverBackgroundColor: "rgba(54, 162, 300, 1)",
                    borderWidth: 1,
                    yAxisID: "EV",
                },
                {
                    type: 'bar',
                    label: 'トレード回数',
                    data: tradeTimesByPriceRange,
                    backgroundColor: 'rgba(255,99,132,0.3)',
                    hoverBackgroundColor: "rgba(255,99,132,0.6)",
                    borderWidth: 1,
                    yAxisID: "tradeTime"
                }]
            },

            options: complexChartOption
        });

    }



    /**
    * 期間別のグラフを描画する
    * @param {Element} canvasElem グラフを表示するcanvasエレメント
    * @param {Array} resuList 期間別のリザルトリスト
    */
    createAndDisplayGraphByPeriod(canvasElem: Element, resuList: Array<Array<number>>): void {


        console.log('resultList===')
        console.log(resuList)

        /*
        すでにグラフが描画されている状態で別のグラフを上から再描画すると、裏に元々のグラフが残ってしまいちょっとバグった。
        それを防ぐためには、new Chart()で返されるオブジェクトをグローバルに保持しておいて、再描画したい時に .update() メソッドを呼ぶとかなんとかネットに書いてあったけど、
        あんまりむやみにグローバル変数を増やしたくなかったので、気合いで別の方法でグラフの再描画を実現した。
        具体的には、最初にいったん<canvas>タグを消して、再度新しい<canvas>タグを生成して同じ場所に配置している。
        */
        const parent = canvasElem.parentElement;
        // いったん<canvas>を消す
        canvasElem.remove();
        const newCanvas = document.createElement('canvas');
        newCanvas.setAttribute('class', 'period');
        // 新しい<canvas>を作成し、同じ場所に配置する
        parent.appendChild(newCanvas);
        canvasElem = parent.getElementsByTagName('canvas')[0];

        /** 期間別グラフのそれぞれの値(期待値) */
        const EVAveByPeriod = [];
        /** 期間別トレード回数 */
        const tradeTimesByPeriod = [];
        for (var i in resuList) {

            // 期間別の期待値を求める
            var sum = 0;
            var ave = 0;
            for (var j in resuList[i]) {
                sum += resuList[i][j];
            }
            if (resuList[i].length != 0) {
                ave = sum / resuList[i].length;
            }

            EVAveByPeriod.push(ave);

            // 期間別のトレード回数を記憶
            tradeTimesByPeriod.push(resuList[i].length);

        }

        // グラフの目盛り調整のため、期待値、トレード回数それぞれの最大値を求める
        var EVmax = 0;
        var tradeTimeMax = 0;
        for (var i in EVAveByPeriod) {
            if (Math.abs(EVAveByPeriod[i]) > EVmax) {
                EVmax = Math.abs(EVAveByPeriod[i]);
            }

            if (tradeTimesByPeriod[i] > tradeTimeMax) {
                tradeTimeMax = tradeTimesByPeriod[i];
            }
        }

        var complexChartOption = {
            responsive: true,
            title: {
                display: true,
                fontSize: 18,
                text: '期間別'
            },
            scales: {
                yAxes: [{
                    id: "EV",   // Y軸のID
                    type: "linear",   // linear固定 
                    position: "left", // どちら側に表示される軸か？
                    ticks: {
                        /*
                        マイナスの期待値がある場合、期待値のグラフとトレード回数のグラフで0の位置がずれてしまうため、
                        グラフの目盛りの最大値と最小値を合わせることで0の位置を真ん中に固定する。
                        最大値の1割分余裕を持たせることで、最大値の棒が天井にくっついてしまうのを防ぐ。
                        */
                        max: EVmax + (EVmax * 0.1),
                        min: -(EVmax + (EVmax * 0.1)),
                    }
                }, {
                    id: "tradeTime",
                    type: "linear",
                    position: "right",
                    ticks: {
                        max: Math.round(tradeTimeMax + (tradeTimeMax * 0.1)),
                        min: -Math.round((tradeTimeMax + (tradeTimeMax * 0.1))),
                    }
                }],
            }
        };

        var myChart = new Chart(canvasElem, {
            type: 'bar',
            data: {
                labels: this.periodScale,
                datasets: [{
                    label: '期待値',
                    data: EVAveByPeriod,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    hoverBackgroundColor: "rgba(54, 162, 300, 1)",
                    borderWidth: 1,
                    yAxisID: "EV",
                },
                {
                    type: 'bar',
                    label: 'トレード回数',
                    data: tradeTimesByPeriod,
                    backgroundColor: 'rgba(255,99,132,0.3)',
                    hoverBackgroundColor: "rgba(255,99,132,0.6)",
                    borderWidth: 1,
                    yAxisID: "tradeTime"
                }]
            },

            options: complexChartOption
        });

    }

    /**
     * ローディングを開始する
     * @param text ぐるぐるの下に表示する文字
     */
    startLoading(text) {
        this.processText = text;
        this.isLoading = true;
    }

    /**
     * ローディングを停止する
     */
    stopLoading() {
        this.isLoading = false;
        this.processText = 'loading';
    }
}
