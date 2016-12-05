import { get, trianglizeUrl } from "./Utility"
import { Observable } from "rxjs/Rx"

module Unsplash {
  export function daily(): Observable<string> {
    return get("https://source.unsplash.com/daily")
      .flatMap((response) => trianglizeUrl(response.res.headers.location))
  }
}

export default Unsplash
