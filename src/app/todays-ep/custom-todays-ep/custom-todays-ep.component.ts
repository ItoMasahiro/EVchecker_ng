import { Component, OnInit } from '@angular/core';
import { AbstractTodaysEpComponent } from '../abstract-todays-ep/abstract-todays-ep.component';
import { StockDataService } from '../../services/stock-data.service';
import { SharedTodaysEpService } from '../../services/shared-todays-ep.service'
import { Router } from '@angular/router';

@Component({
    selector: 'custom-todays-ep',
    templateUrl: './custom-todays-ep.component.html',
    styleUrls: ['./custom-todays-ep.component.css']
})
export class CustomTodaysEpComponent extends AbstractTodaysEpComponent implements OnInit {

    /** 入力された上ヒゲの長さ */
    inputUsLength_low = 0;
    inputUsLength_high = 100;
    /** 入力された実線の長さ */
    inputRealBodyLength_low = 0;
    inputRealBodyLength_high = 100;
    /** 入力された下ヒゲの長さ */
    inputLsLength_low = 0;
    inputLsLength_high = 100;
    /** 入力されたバータイプ(陽線or陰線orどちらでも) */
    barType_input;
    /** 入力した足の購入条件を表示するためのテーブルのtdの数を調整するための配列。ここにtrueを追加する度にtdが追加される */
    tdArray = [true];

    epConditionList = [];


    purchaseTrigger = 0;

    constructor(public todaysEpShare: SharedTodaysEpService, public stockDataService: StockDataService, private router: Router) {
        super(todaysEpShare, stockDataService);
    }


    ngOnInit() {

    }

    /**
    * 購入条件変更
    * @param {購入条件} pattern 0:成行 1:現在値指値 ...
    */
    selectPurchasePattern(pattern: number): void {
        this.purchasePattern = pattern;
    }

    /**
    * カスタムバーのバータイプ変更
    * @param {購入条件} type 1:陽線 -1:陰線 0:どちらでも
    */
    selectBarType(type: number): void {
        this.barType_input = type;
    }

    /**
     * エントリーポイントの足を追加する
     */
    addBar() {
        const tmpList = new Object();
        tmpList['us_low'] = this.inputUsLength_low;
        tmpList['us_high'] = this.inputUsLength_high;
        tmpList['realBody_low'] = this.inputRealBodyLength_low;
        tmpList['realBody_high'] = this.inputRealBodyLength_high;
        tmpList['ls_low'] = this.inputLsLength_low;
        tmpList['ls_high'] = this.inputLsLength_high;
        tmpList['barType'] = this.barType_input;
        this.epConditionList.push(tmpList);


        console.log(this.epConditionList);

        const newLabel = document.createElement('label');

        let usStr;
        let realBodyStr;
        let lsStr;
        let barTypeStr;

        if (!this.inputUsLength_low || this.inputUsLength_low < 0) {
            this.inputUsLength_low = 0;
        }
        if (!this.inputUsLength_high || this.inputUsLength_high > 100) {
            this.inputUsLength_high = 100;
        }
        usStr = this.inputUsLength_low + '% ~ ' + this.inputUsLength_high + '%';


        if (!this.inputRealBodyLength_low || this.inputRealBodyLength_low < 0) {
            this.inputRealBodyLength_low = 0;
        }
        if (!this.inputRealBodyLength_high || this.inputRealBodyLength_high > 100) {
            this.inputRealBodyLength_high = 100;
        }
        realBodyStr = this.inputRealBodyLength_low + '% ~ ' + this.inputRealBodyLength_high + '%';


        if (!this.inputLsLength_low || this.inputLsLength_low < 0) {
            this.inputLsLength_low = 0;
        }
        if (!this.inputLsLength_high || this.inputLsLength_high > 100) {
            this.inputLsLength_high = 100;
        }
        lsStr = this.inputLsLength_low + '% ~ ' + this.inputLsLength_high + '%';


        if (this.barType_input == 1) {
            barTypeStr = '陽線'
        } else if (this.barType_input == -1) {
            barTypeStr = '陰線'
        } else {
            barTypeStr = 'どちらでも'
        }

        newLabel.innerText =
            '上ヒゲ ' + usStr + '\n' +
            '実線　 ' + realBodyStr + '\n' +
            '下ヒゲ ' + lsStr + '\n' +
            barTypeStr;

        // tdArrayにtrueを追加することでtd要素を追加する
        this.tdArray.push(true);
        const tds = document.querySelector('#ep_bar_conditions table tr').getElementsByTagName('td');
        tds[tds.length - 1].appendChild(newLabel);

        this.inputUsLength_low = 0;
        this.inputUsLength_high = 100;
        this.inputRealBodyLength_low = 0;
        this.inputRealBodyLength_high = 100;
        this.inputLsLength_low = 0;
        this.inputLsLength_high = 100;
        this.barType_input = undefined;
    }


