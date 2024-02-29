const $name = document.getElementById("name")
const $domains = document.getElementById("domains")

const decoder = new TextDecoder()

const stateMap = {
  error: '👻',
  can: '🙆‍♀️',
  cant: '🙅‍♀️'
}
async function submit() {
  const name = $name.value

  $domains.innerHTML = ''

  /**
   * @type { string[] }
   */
  const tlds = await fetch('/get-tlds').then(res => res.json())

  for (const domain of tlds.map((tld) => `${name}.${tld}`)) {
    const tr = document.createElement('tr')
    tr.innerHTML = `
      <td>${domain}</td>
      <td id="${domain}-state">Pending...</td>
      <td class="max-w-64 whitespace-nowrap overflow-x-scroll">
        <div id="${domain}-error">
        </div>
      </td>`
    $domains.append(tr)
  }

  const socket = new WebSocket(`/get-domain/${encodeURI(name)}`)

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
