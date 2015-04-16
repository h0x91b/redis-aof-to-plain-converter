# redis-aof-to-plain-converter

Simple tool usable for importing data from aof file to a new redis-cluster with diffrent configuration

`node index.js test.aof`
`node index.js test.aof > plain.txt`
`node index.js test.aof | redis-cli -c -p 7011 -h localhost`