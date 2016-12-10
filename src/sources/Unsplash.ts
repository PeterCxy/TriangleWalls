import { get, trianglifyUrl } from "./Utility"
import { Observable } from "rxjs/Rx"
import { serve } from "../main"

class Unsplash {
  @serve("GET", "/unsplash/:type(daily|weekly)", "type")
  static random(type: string): Observable<string> {
    return get(`https://source.unsplash.com/${type}`)
      .flatMap((response) => trianglifyUrl(response.res.headers.location))
  }
}

export default Unsplash
