/* eslint-disable @typescript-eslint/no-var-requires */
const { execSync, exec, spawn } = require('child_process')
const path = require('path')
const fs = require('fs')




function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

async function stopRecording(pid, videoName, deviceVideoPath) {
	try {
		// Kill the adb screenrecord process
		process.kill(pid, 'SIGINT')

		// Wait 3 seconds for file to finalize
		await sleep(3000)

		// Pull the recorded file with custom name
		execSync(`adb pull ${deviceVideoPath} ${videoName}`, { stdio: 'inherit' })

		// Optionally delete the file on device
		execSync(`adb shell rm ${deviceVideoPath}`)

		console.log(`✅ Recording pulled and saved as ${videoName}`)
	} catch (err) {
		console.error('❌ Failed to stop or pull recording:', err.message)
	}
}

async function main() {
    let metroProcess = null
	console.log('📱 Installing app...')
	execSync('adb install ./android/app/build/outputs/apk/debug/app-debug.apk', {
		stdio: 'inherit',
		env: process.env,
	})


    console.log('📱 Starting Metro Server...')
    metroProcess = spawn('bun', ['start', '&'], {
        stdio: 'ignore',
        detached: true,
      });
    console.log('✅ Metro Server started')
    await sleep(5000); // Wait for Metro Server to start
    
    execSync(`adb shell monkey -p com.margelo.nitroexample 1`, {stdio: 'ignore'});
    console.log('✅ App started')
    await sleep(60000); // Wait for app to start and sync with Metro Server


    const MAESTRO_PATH = path.join(process.env.HOME, '.maestro', 'bin', 'maestro')
	const command = `${MAESTRO_PATH} test maestro/maestro.yaml`
	const deviceVideoPath = `/sdcard/maestro.mp4`
	// Start screen recording
	const recording = spawn(
		'adb',
		['shell', 'screenrecord', '--time-limit=1800', deviceVideoPath],
		{
			stdio: 'ignore',
			detached: true,
		},
	)
	const pid = recording.pid
    console.log('✅ Screen recording started')
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
        await stopRecording(pid, 'maestro.mp4', deviceVideoPath)
    }
}

main().catch((err) => {
	console.error('❌ Error running Maestro tests:', err)
	process.exit(1)
})
