var fs = require('fs');

function usage() {
	console.log('Usage: node %s <aof-file>', process.argv[1]);
	console.log('\tExamples:')
	console.log('\t\tnode %s test.aof > plain.txt', process.argv[1]);
	console.log('\t\tnode %s test.aof | redis-cli -c -p 7011 -h localhost', process.argv[1]);
	process.exit();
}

if(process.argv.length < 3) {
	usage();
} else if(process.argv[2] === '-h') {
	usage();
} else if(process.argv[2] === '--help') {
	usage();
}
var aof = process.argv[2];

fs.open(aof, 'r', onOpen);

function onOpen(err, fd){
	if(err) throw new Error(err);
	var aofStat = fs.statSync(aof);
	
	var str = '';
	var offset = 0;
	var position = 0;
	var bufSize = 1024;
	var buf = new Buffer(bufSize);
	readChunk();
	
	function readChunk() {
		fs.read(fd, buf, 0, bufSize, position, onRead);
	}
	function onRead(err, bytesRead) {
		if(err) throw new Error(err);
		//console.log('readed %s bytes, buf at position %s, file size is %s', bytesRead, position, aofStat.size);
		str = buf.toString('utf-8', 0, bytesRead);
		offset = 0;
		readRedisCmd();
		
		function readRedisCmd() {
			if(offset >= bufSize) return readChunk();
			var offsetAtStart = offset;
			if(str[offset++] !== '*') {
				if(position === aofStat.size) {
					//console.log('the end');
					process.exit();
				}
				console.log(position, aofStat.size);
				console.log('offset', offset, str.substr(offset, 32));
				throw new Error('Parse error, there is no *');
			}
			var argc = parseInt(str.substr(offset), 10);
			//console.log('argc', argc);
			offset+=argc.toString().length+2;
			if(offset >= bufSize) return readChunk();
			var argv = Array(argc);
			for(var i=0;i<argc;i++) {
				if(str[offset++]!=='$') {
					console.log(str.substr(offset, 32));
					throw new Error('str at offset '+(offset-1)+' not $');
				}
				var len = parseInt(str.substr(offset), 10);
				offset+=len.toString().length+2;
				if(offset+len >= bufSize) return readChunk();
				argv[i] = '"'+str.substr(offset, len).replace(/"/g, '\\"')+'"';
				offset+=len+2;
				if(offset >= bufSize) return readChunk();
			}
			position += offset - offsetAtStart;
			//console.log(argv);
			console.log(argv.join(' '));
			setImmediate(readRedisCmd);
		}
	}
}