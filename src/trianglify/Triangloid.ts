// Adapted from <https://github.com/asifmallik/triangloid/blob/master/triangloid.js>
import * as jsdom from "jsdom"
import * as d3 from "d3"
import { Observable, Observer } from "rxjs/Rx"

class Triangloid {
  private options: Triangloid.Options
  constructor(options: Triangloid.Options = {}) {
    this.options = {
      bleed: options.bleed != null ? options.bleed : 150,
      cellsize: options.cellsize != null ? options.cellsize : 150,
      cellpadding: options.cellpadding != null ? options.cellpadding : 0.1 * options.cellsize || 15
    }
  }

  trianglizeImage(data: Array<Triangloid.Pixel>, width: number, height: number): Triangloid.TrianglifiedImage {
    return new Triangloid.TrianglifiedImage(this.options, data, width, height)
  }

  trianglizeRawImage(rawData: Uint8Array, width: number, height: number): Triangloid.TrianglifiedImage {
    let data = new Array<Triangloid.Pixel>()
    for (var i = 0; i < rawData.length; i += 4) {
      data.push([rawData[i], rawData[i + 1], rawData[i + 2]]) // RGBA
    }
    return this.trianglizeImage(data, width, height)
  }
}

namespace Triangloid {
  export type Pixel = [number, number, number]
  export interface Options {
    bleed?: number
    cellsize?: number
    cellpadding?: number
  }

  export class TrianglifiedImage {
    private rawData: Array<Pixel>
    private options: Options
    private width: number
    private height: number
    private pattern: Pattern

    constructor(options: Options, data: Array<Pixel>, width: number, height: number) {
      this.options = options
      this.rawData = data
      this.width = width
      this.height = height
      this.pattern = new Pattern(options, width, height)
    }

    generateSVG(): Observable<string> {
      return Observable.create((observer: Observer<string>) => {
        jsdom.env({
          html: "<div id='container'></div>",
          done: (err, window) => {
            if (err != null) {
              observer.error(err)
            } else {
              let container = window.document.getElementById("container")
              let svg = d3.select(window.document).select("#container")
                .append("svg")
                .attr("width", this.width)
                .attr("height", this.height)
                .attr("xmlns", "http://www.w3.org/2000/svg")
              let group = svg.append("g")
              this.pattern.triangles.forEach((d) => {
                let x = Math.round((d[0][0] + d[1][0] + d[2][0]) / 3)
                let y = Math.round((d[0][1] + d[1][1] + d[2][1]) / 3)
                if (x < 0) {
                  x = 0
                } else if (x >= this.width) {
                  x = this.width - 1
                }

                if (y < 0) {
                  y = 0
                } else if (y >= this.height) {
                  y = this.height - 1
                }
                let pixelIndex = x + (y * this.width)
                let c = `rgb(${this.rawData[pixelIndex].join(",")})`
                group.append("path").attr("d", "M" + d.join("L") + "Z").attr("fill", c).attr("stroke", c)
              })
              observer.next(container.innerHTML)
              observer.complete()
            }
          }})
      })
    }
  }

  export class Pattern {
    private options: Options
    private width: number
    private height: number
    triangles: Array<d3.VoronoiTriangle<[number, number]>>

    constructor(options: Options, width: number, height: number) {
      this.options = options
      this.width = width
      this.height = height
      this.triangles = this.generateTriangles()
    }

    private generateTriangles(): Array<d3.VoronoiTriangle<[number, number]>> {
      let cellsX = Math.ceil((this.width + this.options.bleed * 2) / this.options.cellsize)
      let cellsY = Math.ceil((this.height + this.options.bleed * 2) / this.options.cellsize)

      let vertices = d3.range(cellsX * cellsY).map((d) => {
        let col = d % cellsX
        let row = Math.floor(d / cellsX)
        let x = Math.round(-this.options.bleed + col * this.options.cellsize + Math.random() * (this.options.cellsize - this.options.cellpadding * 2) + this.options.cellpadding)
        let y = Math.round(-this.options.bleed + row * this.options.cellsize + Math.random() * (this.options.cellsize - this.options.cellpadding * 2) + this.options.cellpadding)
        return <[number, number]> [x, y]
      })

      return d3.voronoi().triangles(vertices)
    }
  }
}

export default Triangloid
