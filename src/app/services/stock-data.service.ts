import { Injectable } from '@angular/core';
import { Http, RequestOptions } from '@angular/http';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable()
export class StockDataService {

    constructor(private http: Http, private httpClient: HttpClient) { }


    getPricesList(codeNumber) {

        return new Promise((resolve, reject) => {

            const pricesListList = new Object();

            this.http.get(`https://dosj4jgzqe.execute-api.ap-northeast-1.amazonaws.com/stage1`)
                .subscribe((resp) => {
                    console.log('ファイル一覧取得完了');
                    console.log(resp.json());

                    var codeCount = 0;
                    var bunkatu = [];
                    for (var i = 0; i < resp.json().length; i++) {
                        console.log('いきます' + i);
                        const result = readTextFile('https://s3-ap-northeast-1.amazonaws.com/ev-checker-data/' + resp.json()[i]);
                        if (result) {

                            for (let k = 0; k < result.datas.length; k++) {
                                const data = result.datas[k];
                                for (var j = 0; j < data.prices.length; j++) {
                                    const strDate = data.prices[j].date.split('-');
                                    data.prices[j].date = new Date(strDate[0], strDate[1] - 1, strDate[2], 15);
                                    data.prices[j].us = calcUpperShadow(data.prices[j].open, data.prices[j].high, data.prices[j].low, data.prices[j].close);
                                    data.prices[j].ls = calcLowerShadow(data.prices[j].open, data.prices[j].high, data.prices[j].low, data.prices[j].close);
                                    // 足の種類。ちょっと珍しいかもだけどイメージしやすいように1,0,-1で区別(1:陽線 0:ぺったんこ -1:陰線)
                                    if ((data.prices[j].close - data.prices[j].open) > 0) {
                                        // 終値が始値より大きければ陽線
                                        data.prices[j].barType = 1;
                                    } else if ((data.prices[j].close - data.prices[j].open) < 0) {
                                        // 終値が始値より小さければ陰線
                                        data.prices[j].barType = -1;
                                    } else {
                                        // どっちでもなければぺったんこ
                                        data.prices[j].barType = 0;
                                    }
                                }


                                // const isDataNormal = checkDataNormal(data);
                                // if (!isDataNormal) {
                                //     console.log('異常なデータを検出');
                                //     continue;
                                // }

                                // /*
                                // 過去に分割されたことがあるかどうかを調べる。
                                // 分割されてるっぽかったら、スルーしてサンプルから除外する。
                                // これは一時的な応急処置であり、そのうちちゃんと直したい。
                                // とは言っても分割に関する処理は本当に難しい。。
                                // */
                                // if (data.prices.length > 0) {
                                //     var priceBeforeOneDay = data.prices[0].open;
                                //     var bunkatuFlag = false;
                                //     for (var j = 1; j < data.prices.length; j++) {
                                //         // １日で始値が倍以上、または半分以下になっていた場合、分割と判断
                                //         if (data.prices[j].open >= priceBeforeOneDay * 2
                                //             || data.prices[j].open <= priceBeforeOneDay / 2) {
                                //             bunkatuFlag = true;
                                //         }

                                //         priceBeforeOneDay = data.prices[j].open;
                                //     }

                                //     if (bunkatuFlag) {
                                //         console.log('分割が見つかったのでスルーします');
                                //         bunkatu.push(data.code);
                                //         continue;
                                //     }
                                // }

                                data.prices.reverse();

                                pricesListList[codeCount + ''] = data;
                                console.log(data);
                                codeCount++;

                                // pricesListListの数が指定されたcodeNumberに達したら終了する
                                if (codeCount >= codeNumber) {
                                    break;
                                }
                            }

                        } else {
                        }

                        // pricesListListの数が指定されたcodeNumberに達したら終了する
                        if (codeCount >= codeNumber) {
                            break;
                        }
                    }
                    console.log('get complete');
                    console.log(pricesListList);
                    resolve(pricesListList);
                });


        });

    }

