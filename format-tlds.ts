import tlds from './tlds.json' with { type: 'json' }

tlds.tlds = [...new Set(tlds.tlds)]
tlds.tlds.sort((a, b) => a.split('.').reverse().join('.') < b.split('.').reverse().join('') ? -1 : 1)

await Deno.writeTextFile('tlds.json', JSON.stringify(tlds, null, 2))
