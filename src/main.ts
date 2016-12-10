// For now let's just test the features
import * as express from "express"

const MODULES = [
  "./sources/Unsplash"
]

export function serve(type: string, path: string, ...argNames: string[]): MethodDecorator {
  if (argNames == null) {
    argNames = []
  }
  return (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => {
    switch(type.toUpperCase()) {
      case "GET":
        serveGet(target, descriptor.value, path, argNames)
        break;
      case "POST":
        servePost(target, descriptor.value, path, argNames)
        break;
      default:
        throw new Error(`Illegal method ${type}`)
    }
  }
}

function serveGet(target: Object, method: Function, path: string, argNames: string[]) {
  app.get(path, (req, res, err) => {
    let args: any[] = []
    argNames.forEach((name) => {
      if (req.params[name] != null) {
        args.push(req.params[name])
      } else {
        args.push(req.query[name])
      }
    })
    method.apply(target, args)
      .subscribe((value: string) => {
        res.send(value)
      }, (err: Error) => {
        res.send(JSON.stringify(err))
      }, () => {
        res.end()
      })
  })
}

function servePost(target: Object, method: Function, path: string, argNames: string[]) {
  app.post(path, (req, res, err) => {
    let args: any[] = []
    argNames.forEach((name) => {
      if (req.params[name] != null) {
        args.push(req.params[name])
      } else {
        args.push(req.body[name])
      }
    })
    method.apply(target, args)
      .subscribe((value: string) => {
        res.send(value)
      }, (err: Error) => {
        res.send(JSON.stringify(err))
      }, () => {
        res.end()
      })
  })
}

// Configure the app
const app = express()
MODULES.forEach((mod) => require(mod))
app.listen(2380)