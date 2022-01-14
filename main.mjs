import net from "net"

const port = 46

var args = process.argv.slice(2)
if(args.length != 3) printSyntax(`${args.length} arguments given. Expected:`, 3)

const dest_ip = args[0]
const dest_port = Number(args[1])
const encoding = args[2]

if(isNaN(dest_port)) printSyntax(`port has to a number. Given: ${args[1]}`)
if(!["dec","hex","utf8"].includes(args[2])) printSyntax(`Unknown encoding: ${args[2]}`)

const socket = net.createServer({}, client => {
  console.log(`${client.remoteAddress}:${client.remotePort} connected.`)

  var bridgeConnected = false
  var buffer = []

  var server = net.connect(dest_port, dest_ip, () => {
    for(var i = 0; i < buffer.length; i++) {
      server.write(buffer[i])
    }
    client.pipe(server)
    server.pipe(client)
    bridgeConnected = true
    console.log(`${client.remoteAddress}:${client.remotePort} <-> ${dest_ip}:${dest_port} ~ bridge established, buffer.length:`, buffer.length)
  })

  if(encoding == "utf8") client.setEncoding(encoding)
  client.on("data", data => {
    var s = data
    if(["hex","dec"].includes(encoding)) {
      s = []
      for(var byte of data) {
        if(encoding == "hex") byte = byte.toString(16)
        s.push(byte)
      }
      s = s.join(":")
    }
    if(!bridgeConnected) buffer.push(data)
    console.log(`${client.remoteAddress}:${client.remotePort}  -> ${dest_ip}:${dest_port} ~ ${s}`)
  })

  client.on("error", e => {
    switch(e.code) {
      case "ECONNRESET":
        console.log(`${client.remoteAddress}:${client.remotePort} <-> ${dest_ip}:${dest_port} ~ client reset connection`)
        if(!client.destroyed) client.destroy()
        if(!server.destroyed) server.destroy()
      break

      default:
        console.error("Unknown error:", e)
        process.exit(0)
      break
    }
  })

  client.on("close", () => {
    console.log(`${client.remoteAddress}:${client.remotePort} <-> ${dest_ip}:${dest_port} ~ client closed connection`)
    server.end()
  })

  client.on("end", () => {
    console.log(`${client.remoteAddress}:${client.remotePort} <-> ${dest_ip}:${dest_port} ~ client disconnected`)
    server.end()
  })

  client.on("timeout", () => {
    console.log(`${client.remoteAddress}:${client.remotePort} <-> ${dest_ip}:${dest_port} ~ client timed out`)
    server.end()
  })

  if(encoding == "utf8") server.setEncoding(encoding)
  server.on("data", data => {
    var s = data
    if(["hex","dec"].includes(encoding)) {
      s = []
      for(var byte of data) {
        if(encoding == "hex") byte = byte.toString(16)
        s.push(byte)
      }
      s = s.join(":")
    }
    console.log(`${client.remoteAddress}:${client.remotePort} <-  ${dest_ip}:${dest_port} ~ ${s}`)
  })

  server.on("error", e => {
    switch(e.code) {
      case "ENOTFOUND":
        printSyntax(`dest has to be a valid ip or hostname. Given:`, dest_ip)
      break

      case "ECONNRESET":
        console.log(`${client.remoteAddress}:${client.remotePort} <-> ${dest_ip}:${dest_port} ~ server reset connection`)
        if(!client.destroyed) client.destroy()
        if(!server.destroyed) server.destroy()
      break

      default:
        console.error("Unknown error:", e)
        process.exit(0)
      break
    }
  })


  server.on("close", () => {
    console.log(`${client.remoteAddress}:${client.remotePort} <-> ${dest_ip}:${dest_port} ~ server closed connection`)
    client.end()
  })

  server.on("end", () => {
    console.log(`${client.remoteAddress}:${client.remotePort} <-> ${dest_ip}:${dest_port} ~ server disconnected`)
    client.end()
  })

  server.on("timeout", () => {
    console.log(`${client.remoteAddress}:${client.remotePort} <-> ${dest_ip}:${dest_port} ~ server timed out`)
    client.end()
  })
})

socket.on("error", e => console.log("Error:", e))

socket.listen(port, () => {
  console.log("server running on", port)
})

function printSyntax(...e) {
  console.log(...e)
  console.log("Syntax: node . <dest> <port> <encoding>\n")
  console.log("dest:     ip or hostname of destination server")
  console.log("port:     port of destination server")
  console.log("encoding: dec, hex or utf8 for strings")
  process.kill(0)
}
