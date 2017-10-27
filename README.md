# Bossa
[![Build Status](https://travis-ci.org/pldubouilh/bossa.svg?branch=master)](https://travis-ci.org/pldubouilh/bossa)

![](https://thumbs.gfycat.com/ScientificLoathsomeFruitfly-size_restricted.gif)

Fast and simple http server that allows slightly more.

Disclaimer: I spent way too much time configuring/optimising samba. Bossa fulfils my needs in terms of local filesharing, and works prefectly across chrome os, mac, gnu/linux and whatnot.

```
🎶 Bossa 🎶
Because bossa-nova is so much better than samba

-h  displays this message
-p  sets the port to listen to  - default 8080
-l  sets the host to listen to  - default to any

e.g. bossa ~/Documents
     bossa -l 127.0.0.1 -p 9090 ~/Documents
```

### Install
```
npm i -g bossa
```

### Keyboard shortcuts
 * Arrows to browse through the files and pictures
 * C to copy path to clipboard
 * N to create directory

### Benchmark
It fills my local AC wifi network bandwidth (75MB/s), but more accurate benchmarks are to come.

### Todo
- [x] Send files
- [x] Mkdir
- [x] Prompt if file already exists
- [x] Some tests
- [x] Keyboard shortcuts
- [x] Image slideshow
- [ ] More tests
- [ ] Babel client script code
- [ ] Allow more file handling (remove)
- [ ] Password protect ? (implies TLS)

