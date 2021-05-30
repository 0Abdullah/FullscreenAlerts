const express = require('express')
const { exec } = require('child_process')
const app = express()
app.get('/', (req, res) => {
    res.sendFile(__dirname + "/index.html")
})
app.get('/convert/:ytId/:start/:end/:threshold/:tolerance/:softness/:fileName/:quality', (req,res) => {
    //console.log('recieved GET')
    exec(`${__dirname}/cli/youtube-dl.exe --config-location "${__dirname}/cli/youtube-dl.conf" -f "bestvideo[height>=720]+bestaudio/best[height>=720]/best" https://www.youtube.com/watch?v=${req.params.ytId} --exec "${__dirname}/cli/ffmpeg.exe -y -ss ${req.params.start} -i {} -to ${req.params.end} -c:v libvpx -crf ${req.params.quality} -b:v 100M -vf lumakey=${req.params.threshold}:${req.params.tolerance}:${req.params.softness} -pix_fmt yuva420p -auto-alt-ref 0 tmp/${req.params.fileName}.webm"`, (err, stdout, stderr) => {
        if(err) {console.log('error: ' + err)}
        console.log('stdout: ' + stdout)
        console.log('stderr: ' + stderr)
        exec(`${__dirname}/cli/curl.exe -i -F files[]=@tmp/${req.params.fileName}.webm https://up.loaded.ie/upload.php?output=text`, (err, stdout, stderr) => {
            if(err) {console.log('cURL error: ' + err)}
            console.log('cURL stdout: ' + stdout)
            console.log('cURL stderr: ' + stderr)
            let uploadedUrl = stdout.split('\n')
            res.send(uploadedUrl[uploadedUrl.length-2])
        })
        console.log('finished render')
    })    
})
app.listen(process.env.PORT || 3000, ()=> {
    console.log('on port 1050')
})