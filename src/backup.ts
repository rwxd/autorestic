import { Writer } from 'clitastic'

import { config, VERBOSE } from './autorestic'
import { getEnvFromBackend } from './backend'
import { Locations, Location } from './types'
import { exec, ConfigError, pathRelativeToConfigFile, getFlagsFromLocation } from './utils'



export const backupSingle = (name: string, to: string, location: Location) => {
	if (!config) throw ConfigError
	const writer = new Writer(name + to.blue + ' : ' + 'Backing up... ⏳')
	const backend = config.backends[to]

	const path = pathRelativeToConfigFile(location.from)

	const cmd = exec(
		'restic',
		['backup', path, ...getFlagsFromLocation(location, 'backup')],
		{ env: getEnvFromBackend(backend) },
	)

	if (VERBOSE) console.log(cmd.out, cmd.err)
	writer.done(name + to.blue + ' : ' + 'Done ✓'.green)
}

export const backupLocation = (name: string, location: Location) => {
	const display = name.yellow + ' ▶ '
	const filler = new Array(name.length + 3).fill(' ').join('')
	if (Array.isArray(location.to)) {
		let first = true
		for (const t of location.to) {
			backupSingle(first ? display : filler, t, location)
			if (first) first = false
		}
	} else backupSingle(display, location.from, location)
}

export const backupAll = (locations?: Locations) => {
	if (!locations) {
		if (!config) throw ConfigError
		locations = config.locations
	}

	console.log('\nBacking Up'.underline.grey)
	for (const [name, location] of Object.entries(locations))
		backupLocation(name, location)
}
