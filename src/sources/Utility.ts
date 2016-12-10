import * as request from "request"
import * as fs from "fs"
import * as crypto from "crypto"
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
  export function md5(str: string): string {
    return crypto.createHash("md5").update(str).digest("hex")
  }
  export function readFile(path: string): Observable<string> {
    return Observable.create((observer: Observer<string>) => {
      fs.readFile(path, "utf8", (err, data) => {
        if (err != null) {
          observer.error(err)
        } else {
          observer.next(data)
          observer.complete()
        }
      })
    })
  }
  export function writeFile(path: string, content: string): Observable<string> {
    return Observable.create((observer: Observer<string>) => {
      fs.writeFile(path, content, (err) => {
        if (err != null) {
          observer.error(err)
        } else {
          observer.next(content)
          observer.complete()
        }
      })
    })
  }
  export function fileExists(path: string): Observable<boolean> {
    return Observable.create((observer: Observer<boolean>) => {
      fs.exists(path, (exists) => {
        observer.next(exists)
        observer.complete()
      })
    })
  }
  export function trianglifyUrl(url: string, qs?: any): Observable<string> {
    return _trianglifyUrl(url, md5(url), qs)
  }
  function _trianglifyUrl(url: string, urlMD5: string, qs?: any): Observable<string> {
    return fileExists(`./data/${urlMD5}.svg`)
      .flatMap((exists) => {
        if (exists) {
          return readFile(`./data/${urlMD5}.svg`)
        } else {
          return download(url, qs)
            .flatMap(decode)
            .flatMap((image) => new Triangloid({ cellsize: 30 })
              .trianglizeRawImage(image.bitmap.data, image.bitmap.width, image.bitmap.height).generateSVG())
            .flatMap((svg) => writeFile(`./data/${urlMD5}.svg`, svg))
        }
      })
  }
}

export = Utility
