import { get, trianglifyUrl } from "./Utility"
import { Observable } from "rxjs/Rx"

module Unsplash {
  export function daily(): Observable<string> {
    return get("https://source.unsplash.com/daily")
      .flatMap((response) => trianglifyUrl(response.res.headers.location))
  }
}

export default Unsplash
