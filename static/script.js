const $name = document.getElementById('name')
const $domains = document.getElementById('domains')

const decoder = new TextDecoder()

const stateMap = {
  error: '👻',
  can: '🙆‍♂️',
  cant: '🙅‍♀️',
}
async function submit() {
  const name = $name.value

  $domains.innerHTML = ''

  /**
   * @type { string[] }
   */
  const tlds = await fetch('/get-tlds').then((res) => res.json())

  for (const domain of tlds.map((tld) => `${name}.${tld}`)) {
    const tr = document.createElement('tr')
    tr.innerHTML = `
      <td>${domain}</td>
      <td id="${domain}-state">
        <div class="loading loading-dots loading-md">
      </div></td>
      <td class="max-w-64 whitespace-nowrap overflow-x-scroll">
        <div id="${domain}-error">
          <div class="loading loading-dots loading-md">
        </div>
      </td>`
    $domains.append(tr)
  }

  const wsUrl = new URL(
    `${
      location.protocol.replace('http', 'ws')
    }//${location.hostname}:${location.port}/get-domain/${encodeURI(name)}`,
  )
  const socket = new WebSocket(wsUrl)
  socket.onmessage = (evt) => {
    /**
     * @type {{
     *   state: 'can' | 'cant' | 'error'
     *   domain: string
     *   error?: string
     * }}
     */
    const data = JSON.parse(evt.data)

    const state = document.getElementById(`${data.domain}-state`)
    const error = document.getElementById(`${data.domain}-error`)

    state.textContent = stateMap[data.state]
    error.textContent = data.error
  }
}