    getRecentPricesList(codeNumber) {

        return new Promise((resolve, reject) => {

            const recentPricesListList = new Object();
            let codeCount = 0;
            const result = readTextFile('https://s3-ap-northeast-1.amazonaws.com/ev-checker-recent-data/recent-data.txt');
            if (result) {

                for (let k = 0; k < result.datas.length; k++) {
                    const data = result.datas[k];
                    for (var j = 0; j < data.prices.length; j++) {
                        let strDate = data.prices[j].date.split('-');
                        if (strDate[0].length == 2) {
                            strDate[0] = '20' + strDate[0];
                        }
                        data.prices[j].date = new Date(strDate[0], strDate[1] - 1, strDate[2], 15);
                        data.prices[j].us = calcUpperShadow(data.prices[j].open, data.prices[j].high, data.prices[j].low, data.prices[j].close);
                        data.prices[j].ls = calcLowerShadow(data.prices[j].open, data.prices[j].high, data.prices[j].low, data.prices[j].close);
                        // 足の種類。ちょっと珍しいかもだけどイメージしやすいように1,0,-1で区別(1:陽線 0:ぺったんこ -1:陰線)
                        if ((data.prices[j].close - data.prices[j].open) > 0) {
                            // 終値が始値より大きければ陽線
                            data.prices[j].barType = 1;
                        } else if ((data.prices[j].close - data.prices[j].open) < 0) {
                            // 終値が始値より小さければ陰線
                            data.prices[j].barType = -1;
                        } else {
                            // どっちでもなければぺったんこ
                            data.prices[j].barType = 0;
                        }
                    }


                    recentPricesListList[codeCount + ''] = data;
                    console.log(data);
                    codeCount++;

                    // pricesListListの数が指定されたcodeNumberに達したら終了する
                    if (codeCount >= codeNumber) {
                        break;
                    }
                }

                console.log('recent data 取得完了');
                resolve(recentPricesListList);
            }
        });

    }
}



/**
* ネットから拾ってきたファイル読み込むための関数
* @param {string} 読み込みたいファイルのパス(URL)
*/
function readTextFile(url) {

    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", url, false);
    rawFile.send(null);
    try {
        const resultJson = JSON.parse(rawFile.responseText);
        return resultJson;
    } catch (e) {
    }

}

/**
* 上ヒゲの長さを計算する(株価全体に対するパーセンテージ)
* @param {number} open 
* @param {number} high 
* @param {number} low 
* @param {number} close 
*/
function calcUpperShadow(open, high, low, close) {
    var upperShadowLength = high - Math.max(open, close);
    if (upperShadowLength == 0) {
        return 0;
    }
    var upperShadowPercentForAll = (upperShadowLength / high) * 100;

    return upperShadowPercentForAll;
}

/**
 * 下ヒゲの長さを計算する(株価全体に対するパーセンテージ)
 * @param {number} open 
 * @param {number} high 
 * @param {number} low 
 * @param {number} close 
 */
function calcLowerShadow(open, high, low, close) {
    var lowerShadowLength = Math.min(open, close) - low;
    if (lowerShadowLength == 0) {
        return 0;
    }
    var lowerShadowPercentForAll = (lowerShadowLength / high) * 100;

    return lowerShadowPercentForAll;
}

/**
* 異常なデータを検出する。
* わざわざ関数作った理由は、関数作らずに普通に書くとまたbreakFlag的なbreakしたことを表すフラグを用意しないといけなくなり
* なんかダサかったので、普通じゃないやり方かもしれないけど関数にすることでreturnでいい感じにした。
*/
function checkDataNormal(data) {
    for (var j = 0; j < data.prices.length; j++) {
        const prices = data.prices[j];
        if (prices.open <= 0 || prices.high <= 0 || prices.low <= 0 || prices.close <= 0
            || prices.us < 0 || prices.ls < 0 || prices.barType <= -2 || prices.barType >= 2) {
            // ここ、本来はbreakFlagをtrueにしてbreakしたりしなきゃいけなかった。関数にすることでスマートになった。気がする。
            return false;
        }
    }
    return true;
}