/* eslint-disable @typescript-eslint/no-var-requires */
const { execSync, exec, spawn } = require('child_process')
const path = require('path')
const fs = require('fs')




function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms))
}


async function main() {
    let metroProcess = null
	console.log('📱 Starting simulator...')
	execSync(`xcrun simctl boot "iPhone 16"`)

	console.log('📱 Installing app...')
	
	execSync('xcrun simctl install booted ./NitroExample.app', {
		stdio: 'inherit',
		env: process.env,
	})

	console.log('📱 Getting UDID...')
	const getUdidCommand = `xcrun simctl list devices booted -j | jq -r '[.devices[]] | add | first | .udid'`;
	const udid = String(execSync(getUdidCommand)).trim();

	execSync('open -a simulator');
	await sleep(1000);



	

    console.log('📱 Starting Metro Server...')
    metroProcess = spawn('bun', ['start', '&'], {
        stdio: 'ignore',
        detached: true,
      });

    console.log('✅ Metro Server started')
    await sleep(5000); // Wait for Metro Server to start
    
   
	execSync(`xcrun simctl launch "${udid}" com.mrousavy.nitro.example`)
	await sleep(5000); // Wait for app to start and sync with Metro Server


    const MAESTRO_PATH = path.join(process.env.HOME, '.maestro', 'bin', 'maestro')
	const command = `${MAESTRO_PATH} test   maestro/maestro.yaml`


	const recordingProcess = spawn('xcrun simctl io booted recordVideo maestro.mov', {
		detached: true,
		stdio: 'ignore',
	  });

    console.log('✅ Screen recording started',recordingProcess.pid)
    try {
        console.log(`\n🔄 Starting test suite.`)
        execSync(command, { stdio: 'inherit', env: process.env })
        console.log('✅ Maestro tests completed successfully')
    } catch (error) {
        console.error('❌ Error running Maestro tests:', error)
        throw error
    }finally {
        if (metroProcess) {
            process.kill(metroProcess.pid)
        }
		if (recordingProcess) {
			recordingProcess.kill('SIGINT');
		
		}
    }
}

main().catch((err) => {
	console.error('❌ Error running Maestro tests:', err)
	process.exit(1)
})
