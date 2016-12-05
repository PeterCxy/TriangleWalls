import * as request from "request"
import { IncomingMessage } from "http"
import { Observable, Observer } from "rxjs/Rx"
import Triangloid from "../trianglify/Triangloid"
import * as Jimp from "jimp"

module Utility {
  export interface Response {
    res: IncomingMessage
    body: string
  }
  export function get(url: string, qs?: any): Observable<Response> {
    return Observable.create((observer: Observer<Response>) => {
      request({
        method: "GET",
        url: url,
        qs: qs,
        followRedirect: false
      }, (err, res, body) => {
        if (err != null) {
          observer.error(err)
        } else {
          observer.next({
            res: res,
            body: body
          })
          observer.complete()
        }
      })
    })
  }
  export function download(url: string, qs?: any): Observable<Buffer> {
    return Observable.create((observer: Observer<Buffer>) => {
      request({
        method: "GET",
        url: url,
        qs: qs
      }).on("data", (data: Buffer) => {
        observer.next(data)
      }).on("end", () => {
        observer.complete()
      }).on("error", (err) => {
        observer.error(err)
      })
    })
    .reduce((x: Buffer, y: Buffer) => {
      if (y == null) {
        return x
      } else if (x == null) {
        return y
      }
      return Buffer.concat([x, y])
    })
  }
  export function decode(data: Buffer): Observable<Jimp> {
    return Observable.create((observer: Observer<Jimp>) => {
      Jimp.read(data, (err, image) => {
        if (err != null) {
          observer.error(err)
        } else {
          observer.next(image)
          observer.complete()
        }
      })
    })
  }
  export function trianglizeUrl(url: string, qs?: any): Observable<string> {
    // TODO: Read from cache if the file is found
    return download(url, qs)
      .flatMap(decode)
      .flatMap((image) => new Triangloid({ cellsize: 30 })
        .trianglizeRawImage(image.bitmap.data, image.bitmap.width, image.bitmap.height).generateSVG())
    // TODO: Write to cache
  }
}

export = Utility