    /**
     * カスタムでのシミュレーション
     */
    simulate() {

        console.log(this, this.todaysEpShare.pricesListList);

        // this.startLoading('シミュレート中');

        const pricesListNum = Object.keys(this.todaysEpShare.pricesListList).length;
        if (pricesListNum == 0) {
            return;
        }
        this.resultList.length = 0;
        for (var listListIndex = 0; listListIndex < pricesListNum; listListIndex++) {
            var pricesList = this.todaysEpShare.pricesListList[listListIndex];

            const length = pricesList.prices.length;

            // 価格帯絞り込みの範囲外の値段のものはスルーする
            if (Number(pricesList.prices[length - 1].close) < this.priceBandLow || Number(pricesList.prices[length - 1].close) > this.priceBandHigh) {
                continue;
            }

            const epConditionLength = this.epConditionList.length;
            // ダサいからあんまり使いたくなかったけどbreakしたかどうかを判別するためにbreakFlagを使う
            let breakFlag = false;
            for (let i = epConditionLength; i > 0; i--) {

                // pricesList.prices[i - j + 1]の日の実線の長さ(%)を求める
                const realBody = ((Math.abs(pricesList.prices[length - i].open - pricesList.prices[length - i].close)) / pricesList.prices[length - i].high) * 100;

                // 上ヒゲ、実線、下ヒゲの値が入力された条件の範囲内にない場合、アウトなのでbreakする
                if (pricesList.prices[length - i].us < this.epConditionList[epConditionLength - i].us_low || pricesList.prices[length - i].us > this.epConditionList[epConditionLength - i].us_high) {
                    breakFlag = true;
                    break;
                }

                if (realBody < this.epConditionList[epConditionLength - i].realBody_low || realBody > this.epConditionList[epConditionLength - i].realBody_high) {
                    breakFlag = true;
                    break;
                } else {
                }

                if (pricesList.prices[length - i].ls < this.epConditionList[epConditionLength - i].ls_low || pricesList.prices[length - i].ls > this.epConditionList[epConditionLength - i].ls_high) {
                    breakFlag = true;
                    break;
                }

                // barTyapeはどちらでもが多いだろうから、最初にどちらでもが入力されたかどうかを調べる
                if (this.epConditionList[epConditionLength - i].barType && this.epConditionList[epConditionLength - i].barType != 0) {
                    if (pricesList.prices[length - i].barType != this.epConditionList[epConditionLength - i].barType) {
                        breakFlag = true;
                        break;
                    }
                }

            }
            // 一度もbreakされずに生き残ったら購入する
            if (!breakFlag) {

                this.resultList.push(pricesList);

            }
        }

        this.stopLoading();

    }

    // 親コンポーネントの方ではepConditionListが取得できないため、このメソッドをオーバーライド
    showResult() {
        const resultLabel = document.getElementById(this.resultLabelId);
        resultLabel.innerText = '';
        if (this.resultList.length == 0) {
            resultLabel.innerText = '条件に合う銘柄が見つかりませんでした';
            return;
        }

        console.log(this.resultList);
        for (let i = 0; i < this.resultList.length; i++) {
            resultLabel.innerText += this.resultList[i]['code'] + '　' + this.resultList[i]['name'] + '\n';
            const pricesLength = this.resultList[i]['prices'].length;
            let resultText = '';
            for (let j = 0; j < this.epConditionList.length; j++) {
                const date = this.resultList[i]['prices'][pricesLength - 1 - j]['date'];

                const us = Math.round(this.resultList[i]['prices'][pricesLength - 1 - j]['us'] * 100) / 100;
                const usText = us.toFixed(2);
                const realBody = Math.round(((Math.abs(this.resultList[i]['prices'][pricesLength - 1 - j]['open'] - this.resultList[i]['prices'][pricesLength - 1 - j]['close'])) / this.resultList[i]['prices'][pricesLength - 1 - j]['high']) * 100 * 100) / 100;
                const realBodyText = realBody.toFixed(2);
                const ls = Math.round(this.resultList[i]['prices'][pricesLength - 1 - j]['ls'] * 100) / 100;
                const lsText = ls.toFixed(2);

                resultText += '　' + date.getFullYear() + '/' + ('0' + (date.getMonth() + 1)).slice(-2) + '/' + ('0' + date.getDate()).slice(-2) +
                    '　　上ヒゲ　' + usText + '%' +
                    '　　　実線　' + realBodyText + '%' +
                    '　　下ヒゲ　' + lsText + '%' + '\n'
            }
            resultText += '\n';
            resultLabel.innerText += resultText;
        }
    }
}