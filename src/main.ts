// For now let's just test the features
import * as fs from "fs"
import Unsplash from "./sources/Unsplash"

Unsplash.daily()
  .subscribe((svg) => fs.writeFileSync("./image/test.svg", svg))
