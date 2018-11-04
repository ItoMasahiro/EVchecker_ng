import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable()
export class SimulateService {

    constructor(private httpClient: HttpClient) { }

    apiBaseUrl='http://18.182.27.113:3000/';

    /**
     * シミュレートを開始する
     * @param epConditions エントリーポイントの条件
     */
    simulate(epConditions) {
        return new Promise((resolve, reject) => {
            this.httpClient.post(this.apiBaseUrl+'simulate', epConditions).timeout(300000).toPromise().then((resp) => {
                console.log('シミュレート成功')
                console.log(resp);
                resolve(resp);
            }).catch((err) => {
                console.log('シミュレート失敗')
                console.log(err);
                reject(err);
            })
        })
    }

    /**
     * ランダムシミュレートを開始する
     * @param epConditions エントリーポイントの条件
     */
    simulateRandom(epConditions) {
        return new Promise((resolve, reject) => {
            this.httpClient.post(this.apiBaseUrl+'simulate-random', epConditions).toPromise().then((resp) => {
                console.log('シミュレート成功')
                console.log(resp);
                resolve(resp);
            }).catch((err) => {
                console.log('シミュレート失敗')
                console.log(err);
                reject(err);
            })
        })
    }

}