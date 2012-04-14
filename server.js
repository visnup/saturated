var Canvas = require('canvas')
  , http = require('http')
  , request = require('request')
  , stylus = require('stylus')
  , HSLA = stylus.nodes.HSLA
  , url = require('url')
  , util = require('util')
  , d = 10

http.createServer(function(req, res) {
  var u = url.parse(req.url, true).query.url

  if (u) {
    request({url: u, encoding: null}, function(err, resp, data) {
      if (err) return res.end(err)

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
      saturated._preview = util.format('http://www.colorhexa.com/color.php?c=h%20%d%20s%20%d%20l%20%d', saturated.h.toFixed(), saturated.s.toFixed(), saturated.l.toFixed())
      console.log(u, saturated)

      res.writeHead(200, {'Content-Type': 'application/json'})
      res.end(JSON.stringify(saturated))
    })
  } else {
    res.writeHead(200, {'Content-Type': 'text/html'})
    res.end('<style>body,input,*[type="submit"]{font:18pt monospace;text-align:center;}</style><form><input name="url" placeholder="image url" autofocus/><input type="submit"/></form><a href="https://github.com/visnup/saturated/blob/master/server.js">le code</a>')
  }
}).listen(process.env.PORT || 8000)
