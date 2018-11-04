import { Component, OnInit } from '@angular/core';
import { AbstractEpComponent } from '../abstract-ep/abstract-ep.component';
import { StockDataService } from '../../services/stock-data.service';
import { SharedEpService } from '../../services/shared-ep.service';
import { Router } from '@angular/router';
import { SimulateService } from '../../services/simulate.service';

@Component({
    selector: 'ep-ls-in-bottom',
    templateUrl: './ls-in-bottom.component.html',
    styleUrls: ['./ls-in-bottom.component.css']
})
export class LsInBottomComponent extends AbstractEpComponent implements OnInit {


    /** 底値下ヒゲシミュレート時の過去何本の足を見て底値と判断するか */
    areasJudgementStandardLsInBottom = 100;

    purchaseTrigger = 0;

    constructor(
        public stockDataService: StockDataService,
        public epShare: SharedEpService,
        private router: Router,
        private simulator: SimulateService
    ) {
        super(epShare, stockDataService);
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


    startSimulate() {
        this.startLoading('検証中');

        const epConditions =
        {
            ep: [
                {
                    ls_low: this.purchaseTrigger
                }
            ],
            option: {
                priceBandLow: this.priceBandLow,
                priceBandHigh: this.priceBandHigh,
                purchasePattern: this.purchasePattern,
                periodScale: this.periodScale.concat(),
                priceRangeScale: this.priceRangeScale.concat(),
                fee: this.fee,
                bottomDecisionDays: this.areasJudgementStandardLsInBottom,
                sellPattern: this.sellPattern,
                holdDays: this.holdDays
            }
        }
        this.simulator.simulate(epConditions).then((data) => {

            this.showResult(data['body']);
            this.stopLoading()

        }).catch((err) => {

            console.log('エラー');
            console.log(err);

            document.getElementById(this.resultLabelId).innerText = err.error.body;

            this.stopLoading()

        })
    }


    /**
     * 底値下ヒゲでのシミュレーション
     */
    simulate() {

        const pricesListNum = Object.keys(this.epShare.pricesListList).length;
        if (pricesListNum == 0) {
            return;
        }
        this.resultList.length = 0;
        for (var listListIndex = 0; listListIndex < pricesListNum; listListIndex++) {
            var pricesList = this.epShare.pricesListList[listListIndex];
            for (var i = this.areasJudgementStandardLsInBottom; i < pricesList.prices.length; i++) {

                // 価格帯絞り込みの範囲外の値段のものはスルーする
                if (Number(pricesList.prices[i].close) < this.priceBandLow || Number(pricesList.prices[i].close) > this.priceBandHigh) {
                    continue;
                }


                // 過去areasJudgementStandardLsInBottom個分の足の安値の中でもっとも安い安値を特定する
                let minLowInArea = pricesList.prices[i - 1].low;
                for (var j = 2; j < this.areasJudgementStandardLsInBottom; j++) {
                    if (minLowInArea > pricesList.prices[i - j].low) {
                        minLowInArea = pricesList.prices[i - j].low;
                    }
                }

                // 過去areasJudgementStandardLsInBottom個分の足の安値の中でもっとも安い安値よりpricesList.prices[i]の安値が安かったら、底値確定
                if (pricesList.prices[i].low < minLowInArea) {
                    // 底値かつ下ヒゲの長さが特定の長さを超えたら購入
                    if (pricesList.prices[i].ls >= this.purchaseTrigger) {
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
        }

        this.stopLoading();
    }
}