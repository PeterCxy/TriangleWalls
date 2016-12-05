// For now let's just test the features
import * as Jimp from "jimp"
import * as fs from "fs"
import Triangloid from "./trianglify/Triangloid"

Jimp.read("./image/journey.jpg", (err, image) => {
  if (err != null) {
    throw err
  }

  new Triangloid({ cellsize: 50 }).trianglizeRawImage(image.bitmap.data, image.bitmap.width, image.bitmap.height)
    .generateSVG()
    .subscribe((result) => fs.writeFileSync("./image/journey.svg", result))
})
