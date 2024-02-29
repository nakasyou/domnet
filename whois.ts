export const whois = async (domain: string) => {
  const res = await fetch('https://whois-api-zeta.vercel.app/', {
    method: 'POST',
    body: JSON.stringify({
      domain
    })
  })
  const text = await res.text()
  try {
    return JSON.parse(text)
  } catch (_e) {
    return {
      error: text
    }
  }
}