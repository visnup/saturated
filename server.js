var Canvas = require('canvas')
  , http = require('http')
  , request = require('request')
  , stylus = require('stylus')
  , HSLA = stylus.nodes.HSLA
  , url = require('url')
  , d = 10

/*
 * http://saturated.jitsu.com/?url=http%3A%2F%2Fsphotos.xx.fbcdn.net%2Fhphotos-ash3%2Fs720x720%2F529205_413720861989482_125086767519561_1556562_910734765_n.jpg
 * => {"h":25.26315789473684,"s":12.418300653594772,"l":30.000000000000004,"a":1}
 */
http.createServer(function(req, res) {
  var u = url.parse(req.url, true).query.url

  if (u) {
    request({url: u, encoding: null}, function(err, resp, data) {
      if (err) return console.log(err)

      var canvas = new Canvas(d, d)
        , ctx = canvas.getContext('2d')
        , img = new Canvas.Image

      img.src = data
      ctx.drawImage(img, 0, 0, d, d)

      var p = ctx.getImageData(0, 0, d, d).data
        , saturated = new HSLA(0, 0, 0, 1)
        , hsla
      for (var i = 0; i < p.length; i += 4) {
        hsla = HSLA.fromRGBA({ r: p[0], g: p[1], b: p[2], a: p[3] })
        if (hsla.s > saturated.s && 25 < hsla.l && hsla.l < 80)
          saturated = hsla
      }

      delete hsla.hsla
      res.writeHead(200, {'Content-Type': 'application/json'})
      res.end(JSON.stringify(hsla))
    })
  } else {
    res.end("Try http://saturated.jitsu.com/?url=http%3A%2F%2Fsphotos.xx.fbcdn.net%2Fhphotos-ash3%2Fs720x720%2F529205_413720861989482_125086767519561_1556562_910734765_n.jpg")
  }
}).listen(process.env.PORT || 8002)