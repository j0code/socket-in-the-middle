# socket-in-the-middle

A lightweight script that allows for reading traffic for development purposes


### Install
```
$ npm install socket-in-the-middle
```
```
$ git clone https://github.com/j0code/socket-in-the-middle.git
```

### Usage
```
sudo node . <dest> <port> <encoding>
```
1. dest: ip or hostname of destination server
2. port: port of destination server
3. encoding:
   - dec:  print data byte by byte in decimal representation and separator `:`
   - hex:  print data byte by byte in hexadecimal representation and separator `:`
   - utf8: print data as string


#### Note:
The "buffer.length" on the "bridge established" log shows how many packets have been buffered.
This happens when data is received from the client prior to the bridge being ready.
If there were packets, they will be flushed to the server.
