import tlds from './tlds.json' assert { type: 'json' }

tlds.tlds = [...new Set(tlds.tlds)]
tlds.tlds.sort()

await Deno.writeTextFile('tlds.json', JSON.stringify(tlds, null, 2))
