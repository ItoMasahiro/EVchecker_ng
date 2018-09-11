import { Component, OnInit } from '@angular/core';
import { AbstractEpComponent } from '../abstract-ep/abstract-ep.component';
import { StockDataService } from '../../services/stock-data.service';
import { SharedEpService } from '../../services/shared-ep.service'
import { Router } from '@angular/router';

@Component({
    selector: 'ep-custom',
    templateUrl: './custom.component.html',
    styleUrls: ['./custom.component.css']
})
export class CustomComponent extends AbstractEpComponent implements OnInit {


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

    epConditionList = [];


    purchaseTrigger = 0;

    constructor(public stockDataService: StockDataService, public epShare: SharedEpService, private router: Router) {
        super(epShare,stockDataService);
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

        const newtd = document.createElement('td');
        newtd.appendChild(newLabel);
        newtd.setAttribute('_ngcontent-c9', '');

        document.querySelector('#ep_bar_conditions table tr').appendChild(newtd);

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

        // this.startLoading('シミュレート中');

        const pricesListNum = Object.keys(this.epShare.pricesListList).length;
        if (pricesListNum == 0) {
            return;
        }
        this.resultList.length = 0;
        for (var listListIndex = 0; listListIndex < pricesListNum; listListIndex++) {
            var pricesList = this.epShare.pricesListList[listListIndex];
            for (var i = this.epConditionList.length; i < pricesList.prices.length; i++) {

                // 価格帯絞り込みの範囲外の値段のものはスルーする
                if (Number(pricesList.prices[i].close) < this.priceBandLow || Number(pricesList.prices[i].close) > this.priceBandHigh) {
                    continue;
                }

                const length = this.epConditionList.length;
                /** ダサいからあんまり使いたくなかったけどbreakしたかどうかを判別するためにbreakFlagを使う */
                let breakFlag = false;
                for (let j = length; j > 0; j--) {

                    // pricesList.prices[i - j + 1]の日の実線の長さ(%)を求める
                    const realBody = ((Math.abs(pricesList.prices[i - j + 1].open - pricesList.prices[i - j + 1].close)) / pricesList.prices[i - j + 1].high) * 100;

                    // 上ヒゲ、実線、下ヒゲの値が入力された条件の範囲内にない場合、アウトなのでbreakする
                    if (pricesList.prices[i - j + 1].us < this.epConditionList[length - j].us_low || pricesList.prices[i - j + 1].us > this.epConditionList[length - j].us_high) {
                        breakFlag = true;
                        break;
                    }

                    if (realBody < this.epConditionList[length - j].realBody_low || realBody > this.epConditionList[length - j].realBody_high) {
                        breakFlag = true;
                        break;
                    } else {
                    }

                    if (pricesList.prices[i - j + 1].ls < this.epConditionList[length - j].ls_low || pricesList.prices[i - j + 1].ls > this.epConditionList[length - j].ls_high) {
                        breakFlag = true;
                        break;
                    }

                    // barTyapeはどちらでもが多いだろうから、最初にどちらでもが入力されたかどうかを調べる
                    if (this.epConditionList[length - j].barType && this.epConditionList[length - j].barType != 0) {
                        if (pricesList.prices[i - j + 1].barType != this.epConditionList[length - j].barType) {
                            breakFlag = true;
                            break;
                        }
                    }

                }


                // 一度もbreakされずに生き残ったら購入する
                if (!breakFlag) {
                    // 購入時は次の足の始値で購入するため、次の足が存在しない場合はスルー
                    if (!pricesList.prices[i + 1]) {
                        break;
                    }

                    if (this.purchasePattern == this.PATTERN_NARIYUKI) {
                        // 次の足の始値で購入する。購入時点のデータを記憶しておく。bid=入札、らしい
                        const pricesAtBid = pricesList.prices[i + 1];
                        pricesAtBid.buyingPrice = pricesList.prices[i + 1].open;
                        i++;
                        for (; i < pricesList.prices.length; i++) {
                            // 購入後、陰線が出るまで保有し続ける。陰線が出たら売却。売却時も次の足の始値で売却するため、次の足のデータが存在しない場合はスルーする。
                            if (pricesList.prices[i].barType == -1) {
                                if (!pricesList.prices[i + 1]) {
                                    break;
                                }
                                // 次の足の始値で売却するため、次の足のデータを記憶しておく。sell=売却、でいいかな？
                                const pricesAtSell = pricesList.prices[i + 1];
                                pricesAtSell.sellingPrice = pricesList.prices[i + 1].open;
                                const tmpResult = new Object();
                                tmpResult['code'] = pricesList.code;
                                tmpResult['bid'] = pricesAtBid;
                                tmpResult['sell'] = pricesAtSell;
                                this.resultList.push(tmpResult);
                                i--;
                                break;
                            }
                        }
                    }
                    else if (this.purchasePattern == this.PATTERN_GENZAINESASHINE) {
                        if (pricesList.prices[i].close == pricesList.prices[i + 1].open) {
                            // 当足の終値と次の足の始値が一緒だった場合にのみ購入する。これも次の足の始値で購入。
                            const pricesAtBid = pricesList.prices[i + 1];
                            pricesAtBid.buyingPrice = pricesList.prices[i + 1].open;
                            i++;
                            for (; i < pricesList.prices.length; i++) {
                                // 購入後、陰線が出るまで保有し続ける。陰線が出たら売却。売却時も次の足の始値で売却するため、次の足のデータが存在しない場合はスルーする。
                                if (pricesList.prices[i].barType == -1) {
                                    if (!pricesList.prices[i + 1]) {
                                        break;
                                    }
                                    // 次の足の始値で売却するため、次の足のデータを記憶しておく。sell=売却、でいいかな？
                                    const pricesAtSell = pricesList.prices[i + 1];
                                    pricesAtSell.sellingPrice = pricesList.prices[i + 1].open;
                                    const tmpResult = new Object();
                                    tmpResult['code'] = pricesList.code;
                                    tmpResult['bid'] = pricesAtBid;
                                    tmpResult['sell'] = pricesAtSell;
                                    this.resultList.push(tmpResult);
                                    i--;
                                    break;
                                }
                            }
                        }
                    } else if (this.purchasePattern == this.PATTERN_GENZAINESASHINE_RIKAKU) {
                        if (pricesList.prices[i].close == pricesList.prices[i + 1].open) {
                            // 当足の終値と次の足の始値が一緒だった場合にのみ購入する。これも次の足の始値で購入。
                            const pricesAtBid = pricesList.prices[i + 1];
                            pricesAtBid.buyingPrice = pricesList.prices[i + 1].open;
                            i++;
                            var sashine = 0;
                            for (; i < pricesList.prices.length; i++) {

                                /*
                                指値を下回った場合、売却する。
                                その足の安値が指値を下回っていた場合、その足の途中で指値を突破したことが確定するので、
                                その足の安値が指値を下回っていた場合に指値で売却処理をする
                                */
                                if (pricesList.prices[i].low <= sashine) {
                                    const pricesAtSell = pricesList.prices[i];

                                    /*
                                    基本的に指値の値段で売却することになるが、当足がめっちゃ窓開けて下げてスタートした場合、
                                    始値が指値を下回ってしまうことがあるので、その場合はもちろん指値で売ることは不可能なので
                                    始値で売却処理をする
                                    */
                                    if (sashine <= pricesList.prices[i].open) {
                                        pricesAtSell.sellingPrice = sashine;
                                    } else {
                                        pricesAtSell.sellingPrice = pricesList.prices[i].open;
                                    }

                                    const tmpResult = new Object();
                                    tmpResult['code'] = pricesList.code;
                                    tmpResult['bid'] = pricesAtBid;
                                    tmpResult['sell'] = pricesAtSell;
                                    this.resultList.push(tmpResult);
                                    i--;
                                    break;
                                }

                                else if (pricesList.prices[i].barType == -1) {
                                    if (!pricesList.prices[i + 1]) {
                                        break;
                                    }
                                    // 次の足の始値で売却するため、次の足のデータを記憶しておく。sell=売却、でいいかな？
                                    const pricesAtSell = pricesList.prices[i + 1];
                                    pricesAtSell.sellingPrice = pricesList.prices[i + 1].open;
                                    const tmpResult = new Object();
                                    tmpResult['code'] = pricesList.code;
                                    tmpResult['bid'] = pricesAtBid;
                                    tmpResult['sell'] = pricesAtSell;
                                    this.resultList.push(tmpResult);
                                    i--;
                                    break;
                                } else {
                                    // 利確のために1本前の終値で指値を入れる
                                    sashine = pricesList.prices[i - 1].close;
                                }
                            }
                        }
                    }

                }
            }
        }

        this.stopLoading();

    }
}