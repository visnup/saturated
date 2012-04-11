var Canvas = require('canvas')
  , http = require('http')
  , request = require('request')
  , stylus = require('stylus')
  , HSLA = stylus.nodes.HSLA
  , url = require('url')
  , d = 10

http.createServer(function(req, res) {
  var u = url.parse(req.url, true).query.url

  if (u) {
    console.log(u)
    request({url: u, encoding: null}, function(err, resp, data) {
      if (err) return res.end(err)

      try {
        var canvas = new Canvas(d, d)
          , ctx = canvas.getContext('2d')
          , img = new Canvas.Image

        img.src = data
        ctx.drawImage(img, 0, 0, d, d)

        var p = ctx.getImageData(0, 0, d, d).data
          , saturated = new HSLA(0, 0, 0, 1)
          , hsla
        for (var i = 0; i < p.length; i += 4) {
          hsla = HSLA.fromRGBA({ r: p[i], g: p[i+1], b: p[i+2], a: p[i+3] })
          if (hsla.s > saturated.s && 25 < hsla.l && hsla.l < 80)
            saturated = hsla
        }

        delete saturated.hsla
        res.writeHead(200, {'Content-Type': 'application/json'})
        res.end(JSON.stringify(saturated))
      } catch(e) {
        res.end(require('util').inspect(e))
      }
    })
  } else {
    res.writeHead(200, {'Content-Type': 'text/html'})
    res.end('<form><input name="url" placeholder="image url"/><input type="submit"/></form>')
  }
}).listen(process.env.PORT || 8002)
