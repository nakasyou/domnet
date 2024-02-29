import { Hono } from "https://deno.land/x/hono@v4.0.8/mod.ts"
import { serveStatic } from "https://deno.land/x/hono@v4.0.8/middleware.ts"
import { streamText } from "https://deno.land/x/hono/helper.ts"
import { whois } from "./whois.ts"
import tlds from "./tlds.json" assert { type: "json" }

const app = new Hono()

app.get(
  "/*",
  serveStatic({
    root: "./static",
  }),
)

app.get("/get-tlds", (c) => c.json(tlds.tlds))

app.get("/get-domain/:name", (c) => {
  const name = c.req.param("name")
  const { socket, response } = Deno.upgradeWebSocket(c.req.raw)

  const send = (data: {
    state: "can" | "cant" | "error"
    domain: string
    error?: string
  }) => {
    socket.send(JSON.stringify(data))
  }
  socket.onopen = () => {
    for (const tld of tlds.tlds) {
      const domain = `${name}.${tld}`
      const punyDomain = new URL(`https://${domain}`).hostname
      whois(punyDomain).then((whois) => {
        if (!whois.error) {
          if (Object.keys(whois).length > 1) {
            send({
              state: "cant",
              domain,
            })
            return
          }
          send({
            state: "can",
            domain
          })
        } else if (whois.error.includes("Domain is not found")) {
          send({
            state: "can",
            domain,
          })
        } else {
          send({
            state: "error",
            domain,
            error: whois.error,
          })
        }
        return
      })
    }
  }
  return response
})

Deno.serve(app.fetch)
