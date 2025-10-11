if(maestro.platform == 'android') {
    output.language = 'Kotlin'
} else if(maestro.platform == 'ios') {
    output.language = 'Swift'
} else {
    output.language = '???'
}
